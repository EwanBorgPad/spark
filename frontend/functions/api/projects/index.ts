import { GetProjectsResponse, projectSchema, ProjectTypeSchema } from "../../../shared/models"
import {
  hasAdminAccess,
  jsonResponse,
  reportError,
} from "../cfPagesFunctionsUtils"
import { projectTable } from "../../../shared/drizzle-schema"
import { count, eq, sql } from "drizzle-orm"
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
  ADMIN_AUTHORITY_SECRET_KEY: string
  SOLANA_RPC_URL: string
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

  const { page, limit } = args

  // TODO @goatDefault
  const projectType = args.projectType ?? 'goat'

  const offset = (page - 1) * limit

  const projectsQuery = db
    .select()
    .from(projectTable)
    .limit(limit)
    .offset(offset)
  
  const countQuery = db
    .select({ count: count() })
    .from(projectTable)

  if (projectType) {
    projectsQuery.where(sql`json -> 'info' ->> 'projectType' = ${projectType}`)
    countQuery.where(sql`json -> 'info' ->> 'projectType' = ${projectType}`)
  }

  const projectsResult = await projectsQuery.all()
  const countResult = (await countQuery.get()).count

  const total = countResult || 0
  const totalPages = Math.ceil(total / limit)

  const projects = projectsResult
    .map(project =>project.json)
    .filter(project => !(project.id || '').startsWith('hidden'))

  const response = {
    projects: projects,
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
    if (!overwrite) {
      const project = await db
        .select()
        .from(projectTable)
        .where(eq(projectTable.id, data.id))
        .get()
      if (project) return jsonResponse({ message: "Project with provided id already exists!", }, 409)
    }

    const id = data.id
    const json = JSON.stringify(data)
    // persist in db
    if (overwrite) {
      await db.run(sql`REPLACE INTO project (id, json) VALUES (${id}, ${json})`)
    } else {
      await db.run(sql`INSERT INTO project (id, json) VALUES (${id}, ${json})`)
    }

    const retval = {
      message: overwrite ? 'Updated!' : 'Created!'
    }

    return jsonResponse(retval, 201)
  } catch (e) {
    await reportError(db, e)
    return jsonResponse({ message: "Something went wrong..." }, 500)
  }
}
