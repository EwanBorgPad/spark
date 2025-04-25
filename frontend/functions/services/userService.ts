import { DrizzleD1Database } from "drizzle-orm/d1"
import { UserModel } from "../../shared/models"
import { depositTable, projectTable } from "../../shared/drizzle-schema"
import { sql, eq } from "drizzle-orm"
import { GetUserInvestmentsResponse, UserInvestmentByProjects } from "../../shared/types/user-types"

type FindUserByAddressArgs = {
  db: D1Database
  address: string
}
const findUserByAddress = async ({ db, address }: FindUserByAddressArgs): Promise<UserModel | null> => {
  const user = await db
    .prepare("SELECT * FROM user WHERE address = ?1")
    .bind(address)
    .first<UserModel | null>()

  if (!user) return null

  return {
    wallet_address: user?.wallet_address,
    json: JSON.parse(user.json as string),
  }
}
const findUserByAddressOrFail = async (args: FindUserByAddressArgs): Promise<UserModel> => {
  const user = await findUserByAddress(args)
  if (!user) throw new Error(`User (address=${args.address}) not found!`)
  return user
}
const getUserDepositsByProjects = async (db: DrizzleD1Database, userAddress: string): Promise<GetUserInvestmentsResponse | undefined> => {
  try {
    // Query the deposit records and extract tokenInUSD values directly from JSON
    const joinedQuery = await db
      .select({
        projectId: depositTable.projectId,
        project: projectTable.json,
        // Use SQL.raw to extract and clean the tokenInUSD value from JSON
        totalInvestmentInUSD: sql`
          SUM(
            COALESCE(
              CAST(
                REPLACE(
                  REPLACE(
                    JSON_EXTRACT(${depositTable.json}, '$.tokensCalculation.lpPosition.tokenInUSD'),
                    '$', ''
                  ),
                  ',', ''
                ) AS REAL
              ),
              0
            )
          )
        `.as('total_investment_in_usd'),
      })
      .from(depositTable)
      .innerJoin(projectTable, eq(depositTable.projectId, projectTable.id))
      .where(eq(depositTable.fromAddress, userAddress))
      .groupBy(depositTable.projectId) // Group by projectId and projectName
      .all();

    if (joinedQuery.length === 0) return {investments: [], sumInvestments: 0}

    const sum = (joinedQuery as UserInvestmentByProjects[]).reduce((acc, curr)=> {return acc + curr.totalInvestmentInUSD}, 0)
    const result = { sumInvestments: sum, investments: joinedQuery }

    return result as unknown as GetUserInvestmentsResponse;
  } catch (error) {
    console.error('Error in getUserDepositsByProjects:', error);
    throw new Error('Something went wrong!')
  }
};

export const UserService = {
  findUserByAddress,
  findUserByAddressOrFail,
  getUserDepositsByProjects
}
