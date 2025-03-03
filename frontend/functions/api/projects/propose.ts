import { drizzle } from 'drizzle-orm/d1'
import { eq, sql } from 'drizzle-orm'

import { hasAdminAccess, jsonResponse, reportError } from '../cfPagesFunctionsUtils'
import { projectSchema } from '../../../shared/models'
import { ProjectStatus, projectTable } from '../../../shared/drizzle-schema'


type ENV = {
    DB: D1Database
    ADMIN_API_KEY_HASH: string
}
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
    
    if (project) return jsonResponse({ message: "Project with provided id already exists!", }, 409)

    const id = data.id
    const json = JSON.stringify(data)
    const now = new Date().toISOString()
    // projects created/updated through this API are always 'pending'
    const newStatus: ProjectStatus = 'pending'
    // persist in db
    await db.run(sql`INSERT INTO project (id, status, created_at, updated_at, json) VALUES (${id}, ${newStatus}, ${now}, ${now}, ${json})`)

    const retval = {
      message: 'Created!'
    }

    return jsonResponse(retval, 201)
  } catch (e) {
    await reportError(db, e)
    return jsonResponse({ message: "Something went wrong..." }, 500)
  }
}
