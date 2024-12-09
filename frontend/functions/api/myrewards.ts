import { jsonResponse, reportError } from "./cfPagesFunctionsUtils"
import { drizzle } from "drizzle-orm/d1"
import { claimTable, depositTable, projectTable } from "../../shared/drizzle-schema"
import { and, desc, eq } from "drizzle-orm"
import { getTokenData } from "../services/constants"

type ENV = {
  DB: D1Database
}
export const onRequestGet: PagesFunction<ENV> = async (ctx) => {
  const db = drizzle(ctx.env.DB, { logger: true })
  try {
    // parse/validate request
    const { searchParams } = new URL(ctx.request.url)
    const address = searchParams.get("address")
    const projectId = searchParams.get("projectId")

    if (!address) return jsonResponse({ message: 'address is missing!' }, 400)
    if (!projectId) return jsonResponse({ message: 'projectId is missing!' }, 400)

    // load project
    const project = await db
      .select()
      .from(projectTable)
      .where(eq(projectTable.id, projectId))
      .get()

    if (!project) return jsonResponse({ error: 'Error: project not found!' }, 500)
    const cluster = project.json.cluster ?? 'devnet'
    const launchedTokenMintAddress = project.json.info.launchedTokenMintAddress

    if (!project) {
      return jsonResponse({ message: 'Project not found!' }, 404)
    }

    // load deposits and claims
    const deposits = await db
      .select()
      .from(depositTable)
      .where(
        and(
          eq(depositTable.fromAddress, address),
          eq(depositTable.projectId, projectId),
        )
      )
      .all()

    if (!deposits.length) {
      return jsonResponse({ hasUserInvested: false }, 200)
    }

    const claims = await db
      .select()
      .from(claimTable)
      .where(
        and(
          eq(claimTable.toAddress, address),
          eq(claimTable.projectId, projectId),
        )
      )
      .orderBy(desc(claimTable.createdAt))
      .all()

    const claimedAmount = claims.reduce((acc, curr) => acc + Number(curr.amount), 0)
    const launchedTokenData = getTokenData({ cluster, tokenAddress: launchedTokenMintAddress })

    if (!launchedTokenData) {
      return jsonResponse({ message: 'TokenData not found!' }, 500)
    }

    const decimals = launchedTokenData.decimals

    const totalAmount = deposits.reduce((acc, curr) => acc + Number(curr.json.tokensCalculation.tokenRaw), 0) * Math.pow(10, decimals)
    const claimableAmount = totalAmount - claimedAmount

    const hasUserClaimedTotalAmount = claimedAmount >= totalAmount
    const hasUserClaimedAvailableAmount = claimedAmount >= claimableAmount

    const result = {
      hasUserInvested: true,
      hasUserClaimedTotalAmount,
      hasUserClaimedAvailableAmount,
      totalAmount: {
        amount: String(totalAmount),
        decimals,
        uiAmount: String(totalAmount / Math.pow(10, decimals)),
      },
      claimedAmount: {
        amount: String(claimedAmount),
        decimals,
        uiAmount: String(claimedAmount / Math.pow(10, decimals)),
      },
      claimableAmount: {
        amount: String(claimableAmount),
        decimals,
        uiAmount: String(claimableAmount / Math.pow(10, decimals)),
      }
    }

    return jsonResponse(result, 200)
  } catch (e) {
    await reportError(ctx.env.DB, e)
    return jsonResponse({ message: "Something went wrong..." }, 500)
  }
}
