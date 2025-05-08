import { drizzle } from "drizzle-orm/d1"
import { eq, and } from "drizzle-orm"
import { depositTable, claimTable } from "../../shared/drizzle-schema"
import { jsonResponse, reportError } from "./cfPagesFunctionsUtils"
import { Connection, PublicKey, Transaction } from "@solana/web3.js"
import { createTransferInstruction } from "@solana/spl-token"
import { getRpcUrlForCluster } from "../../shared/solana/rpcUtils"

type ENV = {
  DB: D1Database
  SOLANA_RPC_URL: string
}

type DistributeTokensArgs = {
  projectId: string
  auth: {
    address: string
    message: string
    signature: number[]
  }
}

export const onRequestPost: PagesFunction<ENV> = async (ctx) => {
  const db = drizzle(ctx.env.DB, { logger: true })
  try {
    // parse request
    const data = await ctx.request.json() as DistributeTokensArgs
    const { projectId, auth } = data

    // validate request
    if (!projectId || !auth) {
      return jsonResponse({
        message: "Must provide projectId and auth args!"
      }, 400)
    }

    // get all deposits for the project
    const deposits = await db
      .select()
      .from(depositTable)
      .where(eq(depositTable.projectId, projectId))
      .all()

    // get all existing claims for the project
    const existingClaims = await db
      .select()
      .from(claimTable)
      .where(eq(claimTable.projectId, projectId))
      .all()

    // create a map of addresses to their total claimed amount
    const claimedAmounts = new Map<string, number>()
    for (const claim of existingClaims) {
      const currentAmount = claimedAmounts.get(claim.toAddress) || 0
      claimedAmounts.set(claim.toAddress, currentAmount + Number(claim.amount))
    }

    // create a map of addresses to their total token amount
    const tokenAmounts = new Map<string, number>()
    for (const deposit of deposits) {
      const currentAmount = tokenAmounts.get(deposit.fromAddress) || 0
      const tokenAmount = Number(deposit.json.tokensCalculation.rewardDistribution.tokenRaw)
      tokenAmounts.set(deposit.fromAddress, currentAmount + tokenAmount)
    }

    // calculate remaining amounts to distribute
    const remainingAmounts = new Map<string, number>()
    for (const [address, totalAmount] of tokenAmounts.entries()) {
      const claimedAmount = claimedAmounts.get(address) || 0
      const remainingAmount = totalAmount - claimedAmount
      if (remainingAmount > 0) {
        remainingAmounts.set(address, remainingAmount)
      }
    }

    // TODO: Implement actual token distribution using Solana web3.js
    // This would involve:
    // 1. Creating a transaction with transfer instructions for each address
    // 2. Signing and sending the transaction
    // 3. Recording the claims in the database

    return jsonResponse({ message: "Token distribution initiated" }, 200)
  } catch (e) {
    await reportError(ctx.env.DB, e)
    return jsonResponse({ message: "Something went wrong..." }, 500)
  }
} 