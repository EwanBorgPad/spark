import { jsonResponse } from "./cfPagesFunctionsUtils"
import { Connection } from "@solana/web3.js"
import { userDepositSchema } from "../../shared/models"
import { signatureSubscribe } from "../../src/utils/solanaFunctions"
import { COMMITMENT_LEVEL } from "../../shared/constants"
import { Buffer } from "buffer"
import { DepositService } from "../services/depositService"
import { getRpcUrlForCluster } from "./eligibilitystatus"

type ENV = {
  DB: D1Database
  SOLANA_RPC_URL: string,
}

/**
 * Post request handler - creates user deposit to the LBP wallet
 * @param ctx 
 * @returns 
 */
export const onRequestPost: PagesFunction<ENV> = async (ctx) => {
  const { SOLANA_RPC_URL } = ctx.env
  const db = ctx.env.DB
  try {
    const { data, error } = userDepositSchema.safeParse(await ctx.request.json())
    if (error) {
      return jsonResponse({message: "Bad request"}, 400)
    }
    const cluster = data.cluster ?? 'devnet'
    const rpcUrl = getRpcUrlForCluster(SOLANA_RPC_URL, cluster)
    const connection = new Connection(rpcUrl,{
      confirmTransactionInitialTimeout: 10000,
      commitment: COMMITMENT_LEVEL
    })
    const { amount, projectId, transaction, walletAddress, lbpAddress, tokenAddress } = data
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
        lbpAddress,
        tokenAddress,
        txId
      }).then(() => {
        console.log("Updated deposited amount successfuly")
      })
    }
    return jsonResponse({ message: "User deposited successfully!", transactionLink: explorerLink}, 200)
  } catch (e) {
    console.error(e)
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