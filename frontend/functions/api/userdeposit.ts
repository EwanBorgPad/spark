import { jsonResponse } from "./cfPagesFunctionsUtils"
import { Connection, clusterApiUrl } from "@solana/web3.js"
import { userDepositSchema } from "../../shared/models"
import { signatureSubscribe } from "../../src/utils/solanaFunctions"
import { COMMITMENT_LEVEL } from "../../shared/constants"

// EXPLORER_LINK = https://explorer.solana.com/tx/{txId}?cluster=devnet for devnet
type ENV = {
  DB: D1Database
  SOLANA_RPC_URL: string,
  EXPLORER_LINK: string
}

/**
 * Post request handler - creates user deposit to the LBP wallet
 * @param ctx 
 * @returns 
 */
export const onRequestPost: PagesFunction<ENV> = async (ctx) => {
  const { SOLANA_RPC_URL, EXPLORER_LINK } = ctx.env
  try {
    const connection = new Connection(SOLANA_RPC_URL,{
      confirmTransactionInitialTimeout: 10000,
      commitment: COMMITMENT_LEVEL
    })
    // TODO: all validations and verifications
    const { data, error } = userDepositSchema.safeParse(await ctx.request.json())
    if (error) {
      return jsonResponse({message: "Bad request"}, 400)
    }
    const serializedTransaction = data.transaction
    console.log("Sending transaction!")
    const txId = await connection.sendRawTransaction(Buffer.from(serializedTransaction, 'base64'), {
      preflightCommitment: COMMITMENT_LEVEL,
      skipPreflight: false
    })
    console.log("Finished sending the transaction!")
    console.log('Signature status subscribing...')
    const status = await signatureSubscribe(connection, txId)
    console.log(`Signature status finished: ${status}.`)
    const explorerLink = EXPLORER_LINK.replace("{txId}", txId)
    console.log(explorerLink)
    return jsonResponse({ message: "User deposited successfully!", transactionLink: explorerLink}, 200)
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