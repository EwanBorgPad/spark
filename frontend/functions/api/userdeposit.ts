import { drizzle } from "drizzle-orm/d1"
import { Connection, Transaction } from "@solana/web3.js"
import { Buffer } from "buffer"

import { jsonResponse, reportError } from "./cfPagesFunctionsUtils"
import { userDepositSchema } from "../../shared/models"
import { signatureSubscribe } from "../../src/utils/solanaFunctions"
import { COMMITMENT_LEVEL, TOKEN_PROGRAM } from "../../shared/constants"
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
    // validate env
    if (!LBP_WALLET_ADDRESS) {
      throw new Error('Misconfigured env, LBP_WALLET_ADDRESS is missing!')
    }
    // Parse request
    const { data, error } = userDepositSchema.safeParse(await ctx.request.json())
    if (error) {
      return jsonResponse({message: "Bad request"}, 400)
    }

    const { projectId, transaction } = data

    ///////////////////////////////////////////////////
    ////////////////// Data Loading ///////////////////
    ///////////////////////////////////////////////////

    const project = await ProjectService.findProjectById({ db, id: projectId })
    if (!project) {
      return jsonResponse({ message: "Project not found!"}, 404)
    }

    // getting connection to the RPC
    const cluster = project?.cluster ?? 'devnet'
    const rpcUrl = getRpcUrlForCluster(SOLANA_RPC_URL, cluster)
    const connection = new Connection(rpcUrl,{
      commitment: COMMITMENT_LEVEL
    })

    const deserializedTransaction = await deserializeTransaction({ serializedTx: transaction, connection})

    const {
      depositAmount,
      fromAddress: userWalletAddress,
      decimalMultiplier,
      nftAddress
    } = deserializedTransaction

    // check if transaction token matches the project token
    if (project.info.raisedTokenMintAddress !== deserializedTransaction.tokenMintAddress) {
      const message = `Raised token mint address missmatch (${project.info.raisedTokenMintAddress}===${deserializedTransaction.tokenMintAddress})!`
      throw new Error(message)
    }

    // check if transaction recipient matches the pool wallet
    if (LBP_WALLET_ADDRESS !== deserializedTransaction.toAddress) {
      const message = `To address missmatch (${LBP_WALLET_ADDRESS}===${deserializedTransaction.toAddress})!`
      throw new Error(message)
    }

    if (!depositAmount) {
      return jsonResponse({ message: "No deposit amount found in transaction!"}, 500)
    }
    if (!userWalletAddress) {
      return jsonResponse({ message: "No user wallet address found in transaction!"}, 500)
    }

    const userTotalDepositAmount = await DepositService.getUsersDepositedAmount({
      db,
      projectId,
      walletAddress: userWalletAddress
    })

    const projectTokenLimit = BigInt(project.info.raisedTokenMaxCap) * decimalMultiplier
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

    const minInvestmentPerUser = BigInt(eligibilityTier.benefits.minInvestment) * decimalMultiplier
    const maxInvestmentPerUser = BigInt(eligibilityTier.benefits.maxInvestment) * decimalMultiplier

    const projectTotalDepositedAmount = await DepositService.getProjectsDepositedAmount({ db, projectId })

    const totalAmount = depositAmount + projectTotalDepositedAmount

    // checking user tier limitations and project cap limitations
    if (!minInvestmentPerUser) {
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

    // commented out for testing on mainnet so that we don't waste real money
    // if ((depositAmount + userTotalDepositAmount) < minInvestmentPerUser) {
    //   return jsonResponse({ message: `Investment amount (${depositAmount}) is less than the minimum amount for your eligibility tier (${minInvestmentPerUser})`}, 409)
    // }
    //
    // if ((depositAmount + userTotalDepositAmount) > maxInvestmentPerUser) {
    //   return jsonResponse({ message: `Investment amount (${depositAmount}) is more than the maximum amount for your eligibility tier (${maxInvestmentPerUser})`}, 409)
    // }

    if (totalAmount > projectTokenLimit) {
      return jsonResponse({ message: `The total investment amount exceeds the project token cap!` }, 409)
    }

    // TODO check if in correct phase (sale phase)

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
        amount: depositAmount.toString(),
        projectId,
        walletAddress: userWalletAddress,
        tokenAddress: deserializedTransaction.tokenMintAddress,
        txId,
        lbpAddress: deserializedTransaction.toAddress,
        tierId,
        nftAddress
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

type DeserializeTransactionArgs = {
  serializedTx: string
  connection: Connection
}
type DeserializeTransactionResult = {
  fromAddress: string
  toAddress: string
  tokenMintAddress: string
  depositAmount: bigint
  decimalMultiplier: bigint,
  nftAddress: string
}
async function deserializeTransaction({ serializedTx, connection }: DeserializeTransactionArgs): Promise<DeserializeTransactionResult> {
  // deserializing transaction
  const deserializedTx = Transaction.from(decodeBase64(serializedTx))
  // TODO: check the number of instructions after implementing minting nft
  // if (deserializedTx.instructions.length !== 3) {
  //   const message = `DeserializeTransaction: invalid transaction instructions length (${deserializedTx.instructions.length})!`
  //   throw new Error(message)
  // }

  // extracting our transfer instruction from the deserialized transaction by using programId and first byte === 3 (standard for transfer instructions)
  const transferInstruction = deserializedTx.instructions
    .find(i => i.programId.toBase58() === TOKEN_PROGRAM && i.data.readUInt8(0) === 3)
  if (!transferInstruction) {
    throw new Error('No transfer instruction found in transaction!')
  }

  // extracting our transfer instruction from the deserialized transaction by using programId and first byte === 0 (standard for initialize mint account instruction)
  const mintInstruction = deserializedTx.instructions
    .find(i => i.programId.toBase58() === TOKEN_PROGRAM && i.data.readUInt8(0) === 0)

  // extracting amount in lamports (BigInt) and users wallet address from instruction data
  const depositAmount = transferInstruction.data.readBigUInt64LE(1)
  const toAddress = transferInstruction.keys[4].pubkey.toBase58()
  const fromAddress = transferInstruction.keys[2].pubkey.toBase58()
  // we need token mint address to extract how much decimals the token uses
  const tokenMintAddress = transferInstruction.keys[3].pubkey
  const mintAccountInfo = await connection.getAccountInfo(tokenMintAddress)

  const nftAddress = mintInstruction.keys[0].pubkey.toBase58()

  if (!mintAccountInfo) {
    throw new Error('Mint account not found in transaction!')
  }

  // TODO: get decimals from project.json (person who creates project puts decimals for the raisedTokenMint)
  // The decimals are located at 44th byte for USDC devnet coin (TODO: Check if all coins work like this)
  const decimals = BigInt(mintAccountInfo.data[44])
  const decimalMultiplier = BigInt(10) ** decimals

  return {
    fromAddress,
    toAddress,
    depositAmount,
    tokenMintAddress: tokenMintAddress.toBase58(),
    decimalMultiplier,
    nftAddress
  }
}
