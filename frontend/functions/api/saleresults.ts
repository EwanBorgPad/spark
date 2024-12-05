import { jsonResponse, reportError } from "./cfPagesFunctionsUtils"
import { drizzle } from "drizzle-orm/d1"
import { depositTable, projectTable } from "../../shared/drizzle-schema"
import { eq, sql } from "drizzle-orm"
import { exchangeService } from "../services/exchangeService"

type Cluster = 'devnet' | 'mainnet'
// TODO @harcoded
const tokenDataMap: Record<Cluster, Record<string, { decimals: number, coinGeckoName: string }>> = {
  devnet: {
    // usdc https://explorer.solana.com/address/Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr?cluster=devnet
    'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr': {
      decimals: 6,
      coinGeckoName: 'usd',
    }
  },
  mainnet: {
    // borg https://explorer.solana.com/address/3dQTr7ror2QPKQ3GbBCokJUmjErGg8kTJzdnYjNfvi3Z
    '3dQTr7ror2QPKQ3GbBCokJUmjErGg8kTJzdnYjNfvi3Z': {
      decimals: 9,
      coinGeckoName: 'swissborg',
    }
  }
}


type ENV = {
  DB: D1Database
}
export const onRequestGet: PagesFunction<ENV> = async (ctx) => {
  const d1Db = ctx.env.DB
  const db = drizzle(ctx.env.DB, { logger: true })
  try {
    // parse/validate request
    const { searchParams } = new URL(ctx.request.url)
    const projectId = searchParams.get("projectId")
    if (!projectId) return jsonResponse({ message: 'projectId is missing!' }, 400)

    // load project
    const project = await db
      .select()
      .from(projectTable)
      .where(eq(projectTable.id, projectId))
      .get()

    if (!project)
      return jsonResponse({ message: `Project not found (id=${projectId})!`}, 404)

    const cluster = project.json.cluster ?? 'devnet'
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
    const tokenData = tokenDataMap[cluster][tokenAddress]

    if (!tokenData) {
      return jsonResponse({ message: 'Unknown token!' }, 500)
    }

    const exchangeData = await exchangeService.getExchangeData({
      db: d1Db,
      baseCurrency: tokenData.coinGeckoName,
      targetCurrency: 'usd',
    })

    const priceUsd = exchangeData.currentPrice

    const decimals = tokenData.decimals

    const response = {
      totalAmountRaised: {
        amount: totalAmount,
        decimals,
        uiAmount: String(totalAmount / (10 ** decimals)),
        amountInUsd: String((totalAmount / (10 ** decimals)) * priceUsd),
        tokenPriceInUsd: priceUsd,
      },
      averageDepositAmount: {
        amount: averageAmount,
        decimals: decimals,
        uiAmount: String(averageAmount / (10 ** decimals)),
        amountInUsd: String((averageAmount / (10 ** decimals)) * priceUsd),
        tokenPriceInUsd: priceUsd,
      },
      participantsCount: totalCount,
      // TODO @hardcoded below
      sellOutPercentage: 77,
      marketCap: 777_777_777,
      fdv: 777_777_777,
    }

    console.log({ response })
    return jsonResponse({ response }, 200)
  } catch (e) {
    await reportError(ctx.env.DB, e)
    return jsonResponse({ message: "Something went wrong..." }, 500)
  }
}
// export type SaleResultsResponse = {
//   totalAmountRaised: TokenAmountModel
//   averageDepositAmount: TokenAmountModel
//   sellOutPercentage: string
//   participantsCount: number
//   marketCap: string
//   fdv: string
// }
