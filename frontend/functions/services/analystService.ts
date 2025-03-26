import { drizzle } from "drizzle-orm/d1"
import { Analysis, analysisTable, Analyst, analystTable } from "../../shared/drizzle-schema"
import { GetMeTwitterResponse } from "../../shared/types/api-types"
import { eq } from "drizzle-orm"
import { AnalystSchemaType, NewAnalysisSchemaType } from "../../shared/schemas/analysis-schema"

type CreateNewAnalystArgs = {
  db: D1Database
} & GetMeTwitterResponse["data"]
type FindAnalystByTwitterId = {
  db: D1Database,
  twitterId: string
}
type GetListOfAnalysisByProjectIdArgs = {
  db: D1Database,
  projectId: string
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
const getListOfAnalysisByProjectId = async ({ db: d1, projectId }: GetListOfAnalysisByProjectIdArgs): Promise<{analysis: Analysis, analyst: Analyst}[]> => {
  const db = drizzle(d1, { logger: true })

  const result = await db
    .select({
        analysis: analysisTable,
        analyst: analystTable
    })
    .from(analysisTable)
    .leftJoin(analystTable, eq(analystTable.id, analysisTable.analystId))
    .where(eq(analysisTable.projectId, projectId))
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
  console.log("🚀 ~ createNewAnalyst ~ result:", result[0])

  return result[0]; // Return new data row for later update
}
const updateAnalyst = async ({db: d1, analyst, updates}: UpdateAnalystByTwitterId): Promise<Analyst> => {
  const db = drizzle(d1, { logger: true })
  
  const result = await db.update(analystTable).set(updates).where(eq(analystTable.id, analyst.id)).returning()
  console.log("🚀 ~ updateAnalyst ~ result[0]:", result[0])

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
  console.log("🚀 ~ postNewAnalysis ~ result:", result)

  return result; // Return new data row for later update
}

export const AnalystService = {
    createNewAnalyst,
    updateAnalyst,
    findAnalystByTwitterAccount,
    postNewAnalysis,
    getListOfAnalysisByProjectId
}

function uuidv4() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
    (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
  )
}
