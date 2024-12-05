import { jsonResponse, reportError } from "./cfPagesFunctionsUtils"
import { drizzle } from "drizzle-orm/d1"
import { claimTable, projectTable } from "../../shared/drizzle-schema"
import { and, desc, eq } from "drizzle-orm"
import { getTokenData } from "../services/constants"

type ENV = {
  DB: D1Database
}
const onRequestGet: PagesFunction<ENV> = async (ctx) => {
  const db = drizzle(ctx.env.DB, { logger: true })
  try {
    // parse/validate request
    const { searchParams } = new URL(ctx.request.url)
    const address = searchParams.get("address")
    const projectId = searchParams.get("projectId")

    if (!address) return jsonResponse({ message: 'address is missing!' }, 400)
    if (!projectId) return jsonResponse({ message: 'projectId is missing!' }, 400)

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

    const project = await db
      .select()
      .from(projectTable)
      .where(eq(projectTable.id, projectId))
      .get()

    const cluster = project.cluster ?? 'devnet'
    const tokenAddress = project.json.info.raisedTokenMintAddress

    if (!project) {
      return jsonResponse({ message: 'Project not found!' }, 404)
    }

    const claimedAmount = claims.reduce((acc, curr) => acc + Number(curr.amount), 0)
    const tokenData = getTokenData({ cluster, tokenAddress })

    if (!tokenData) {
      return jsonResponse({ message: 'TokenData not found!' }, 500)
    }

    const decimals = tokenData.decimals

    // TODO @hardcoded
    const totalAmount = 3_600_000_000
    const availableToClaimAmount = totalAmount - claimedAmount

    const result = {
      isAllClaimed: false,
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
      availableToClaimAmount: {
        amount: String(availableToClaimAmount),
        decimals,
        uiAmount: String(availableToClaimAmount / Math.pow(10, decimals)),
      }
    }

    return jsonResponse(result, 200)
  } catch (e) {
    await reportError(ctx.env.DB, e)
    return jsonResponse({ message: "Something went wrong..." }, 500)
  }
}
