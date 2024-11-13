import { drizzle } from "drizzle-orm/d1"
import { Connection, Transaction } from "@solana/web3.js"
import { Buffer } from "buffer"

import { jsonResponse, reportError } from "./cfPagesFunctionsUtils"
import { userDepositSchema } from "../../shared/models"
import { signatureSubscribe } from "../../src/utils/solanaFunctions"
import { COMMITMENT_LEVEL } from "../../shared/constants"
import { DepositService } from "../services/depositService"
import { ProjectService } from "../services/projectService"
import { EligibilityService } from "../services/eligibilityService"
import { getRpcUrlForCluster } from "../../shared/solana/rpcUtils"
import { decodeBase64 } from "tweetnacl-util"

type ENV = {
  DB: D1Database
  SOLANA_RPC_URL: string,
  LBP_WALLET_ADDRESS: string
}
/**
 * Post request handler - creates user deposit to the LBP wallet
 * @param ctx 
 * @returns 
 */
export const onRequestPost: PagesFunction<ENV> = async (ctx) => {
  const { SOLANA_RPC_URL, LBP_WALLET_ADDRESS } = ctx.env
  // TODO: refactor all services to use DrizzleDb
  const db = ctx.env.DB
  const drizzleDb = drizzle(ctx.env.DB, { logger: true })
  try {
    // Parse request
    const { data, error } = userDepositSchema.safeParse(await ctx.request.json())
    if (error) {
      return jsonResponse({message: "Bad request"}, 400)
    }
    // TODO: Extract amount from deserialized tx (figure out how)
    // TODO: Currently only works if user inputs integer values for token deposit (does not work for floating point because we extract amount as float for now)
    const { amount, projectId, transaction, tokenAddress } = data

    // data loading
    const deserializedTx = Transaction.from(decodeBase64(transaction))
    const userWalletAddress = deserializedTx.signatures[0].publicKey.toBase58()

    const project = await ProjectService.findProjectById({db, id: projectId})

    if (!project) {
      return jsonResponse({ message: "Project not found!"}, 404)
    }

    const userTotalDepositAmount = await DepositService.getUsersDepositedAmount({
      db,
      projectId,
      walletAddress: userWalletAddress
    })

    const cluster = project?.cluster ?? 'devnet'
    const rpcUrl = getRpcUrlForCluster(SOLANA_RPC_URL, cluster)
    const connection = new Connection(rpcUrl,{
      commitment: COMMITMENT_LEVEL
    })
  
    ///////////////////////////////////////////////////
    ////////////////// Data Loading ///////////////////
    ///////////////////////////////////////////////////

    const projectTokenLimit = project.info.raisedTokenMaxCap
    if (!projectTokenLimit)
      return jsonResponse({ message: "Project cap is not defined"}, 500)

    const eligibilityStatus = await EligibilityService.getEligibilityStatus({
      address: userWalletAddress,
      db: drizzleDb,
      projectId,
      rpcUrl,
    })

    if (!eligibilityStatus.eligibilityTier) {
      return jsonResponse({ message: 'User is not eligible!' }, 409)
    }

    const eligibilityTier = eligibilityStatus.eligibilityTier
    const tierId = eligibilityTier.id

    const minInvestmentPerUser = BigInt(eligibilityTier.benefits.minInvestment)
    const maxInvestmentPerUser = BigInt(eligibilityTier.benefits.maxInvestment)

    const projectTotalDepositedAmount = await DepositService.getProjectsDepositedAmount({ db, projectId })

    // checking user tier limitations and project cap limitations
    if (minInvestmentPerUser === undefined || minInvestmentPerUser === null) {
      return jsonResponse({ message: "Minimum investment for your tier is not defined!" }, 500)
    }
    if (!maxInvestmentPerUser) {
      return jsonResponse({ message: "Maximum investment for your tier is not defined!" }, 500)
    }

    ///////////////////////////////////////////////////
    ///////////////////// CHECKS //////////////////////
    ///////////////////////////////////////////////////

    if (!eligibilityStatus.isEligible || !eligibilityStatus.eligibilityTier) {
      return jsonResponse({ message: 'User is not eligible!' }, 409)
    }

    // TODO: take into account the userTotalDepositAmount instead of just amount for below checks

    if (BigInt(amount) + userTotalDepositAmount  < minInvestmentPerUser) {
      return jsonResponse({ message: `Investment amount (${amount}) is less than the minimum amount for your eligibility tier (${minInvestmentPerUser})`}, 409)
    }

    if (BigInt(amount) + userTotalDepositAmount > maxInvestmentPerUser) {
      return jsonResponse({ message: `Investment amount (${amount}) is more than the maximum amount for your eligibility tier (${maxInvestmentPerUser})`}, 409)
    }

    const totalAmount = BigInt(amount) + projectTotalDepositedAmount
    console.log(projectTotalDepositedAmount)
    if (totalAmount > projectTokenLimit) {
      return jsonResponse({ message: `The total investment amount exceeds the project token cap!` }, 409)
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
      await DepositService.createUserDeposit({
        db,
        amount: BigInt(amount).toLocaleString(),
        projectId,
        walletAddress: userWalletAddress,
        tokenAddress,
        txId,
        lbpAddress: LBP_WALLET_ADDRESS, 
        tierId
      })
    }
    return jsonResponse({ message: "Ok!", transactionLink: explorerLink }, 200)
  } catch (e) {
    await reportError(db, e)
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

    return jsonResponse({ depositedAmount: depositedAmount.toString() }, 200)
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
