import { drizzle } from "drizzle-orm/d1"
import { eq } from "drizzle-orm"
import { depositTable } from "../../shared/drizzle-schema"
import { jsonResponse, reportError } from "./cfPagesFunctionsUtils"

type ENV = {
  DB: D1Database
}

export const onRequestGet: PagesFunction<ENV> = async (ctx) => {
  const db = drizzle(ctx.env.DB, { logger: true })
  try {
    // parse request
    const { searchParams } = new URL(ctx.request.url)
    const projectId = searchParams.get("projectId")

    // validate request
    if (!projectId) {
      return jsonResponse({
        message: "Must provide projectId arg!"
      }, 400)
    }

    // get all deposits for the project
    const deposits = await db
      .select()
      .from(depositTable)
      .where(eq(depositTable.projectId, projectId))
      .all()

    // Transform the data to match the expected format
    const tokenDistributionData = deposits.map(deposit => ({
      transactionId: deposit.transactionId,
      createdAt: deposit.createdAt,
      fromAddress: deposit.fromAddress,
      amountDeposited: deposit.amountDeposited,
      tokenAddress: deposit.tokenAddress,
      projectId: deposit.projectId,
      tierId: deposit.tierId,
      nftAddress: deposit.nftAddress,
      json: deposit.json
    }))

    return jsonResponse({ data: tokenDistributionData }, {
      headers: {
        "Cache-Control": "public, max-age=15",
      }
    })
  } catch (e) {
    await reportError(ctx.env.DB, e)
    return jsonResponse({ message: "Something went wrong..." }, 500)
  }
} 