import { DrizzleD1Database } from "drizzle-orm/d1/driver"
import { depositTable, projectTable } from "../../shared/drizzle-schema"
import { eq, sql } from "drizzle-orm"
import { jsonResponse } from "../api/cfPagesFunctionsUtils"
import { getTokenData } from "./constants"
import { exchangeService } from "./exchangeService"
import { SaleResults } from "../../shared/models"

/**
 * raiseTarget is multiplied by this value to get corrected raise target (account for overflows)
 * 0.99 means 1 percent LESS than the raiseTarget
 * 1 means the same as raiseTarget
 * 1.01 means 1 percent MORE than the raiseTarget
 */
const RAISE_TARGET_FACTOR = 1.01

type GetSaleResultsArgs = {
  db: DrizzleD1Database
  projectId: string
}
const getSaleResults = async ({ db, projectId }: GetSaleResultsArgs): Promise<SaleResults | Response> => {
  // load project
  const project = await db
    .select()
    .from(projectTable)
    .where(eq(projectTable.id, projectId))
    .get()

  if (!project)
    return jsonResponse({ message: `Project not found (id=${projectId})!` }, 404)

  const cluster = project.json.cluster
  const tokenAddress = project.json.info.raisedTokenMintAddress

  // load sale results
  const queryResult: { fromAddress: string, totalAmountPerUser: string }[] = await db
    .select({
      fromAddress: depositTable.fromAddress,
      totalAmountPerUser: sql`SUM(${depositTable.amountDeposited})`.as('totalAmountPerUser'),
    })
    .from(depositTable)
    .groupBy(depositTable.fromAddress)
    .where(eq(depositTable.projectId, projectId))
    .all()

  const participantsCount = queryResult?.length ?? 0
  const totalAmount = queryResult?.reduce((acc, curr) => acc + Number(curr.totalAmountPerUser), 0) ?? 0
  const averageAmount = (totalAmount / participantsCount) ?? 0

  // prepare response
  const tokenData = getTokenData({ cluster, tokenAddress })

  if (!tokenData) {
    return jsonResponse({ message: 'Unknown token!' }, 500)
  }

  const exchangeData = await exchangeService.getExchangeData({
    db,
    baseCurrency: tokenData.coinGeckoName,
    targetCurrency: 'usd',
  })

  // TODO @hardcoded
  if (project.id === 'borgy') {
    exchangeData.currentPrice = 0.341783
  }

  const priceInUsd = exchangeData.currentPrice

  const decimals = tokenData.decimals

  const raiseTargetInUsd = Number(project.json.info.tge.raiseTarget)

  if (raiseTargetInUsd < 1) {
    return jsonResponse({ message: 'Something went wrong... ' }, 500)
  }

  const totalAmountRaisedInUsd = (totalAmount / (10 ** decimals)) * priceInUsd
  const raiseTargetReached = (raiseTargetInUsd * RAISE_TARGET_FACTOR) <= totalAmountRaisedInUsd

  const response = {
    raiseTargetInUsd: String(raiseTargetInUsd),
    raiseTargetReached,
    totalAmountRaised: {
      amount: String(totalAmount),
      decimals,
      uiAmount: String(totalAmount / (10 ** decimals)),
      amountInUsd: String(totalAmountRaisedInUsd),
      tokenPriceInUsd: String(priceInUsd),
    },
    averageDepositAmount: {
      amount: String(averageAmount),
      decimals,
      uiAmount: String(averageAmount / (10 ** decimals)),
      amountInUsd: String((averageAmount / (10 ** decimals)) * priceInUsd),
      tokenPriceInUsd: String(priceInUsd),
    },
    participantsCount,
    sellOutPercentage: (Number(totalAmountRaisedInUsd) / Number(raiseTargetInUsd)) * 100,
    // TODO @hardcoded below
    marketCap: 50_000,
    fdv: project.json.info.tge.fdv,
  }

  return response
}


export const SaleResultsService = {
  getSaleResults,
}
