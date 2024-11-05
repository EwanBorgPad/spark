import { jsonResponse } from "./cfPagesFunctionsUtils"
import { Connection } from "@solana/web3.js"
import { userDepositSchema } from "../../shared/models"
import { signatureSubscribe } from "../../src/utils/solanaFunctions"
import { COMMITMENT_LEVEL } from "../../shared/constants"
import { Buffer } from "buffer"
import { DepositService } from "../services/depositService"

type ENV = {
  DB: D1Database
  SOLANA_RPC_URL: string,
  CLUSTER_NAME: string
}

/**
 * Post request handler - creates user deposit to the LBP wallet
 * @param ctx 
 * @returns 
 */
export const onRequestPost: PagesFunction<ENV> = async (ctx) => {
  const { SOLANA_RPC_URL, CLUSTER_NAME } = ctx.env
  const db = ctx.env.DB
  try {
    const connection = new Connection(SOLANA_RPC_URL,{
      confirmTransactionInitialTimeout: 10000,
      commitment: COMMITMENT_LEVEL
    })
    // TODO: all validations and verifications - IMO should be done on frontend because thats where we make the transaction and sign it
    /*
      List of checks that needs to be implemented provided by Yann on slack
      Check the user eligible
      Check the amount the user deposit is in a defined range [min deposit amount, max deposit amount]
      Check current deposited amount + user deposit amount < max cap -> need DB integration and tracking users deposits for this
      Check the user have enough funds in his wallet to perform the deposit -> I would validate this on frontend before signing the transaction
      Check that we are within the time window of the fund collection phase
    */
    const { data, error } = userDepositSchema.safeParse(await ctx.request.json())
    if (error) {
      return jsonResponse({message: "Bad request"}, 400)
    }
    const { amount, projectId, transaction, walletAddress } = data
    console.log("Sending transaction...")
    const txId = await connection.sendRawTransaction(Buffer.from(transaction, 'base64'), {
      preflightCommitment: COMMITMENT_LEVEL,
      skipPreflight: false
    })
    console.log("Finished sending the transaction...")
    console.log('Signature status subscribing...')
    const status = await signatureSubscribe(connection, txId)
    console.log(`Signature status finished: ${status}.`)
    const explorerLink = `https://explorer.solana.com/tx/${txId}?cluster=${CLUSTER_NAME}`
    console.log(explorerLink)
    if (status === 'confirmed') {
      await DepositService.updateUserDepositAmount({
        db,
        amount,
        projectId,
        walletAddress
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