import { jsonResponse, reportError } from "./cfPagesFunctionsUtils"
import { drizzle } from "drizzle-orm/d1"
import { Connection, PublicKey, Keypair } from "@solana/web3.js"
import { DynamicBondingCurveClient } from "@meteora-ag/dynamic-bonding-curve-sdk"
import BN from "bn.js"
import bs58 from "bs58"

type ENV = {
  DB: D1Database
  RPC_URL: string
  PRIVATE_KEY: string
}

interface ClaimCreatorTradingFeeRequest {
  pool: string // The pool address
  creator: string // The wallet that will claim the fee (must be the pool creator)
  maxBaseAmount: string // The maximum base amount to claim (use "0" to not claim base tokens)
  maxQuoteAmount: string // The maximum quote amount to claim (use "0" to not claim quote tokens)
}

export const onRequestPost: PagesFunction<ENV> = async (ctx) => {
  const db = drizzle(ctx.env.DB, { logger: true })
  try {
    // parse request body
    const requestBody: ClaimCreatorTradingFeeRequest = await ctx.request.json()
    const { pool, creator, maxBaseAmount, maxQuoteAmount } = requestBody

    // validate required fields
    if (!pool || !creator || maxBaseAmount === undefined || maxQuoteAmount === undefined) {
      return jsonResponse({
        message: "Must provide pool, creator, maxBaseAmount, and maxQuoteAmount parameters!"
      }, 400)
    }

    // validate address formats
    let poolPubKey: PublicKey
    let creatorPubKey: PublicKey
    try {
      poolPubKey = new PublicKey(pool)
      creatorPubKey = new PublicKey(creator)
    } catch (error) {
      return jsonResponse({
        message: "Invalid pool or creator address format!"
      }, 400)
    }

    // validate amount formats
    let maxBaseAmountBN: BN
    let maxQuoteAmountBN: BN
    try {
      maxBaseAmountBN = new BN(maxBaseAmount)
      maxQuoteAmountBN = new BN(maxQuoteAmount)
    } catch (error) {
      return jsonResponse({
        message: "Invalid maxBaseAmount or maxQuoteAmount format!"
      }, 400)
    }

    // initialize wallet from private key
    const privateKeyString = ctx.env.PRIVATE_KEY
    if (!privateKeyString || typeof privateKeyString !== 'string') {
      throw new Error('Invalid private key format')
    }

    const privateKeyUint8Array = bs58.decode(privateKeyString)
    const wallet = Keypair.fromSecretKey(privateKeyUint8Array)

    // initialize Solana connection and DBC client
    const connection = new Connection(ctx.env.RPC_URL, "confirmed")
    const client = new DynamicBondingCurveClient(connection, "confirmed")

    // create the claim creator trading fee transaction
    const transaction = await client.creator.claimCreatorTradingFee({
      pool: poolPubKey,
      creator: creatorPubKey,
      payer: wallet.publicKey,
      maxBaseAmount: maxBaseAmountBN,
      maxQuoteAmount: maxQuoteAmountBN
    })

    // set recent blockhash and fee payer
    const { blockhash } = await connection.getLatestBlockhash()
    transaction.recentBlockhash = blockhash
    transaction.feePayer = wallet.publicKey

    // sign the transaction
    transaction.sign(wallet)

    // send the signed transaction
    const signature = await connection.sendRawTransaction(transaction.serialize(), {
      skipPreflight: false,
      preflightCommitment: 'confirmed'
    })

    // wait for confirmation
    await connection.confirmTransaction(signature, 'confirmed')

    return jsonResponse({
      pool,
      creator,
      maxBaseAmount,
      maxQuoteAmount,
      signature,
      success: true
    }, 200)

  } catch (e) {
    await reportError(ctx.env.DB, e)
    return jsonResponse({ message: "Something went wrong..." }, 500)
  }
} 