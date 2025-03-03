import { GetProjectsResponse, InvestmentIntentSummary, ProjectModel, projectSchema, ProjectTypeSchema } from "../../../shared/models"
import {
  hasAdminAccess,
  jsonResponse,
  reportError,
} from "../cfPagesFunctionsUtils"
import { projectTable, ProjectStatus } from "../../../shared/drizzle-schema"
import { and, count, eq, like, not, sql } from "drizzle-orm"
import { drizzle, DrizzleD1Database } from "drizzle-orm/d1"
import { z } from 'zod'


const requestSchema = z.object({
  page: z.coerce.number().int().default(1),
  limit: z.coerce.number().int().default(9),
  projectType: ProjectTypeSchema.optional(),
})

type ENV = {
  DB: D1Database
  ADMIN_API_KEY_HASH: string
}
/**
 * Get request handler - returns a list of projects
 * @param ctx
 */
export const onRequestGet: PagesFunction<ENV> = async (ctx) => {
  const db = drizzle(ctx.env.DB, { logger: true })
  try {
    const requestDataObject = Object.fromEntries(new URL(ctx.request.url).searchParams)

    const { data: requestData, error } = requestSchema.safeParse(requestDataObject)

    if (!requestData || error) 
      return jsonResponse({ message: 'Bad request!', error }, 400)

    const projects = await getProjectsFromDB(db, requestData)

    return jsonResponse(projects, 200)
  } catch (e) {
    await reportError(db, e)
    return jsonResponse({ message: "Something went wrong..." }, 500)
  }
}

type GetProjectsFromDbArgs = z.infer<typeof requestSchema>
const getProjectsFromDB = async (db: DrizzleD1Database, args: GetProjectsFromDbArgs): Promise<GetProjectsResponse | null> => {

  const projectType = args.projectType
  
  const { page, limit } = args
  const offset = (page - 1) * limit

  const whereConditions = and(
    eq(projectTable.status, 'active'),
    not(like(projectTable.id, 'hidden%')),
    projectType ? sql`json -> 'info' ->> 'projectType' = ${projectType}` : undefined,
  )
  
  const projectsResult = await db
    .select()
    .from(projectTable)
    .where(whereConditions)
    .limit(limit)
    .offset(offset)
    .all()
  
  const countQuery = db
    .select({ count: count() })
    .from(projectTable)
    .where(whereConditions)
  const countResult = (await countQuery.get()).count

  const total = countResult || 0
  const totalPages = Math.ceil(total / limit)

  // add investment intent summary (commitments) to the response
  const projectIds = projectsResult.map(project => project.id)
  const investmentIntentSummaries =  await db.all(
    sql`
      SELECT
        json_each.key AS project_id,
        SUM(json_each.value ->> 'amount') AS sum,
        AVG(json_each.value ->> 'amount') AS avg,
        COUNT(json_each.value ->> 'amount') AS count
      FROM user, 
      json_each(user.json, '$.investmentIntent') 
      WHERE json_each.key IN (${sql.join(projectIds, sql`, `)})
      GROUP BY json_each.key;
    `
  ) as { project_id: string, sum: number, avg: number, count: number }[];

  const retvalProjects: (ProjectModel & { investmentIntentSummary: InvestmentIntentSummary })[] = 
    projectsResult
      .map(project => ({
        ...project.json,
        investmentIntentSummary: investmentIntentSummaries.find(summary => summary.project_id === project.id),
      }))

  const response = {
    projects: retvalProjects,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  }
  return response
}

////////////////////////////////////////////////
////////////// CREATE PROJECT API //////////////
////////////////////////////////////////////////

/**
 * Post request handler - creates a project
 * @param ctx
 */
export const onRequestPost: PagesFunction<ENV> = async (ctx) => {
  const db = drizzle(ctx.env.DB, { logger: true })
  try {
    // authorize request
    if (!hasAdminAccess(ctx)) {
      return jsonResponse(null, 401)
    }

    // parse request
    const requestJson = await ctx.request.json()
    const { error, data } = projectSchema.safeParse(requestJson)

    const { searchParams } = new URL(ctx.request.url)
    const overwrite = searchParams.get("overwrite") === 'true'

    // validate request
    if (error) {
      return jsonResponse({ message: "Invalid request!", error }, 400)
    }

    // check if exists
    const project = await db
      .select()
      .from(projectTable)
      .where(eq(projectTable.id, data.id))
      .get()
    
    const projectExists = Boolean(project)
    if (!overwrite && projectExists) return jsonResponse({ message: "Project with provided id already exists!", }, 409)

    const id = data.id
    const json = JSON.stringify(data)
    const now = new Date().toISOString()
    // projects created/updated through this API are always 'active'
    const newStatus: ProjectStatus = 'active'
    // persist in db
    if (projectExists) {
      await db.run(sql`UPDATE project SET status = ${newStatus}, updated_at = ${now}, json = ${json} WHERE id = ${id};`)
    } else {
      await db.run(sql`INSERT INTO project (id, status, created_at, updated_at, json) VALUES (${id}, ${newStatus}, ${now}, ${now}, ${json})`)
    }

    const retval = {
      message: projectExists ? 'Updated!' : 'Created!'
    }

    return jsonResponse(retval, 201)
  } catch (e) {
    await reportError(db, e)
    return jsonResponse({ message: "Something went wrong..." }, 500)
  }
}
