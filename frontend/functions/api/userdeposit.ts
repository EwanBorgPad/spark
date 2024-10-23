import { jsonResponse } from "./cfPagesFunctionsUtils"
import { Commitment, Connection, Keypair, PublicKey, sendAndConfirmRawTransaction, sendAndConfirmTransaction, Transaction, clusterApiUrl } from "@solana/web3.js"
import { projectSchema, userDepositSchema } from "../../shared/models"
import { signatureSubscribe } from "../../src/utils/solanaFunctions"
type ENV = {
  DB: D1Database
}
export const onRequestPost: PagesFunction<ENV> = async (ctx) => {
  try {
    const connection = new Connection(clusterApiUrl('devnet'),{
      confirmTransactionInitialTimeout: 10000,
      commitment: 'finalized'
    })
    // TODO: all validations and verifications
    const { data, error } = userDepositSchema.safeParse(await ctx.request.json())
    if (error) {
      return jsonResponse({message: "Bad request"}, 400)
    }
    const serializedTransaction = data.transaction
    console.log("Sending transaction!")
    const txId = await sendAndConfirmRawTransaction(connection, Buffer.from(serializedTransaction, 'base64'), {
      preflightCommitment: 'finalized',
      skipPreflight: false,
      commitment: 'finalized',
    })
    console.log("Finished sending the transaction!")
    console.log('Signature status subscribing...')
    const status = await signatureSubscribe(connection, txId)
    console.log(`Signature status finished: ${status}.`)

    const explorerLink = `https://explorer.solana.com/tx/${txId}?cluster=devnet`
    console.log(explorerLink)
    return jsonResponse({ message: "User deposited successfully!" }, 200)
  } catch (e) {
    console.error(e)
    return jsonResponse({ message: "Something went wrong..." }, 500)
  }
}

// Used for CORS debugging problem
export const onRequestOptions: PagesFunction<ENV> = async (ctx) => {
  try {
    return jsonResponse({message: "ok"}, 200)
  } catch (error) {
    return jsonResponse({message: error}, 500)
  }
}