import {
  extractProjectId,
  jsonResponse,
  reportError,
} from "../cfPagesFunctionsUtils"
import { projectTable } from "../../../shared/drizzle-schema"
import { eq } from "drizzle-orm"
import { drizzle } from "drizzle-orm/d1"

type ENV = {
  DB: D1Database
}
/**
 * Get request handler - returns a project by id
 * @param ctx
 */
export const onRequestGet: PagesFunction<ENV> = async (ctx) => {
  const db = drizzle(ctx.env.DB, { logger: true })
  try {
    const url = ctx.request.url
    const projectId = extractProjectId(url)

    // validate request
    if (!projectId) {
      return jsonResponse({ message: "Please provide id query param" }, 400)
    }
    throw new Error('Testing Sentry out!')

    const project = await db
      .select()
      .from(projectTable)
      .where(eq(projectTable.id, projectId))
      .get()
    if (!project) return jsonResponse({ message: 'Project not found!' }, 404)

    return jsonResponse(project.json, 200)
  } catch (e) {
    await reportError(db, e)
    return jsonResponse({ message: "Something went wrong..." }, 500)
  }
}
