import { DrizzleD1Database } from "drizzle-orm/d1/driver"
import { depositTable, projectTable } from "../../shared/drizzle-schema"
import { eq, sql } from "drizzle-orm"
import { jsonResponse } from "../api/cfPagesFunctionsUtils"
import { getTokenData } from "./constants"
import { exchangeService } from "./exchangeService"
import { SaleResults } from "../../shared/models"

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
  const resultSum = await db
    .select({
      totalAmount: sql`SUM(${depositTable.amountDeposited})`.as('totalAmount'),
    })
    .from(depositTable)
    .where(eq(depositTable.projectId, projectId))
    .get()

  const resultGroupBy = await db
    .select({
      averageAmount: sql`AVG(${depositTable.amountDeposited})`.as('averageAmount'),
      totalCount: sql`COUNT(${depositTable.fromAddress})`.as('totalCount'),
    })
    .from(depositTable)
    .groupBy(depositTable.fromAddress)
    .where(eq(depositTable.projectId, projectId))
    .get()

  const totalAmount = Number(resultSum?.totalAmount ?? 0)
  const averageAmount = Number(resultGroupBy?.averageAmount ?? 0)
  const totalCount = Number(resultGroupBy?.totalCount ?? 0)

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
  const raiseTargetReached = raiseTargetInUsd <= totalAmountRaisedInUsd

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
      decimals: decimals,
      uiAmount: String(averageAmount / (10 ** decimals)),
      amountInUsd: String((averageAmount / (10 ** decimals)) * priceInUsd),
      tokenPriceInUsd: String(priceInUsd),
    },
    participantsCount: totalCount,
    sellOutPercentage: Math.min(100, (Number(totalAmountRaisedInUsd) / Number(raiseTargetInUsd)) * 100),
    // TODO @hardcoded below
    marketCap: 50_000,
    fdv: 1_000_000,
  }

  return response
}


export const SaleResultsService = {
  getSaleResults,
}
