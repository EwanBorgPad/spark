import { DrizzleD1Database } from "drizzle-orm/d1/driver"
import { depositTable, projectTable } from "../../shared/drizzle-schema"
import { eq, sql } from "drizzle-orm"
import { SaleResults } from "../../shared/models"

/**
 * raiseTarget is multiplied by this value to get corrected raise target (account for overflows)
 * 0.99 means 1 percent LESS than the raiseTarget
 * 1 means the same as raiseTarget
 * 1.01 means 1 percent MORE than the raiseTarget
 */
const RAISE_TARGET_FACTOR = 0.9

type GetSaleResultsArgs = {
  db: DrizzleD1Database
  projectId: string
}
const getSaleResults = async ({ db, projectId }: GetSaleResultsArgs): Promise<SaleResults> => {
  // load project
  const project = await db
    .select()
    .from(projectTable)
    .where(eq(projectTable.id, projectId))
    .get()
  if (!project) throw new Error(`Project not found (id=${projectId})!`)

  // load sale results
  const queryResult = await db
    .select({
      fromAddress: depositTable.fromAddress,
      totalAmountPerUser: sql`SUM(${depositTable.amountDeposited})`.as('totalAmountPerUser'),
    })
    .from(depositTable)
    .groupBy(depositTable.fromAddress)
    .where(eq(depositTable.projectId, projectId))
    .all() as { fromAddress: string, totalAmountPerUser: string }[]

  const participantsCount = queryResult?.length ?? 0
  const totalAmount = queryResult?.reduce((acc, curr) => acc + Number(curr.totalAmountPerUser), 0) ?? 0
  const averageAmount = (totalAmount / participantsCount) || 0

  const decimals = project.json.config.raisedTokenData.decimals

  const raisedTokenPriceInUsd = project.json.config.raisedTokenData.fixedTokenPriceInUsd
  if (!raisedTokenPriceInUsd) {
    throw new Error(`Project (${projectId}) is missing raisedTokenData.fixedTokenPriceInUsd!`)
  }

  const priceInUsd = raisedTokenPriceInUsd
  const raiseTargetInUsd = project.json.config.raiseTargetInUsd

  if (raiseTargetInUsd < 1) {
    throw new Error(`raiseTargetInUsd must be over 1!`)
  }

  const totalAmountRaisedInUsd = (totalAmount / (10 ** decimals)) * priceInUsd
  const raiseTargetReached = (raiseTargetInUsd * RAISE_TARGET_FACTOR) <= totalAmountRaisedInUsd

  return {
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
    sellOutPercentage: Math.min(100, (Number(totalAmountRaisedInUsd) / Number(raiseTargetInUsd)) * 100),
    participantsCount,
    marketCap: project.json.config.marketCap ?? null,
    fdv: project.json.config.fdv ?? null,
  }
}


export const SaleResultsService = {
  getSaleResults,
}
