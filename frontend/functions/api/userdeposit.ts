import { jsonResponse } from "./cfPagesFunctionsUtils"
import { Connection } from "@solana/web3.js"
import { userDepositSchema } from "../../shared/models"
import { signatureSubscribe } from "../../src/utils/solanaFunctions"
import { COMMITMENT_LEVEL } from "../../shared/constants"
import { Buffer } from "buffer"
import { DepositService } from "../services/depositService"
import { getRpcUrlForCluster } from "./eligibilitystatus"
import { ProjectService } from "../services/projectService"
import { EligibilityService } from "../services/eligibilityService"
import { drizzle, DrizzleD1Database } from "drizzle-orm/d1"

type ENV = {
  DB: D1Database
  SOLANA_RPC_URL: string,
  LBP_ADDRESS: string
}

/**
 * Post request handler - creates user deposit to the LBP wallet
 * @param ctx 
 * @returns 
 */
export const onRequestPost: PagesFunction<ENV> = async (ctx) => {
  const { SOLANA_RPC_URL, LBP_ADDRESS } = ctx.env
  // TODO: refactor all services to use DrizzleDb
  const db = ctx.env.DB
  const drizzleDb = drizzle(ctx.env.DB, { logger: true })
  try {
    // Parse request
    const { data, error } = userDepositSchema.safeParse(await ctx.request.json())
    if (error) {
      return jsonResponse({message: "Bad request"}, 400)
    }
    const { amount, projectId, transaction, walletAddress, tokenAddress } = data

    // All validations
    const project = await ProjectService.findProjectById({db, id: projectId})
    const projectTokenLimit = project?.info.raisedTokenMaxCap
    const depositedAmount: number = await DepositService.getUsersDepositedAmount({
      db,
      projectId,
      walletAddress
    })
    const cluster = project?.cluster ?? 'devnet'
    const rpcUrl = getRpcUrlForCluster(SOLANA_RPC_URL, cluster)
    const connection = new Connection(rpcUrl,{
      confirmTransactionInitialTimeout: 10000,
      commitment: COMMITMENT_LEVEL
    })
    const eligibilityData = await EligibilityService.getEligibilityStatus({
      address: walletAddress,
      db: drizzleDb,
      projectId,
      rpcUrl
    })
    // checking user eligibility
    if (!eligibilityData.isEligible) return jsonResponse({ message: "You are not eligible to make a deposit!"}, 401)
    const maxInvestment = eligibilityData.eligibilityTier?.benefits.maxInvestment
    const minInvestment = eligibilityData.eligibilityTier?.benefits.minInvestment
    // checking user tier limitations and project cap limitations
    if (!minInvestment) return jsonResponse({ message:"Minimum investment for your tier is not defined!"}, 500)
    if (!maxInvestment) return jsonResponse({ message:"Maximum investment for your tier is not defined!"}, 500)
    if (!projectTokenLimit) return jsonResponse({ message: "Project cap is not defined"}, 500)
    if (amount < parseInt(minInvestment) || amount > parseInt(maxInvestment)) {
      return jsonResponse({ message: `Your amount exceeds token limits for your tier. Minimum amount is : ${minInvestment} and maximum amount is : ${maxInvestment}`}, 401)
    }
    if (amount + depositedAmount > projectTokenLimit) {
      return jsonResponse({ message: `Your amount exceeds token limit for the project token cap`}, 401)
    }

    // After all validations passed we send the tx
    console.log("Sending transaction...")
    const txId = await connection.sendRawTransaction(Buffer.from(transaction, 'base64'))
    console.log("Finished sending the transaction...")
    console.log('Signature status subscribing...')
    const status = await signatureSubscribe(connection, txId)
    console.log(`Signature status finished: ${status}.`)
    const explorerLink = `https://explorer.solana.com/tx/${txId}?cluster=${cluster}`
    console.log(explorerLink)
    if (status === 'confirmed') {
      await DepositService.updateUserDepositAmount({
        db,
        amount,
        projectId,
        walletAddress,
        tokenAddress,
        txId,
        lbpAddress: LBP_ADDRESS
      })
    }
    return jsonResponse({ message: "User deposited successfully!", transactionLink: explorerLink}, 200)
  } catch (e) {
    console.error(e)
    // @ts-expect-error
    if (e.message.includes('failed to deserialize')) {
      return jsonResponse({ message: "Your transaction cannot be deserialized. Please make sure you signed the transaction!"}, 400)
    }
    return jsonResponse({ message: "Something went wrong..." }, 500)
  }
}

/**
 * Get request handler - gets the amount user has deposited to the projects LBP
 * @param ctx 
 * @returns amount the user has deposited to the LBP
 */
export const onRequestGet: PagesFunction<ENV> = async (ctx) => {
  const db = ctx.env.DB
  try {
    //// validate request
    const { searchParams } = new URL(ctx.request.url)
    const projectId = searchParams.get("projectId")
    const walletAddress = searchParams.get("walletAddress")
    if (!projectId) return jsonResponse({ message: 'projectId is missing!' }, 400)
    if (!walletAddress) return jsonResponse({ message: 'walletAddress is missing!' }, 400)

    const depositedAmount = await DepositService.getUsersDepositedAmount({
        db,
        projectId,
        walletAddress
    })
    if (!depositedAmount) return jsonResponse({ depositedAmount: 0}, 200)

    return jsonResponse({ depositedAmount: depositedAmount.amount_deposited }, 200)
  } catch (e) {
    console.error(e)
    return jsonResponse({ message: "Something went wrong..." }, 500)
  }
}

// Used for CORS debugging problem
export const onRequestOptions: PagesFunction<ENV> = async (ctx) => {
  try {
    return new Response(null, {
      status: 204,
      headers: {
          'Access-Control-Allow-Origin': 'http://localhost:5173', // Adjust this to frontends origin
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
  })
  } catch (error) {
    return jsonResponse({message: error}, 500)
  }
}