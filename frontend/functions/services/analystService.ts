import { drizzle, DrizzleD1Database } from "drizzle-orm/d1"
import { Analysis, analysisTable, Analyst, analystTable } from "../../shared/drizzle-schema"
import { GetMeTwitterResponse } from "../../shared/types/api-types"
import { and, eq, asc, desc } from "drizzle-orm"
import { AnalysisSortBy, AnalysisSortDirection, AnalystSchemaType, NewAnalysisSchemaType } from "../../shared/schemas/analysis-schema"

type CreateNewAnalystArgs = {
  db: D1Database
} & GetMeTwitterResponse["data"]
type FindAnalystByTwitterId = {
  db: D1Database,
  twitterId: string
}
type UpdateAnalystByTwitterId = {
  db: D1Database,
  analyst: Analyst,
  updates: Partial<Analyst>
}
type PostNewAnalysisArgs = {
  db: D1Database,
  analysis: NewAnalysisSchemaType
}
type UpdateAnalysisArgs = {
  db: DrizzleD1Database, 
  analysisId: string
}
type AnalysisTableColumns = typeof analysisTable.$inferSelect;

type GetListOfAnalysisArgs = {
  db: D1Database,
  projectId?: string,
  isApproved?: string
  sortDirection?: AnalysisSortDirection
  sortBy: AnalysisSortBy
}

const findAnalystByTwitterAccount = async ({ db: d1, twitterId }: FindAnalystByTwitterId): Promise<Analyst | null> => {
  const db = drizzle(d1, { logger: true })

  const analyst = await db
    .select()
    .from(analystTable)
    .where(eq(analystTable.twitterId, twitterId))
    .limit(1)
    .get()

  if (!analyst) return null

  return analyst
}

const getSortColumn = (column: AnalysisSortBy) => {
  switch (column) {
    case "projectId":
      return analysisTable.projectId;
    case "impressions":
      return analysisTable.impressions;
    case "likes":
      return analysisTable.likes;
    case "analystRole":
      return analysisTable.analystRole;
    default:
      throw new Error("Invalid sort column");
  }
};

const getListOfAnalysis = async ({ db: d1, projectId, isApproved, sortDirection, sortBy  }: GetListOfAnalysisArgs): Promise<{analysis: Analysis, analyst: Analyst}[]> => {
  const db = drizzle(d1, { logger: true })

  let orderByConditions
  if (sortBy) {
    orderByConditions = sortDirection && sortDirection === "asc" ? asc(getSortColumn(sortBy as AnalysisSortBy)) : desc(getSortColumn(sortBy as AnalysisSortBy))
  } else {
    orderByConditions = asc(getSortColumn("projectId"))
  }
  let whereConditions;
  if (isApproved) {
    const isApprovedBoolean = isApproved === "true"
    whereConditions = and(
      whereConditions,
      eq(analysisTable.isApproved, isApprovedBoolean)
    );
  }
  if (projectId) {
    whereConditions = and(
      whereConditions,
      eq(analysisTable.projectId, projectId)
    );
  }

  const result = await db
    .select({
        analysis: analysisTable,
        analyst: analystTable
    })
    .from(analysisTable)
    .leftJoin(analystTable, eq(analystTable.id, analysisTable.analystId))
    .where(whereConditions)
    .orderBy(orderByConditions)
    .all();

  return result
}
const createNewAnalyst = async ({db: d1, ...getMeData}: CreateNewAnalystArgs): Promise<AnalystSchemaType> => {
  const newAnalyst: Analyst = {
    id: uuidv4(), // Generate a unique ID
    twitterId: getMeData.id,
    twitterName: getMeData.name ?? "",
    twitterUsername: getMeData.username ?? "",
    twitterAvatar: getMeData.profile_image_url ?? ""
  };

  const db = drizzle(d1, { logger: true })
  
  const result = await db.insert(analystTable).values(newAnalyst).returning()
  console.log("Created new analyst - ", result[0].id)

  return result[0]; // Return new data row for later update
}
const updateAnalyst = async ({db: d1, analyst, updates}: UpdateAnalystByTwitterId): Promise<Analyst> => {
  const db = drizzle(d1, { logger: true })
  
  const result = await db.update(analystTable).set(updates).where(eq(analystTable.id, analyst.id)).returning()
  console.log("Updated analyst - ", result[0].id)

  return result[0]; // Return new data row for later update
}
const postNewAnalysis = async ({db: d1, analysis}: PostNewAnalysisArgs): Promise<NewAnalysisSchemaType> => {
  const db = drizzle(d1, { logger: true })
  const newAnalysis: Analysis  = {
    id: uuidv4(),
    analystId: analysis.analystId,
    twitterId: analysis.twitterId,
    analystRole: analysis.analystRole,
    projectId: analysis.projectId,
    articleUrl: analysis.articleUrl,
    impressions: 0,
    likes: 0,
    isApproved: false
  }
  
  const [ result ] = await db.insert(analysisTable).values(newAnalysis).returning()
  console.log("Created new analysis - ", result.id)

  return result; // Return new data row for later update
}

// Function to approve an analysis
const approveAnalysis = async ({ db, analysisId }: UpdateAnalysisArgs) => {
  await db
    .update(analysisTable)
    .set({ isApproved: true } as Partial<AnalysisTableColumns>) // Sets to 1 in SQLite
    .where(eq(analysisTable.id, analysisId));
}

// Function to decline an analysis
const declineAnalysis = async ({ db, analysisId }: UpdateAnalysisArgs) => {
  await db
    .delete(analysisTable)
    .where(eq(analysisTable.id, analysisId));
}

export const AnalystService = {
    createNewAnalyst,
    updateAnalyst,
    findAnalystByTwitterAccount,
    postNewAnalysis,
    getListOfAnalysis,
    approveAnalysis,
    declineAnalysis
}

function uuidv4() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
    (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
  )
}
