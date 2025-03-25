import { DrizzleD1Database } from "drizzle-orm/d1/driver"
import { depositTable, projectTable } from "../../shared/drizzle-schema"
import { eq, inArray, sql } from "drizzle-orm"
import { SaleResults } from "../../shared/models"

/**
 * Gets the number of unique participants (depositors) per project
 * @param db - D1Database instance
 * @returns Promise<Map<string, number>> - Map of project IDs to participant counts
 */
const getDepositParticipants = async (db: DrizzleD1Database): Promise<Map<string, number>> => {
  try {
    // Get participant counts per project
    const participantCountsQuery = await db
      .select({
        projectId: depositTable.projectId,
        participantsCount: sql`COUNT(DISTINCT ${depositTable.fromAddress})`.as('participants_count')
      })
      .from(depositTable)
      .groupBy(depositTable.projectId)
      .all();
    
    // Create a map of project IDs to participant counts
    const participantCounts = new Map<string, number>();
    for (const row of participantCountsQuery) {
      participantCounts.set(row.projectId, Number(row.participantsCount));
    }
    
    return participantCounts;
  } catch (error) {
    console.error('Error in getDepositParticipants:', error);
    return new Map();
  }
};

/**
 * Gets the total deposited amount in USD per project
 * @param db - D1Database instance
 * @returns Promise<Map<string, number>> - Map of project IDs to USD amounts
 */
const getDepositAmount = async (db: DrizzleD1Database): Promise<Map<string, number>> => {
  try {
    // Fetch total deposited amounts by project
    const depositAmountsQuery = await db
      .select({
        projectId: depositTable.projectId,
        totalDeposited: sql`SUM(${depositTable.amountDeposited})`.as('total_deposited')
      })
      .from(depositTable)
      .groupBy(depositTable.projectId)
      .all();
    
    // Load project data to get token price information
    const projectIds = depositAmountsQuery.map(row => row.projectId);
    const projectsQuery = await db
      .select()
      .from(projectTable)
      .where(inArray(projectTable.id, projectIds))
      .all();
    
    // Create map of project ID to token price info
    type PriceInfo = { price: number; decimals: number };
    const projectPrices = new Map<string, PriceInfo>();
    
    for (const project of projectsQuery) {
      try {
        const tokenPrice = project.json?.config?.raisedTokenData?.fixedTokenPriceInUsd || 0;
        const decimals = project.json?.config?.raisedTokenData?.decimals || 0;
        projectPrices.set(project.id, {
          price: Number(tokenPrice),
          decimals: Number(decimals)
        });
      } catch (e) {
        console.error(`Error extracting price for project ${project.id}:`, e);
        projectPrices.set(project.id, { price: 0, decimals: 0 });
      }
    }
    
    // Calculate USD values for each project
    const depositsByProject = new Map<string, number>();
    for (const row of depositAmountsQuery) {
      const projectId = row.projectId;
      const totalTokens = Number(row.totalDeposited);
      const priceInfo = projectPrices.get(projectId) || { price: 0, decimals: 0 };
      
      // Convert tokens to USD using price and decimals
      const totalInUsd = priceInfo.decimals > 0 
        ? (totalTokens / (10 ** priceInfo.decimals)) * priceInfo.price
        : totalTokens * priceInfo.price;
      
      depositsByProject.set(projectId, totalInUsd);
    }
    
    return depositsByProject;
  } catch (error) {
    console.error('Error in getDepositAmount:', error);
    return new Map();
  }
};

/**
 * raiseTarget is multiplied by this value to get corrected raise target (account for overflows)
 * 0.99 means 1 percent LESS than the raiseTarget
 * 1 means the same as raiseTarget
 * 1.01 means 1 percent MORE than the raiseTarget
 */
const RAISE_TARGET_FACTOR = 1

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
  getDepositParticipants,
  getDepositAmount,
}
