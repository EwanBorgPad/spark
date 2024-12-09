import { jsonResponse, reportError } from "./cfPagesFunctionsUtils"
import { drizzle } from "drizzle-orm/d1"
import { claimTable, depositTable, projectTable } from "../../shared/drizzle-schema"
import { and, desc, eq } from "drizzle-orm"
import { getTokenData } from "../services/constants"
import { addMonths } from "date-fns/addMonths"

type ENV = {
  DB: D1Database
}
export const onRequestGet: PagesFunction<ENV> = async (ctx) => {
  const db = drizzle(ctx.env.DB, { logger: true })
  // mock date for testing
  // const currentDate = new Date('2024-12-25')
  const currentDate = new Date()
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

    const totalUiAmount = deposits.reduce((acc, curr) => acc + Number(curr.json.tokensCalculation.lpPosition.tokenRaw), 0)
    const totalAmount = totalUiAmount * Math.pow(10, decimals)

    // TODO @hardcoded to 6 , the correct value for all current projects (solana-id, moemate, borgy)
    const monthsCount = 6
    const rewardsDistributionStart = project.json.info.timeline.find(timeline => timeline.id === 'REWARD_DISTRIBUTION')?.date

    if (!rewardsDistributionStart) {
      return jsonResponse({ message: 'Reward distribution not started!' }, 409)
    }

    const monthsPassedFromRewardsDistributionStart = monthsPassedFrom(rewardsDistributionStart, currentDate)
    const claimablePerMonth = totalAmount / monthsCount
    const claimedMonths = Math.floor(claimedAmount / claimablePerMonth)

    const payoutSchedule = [
      ...Array(monthsCount).keys(),
    ].map((index) => {
      // @hardcoded
      const payoutDate = addMonths(new Date(rewardsDistributionStart), index)
      const isClaimed = index < (claimedMonths - 1)
      return {
        amount: String(claimablePerMonth / Math.pow(10, decimals)),
        isClaimed,
        date: payoutDate,
      }
    })

    const claimableToThisDateAmount = (monthsPassedFromRewardsDistributionStart + 1) * claimablePerMonth
    const claimableAmount = Math.max(claimableToThisDateAmount - claimedAmount, 0)

    console.log({ monthsPassedFromRewardsDistributionStart, claimablePerMonth, claimableToThisDateAmount, claimedAmount })

    const hasUserClaimedTotalAmount = claimedAmount >= totalAmount
    const hasUserClaimedAvailableAmount = claimedAmount >= claimableAmount

    const hasRewardsDistributionStarted = rewardsDistributionStart && (currentDate > new Date(rewardsDistributionStart))

    const result = {
      hasUserInvested: true,
      hasUserClaimedTotalAmount,
      hasUserClaimedAvailableAmount,
      hasRewardsDistributionStarted,
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
      },
      payoutSchedule,
    }

    return jsonResponse(result, 200)
  } catch (e) {
    await reportError(ctx.env.DB, e)
    return jsonResponse({ message: "Something went wrong..." }, 500)
  }
}

function monthsPassedFrom(date: Date, currentDate?: Date): number {
  const now = currentDate ?? new Date()
  date = new Date(date)
  const yearsDifference = now.getFullYear() - date.getFullYear();
  const monthsDifference = now.getMonth() - date.getMonth();

  return yearsDifference * 12 + monthsDifference;
}
