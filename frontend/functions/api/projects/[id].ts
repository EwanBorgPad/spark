import { ProjectModel, projectSchema } from "../../../shared/models"
import {
  extractProjectId,
  getProjectById,
  hasAdminAccess,
  jsonResponse,
  reportError,
} from "../cfPagesFunctionsUtils"
// import { initializeLpb } from "../../../shared/anchor"

type ENV = {
  DB: D1Database
  ADMIN_API_KEY_HASH: string
  ADMIN_AUTHORITY_SECRET_KEY: string
}
/**
 * Get request handler - returns a project by id
 * @param ctx
 */
export const onRequestGet: PagesFunction<ENV> = async (ctx) => {
  const db = ctx.env.DB
  try {
    const url = ctx.request.url
    const id = extractProjectId(url)

    // validate request
    if (!id) {
      return jsonResponse({ message: "Please provide id query param" }, 400)
    }

    const project = await getProjectById(db, id)

    if (project) {
      return jsonResponse(project, 200)
    } else {
      return jsonResponse({ message: "Not found!" }, 404)
    }
  } catch (e) {
    await reportError(db, e)
    return jsonResponse({ message: "Something went wrong..." }, 500)
  }
}


/**
 * Put request handler - updates a project
 * We don't use this anywhere, but it was and will be helpful for updating data when we change ProjectModel
 * @param ctx
 */
export const onRequestPut: PagesFunction<ENV> = async (ctx) => {
  const db = ctx.env.DB
  try {
    // authorize request
    if (!hasAdminAccess(ctx)) {
      return jsonResponse(null, 401)
    }
    const url = ctx.request.url
    const id = extractProjectId(url)

    // validate request
    if (!id) {
      return jsonResponse({ message: "Please provide id query param" }, 400)
    }

    // parse request
    const requestJson = await ctx.request.json()
    const { error, data: updatedData } = projectSchema.safeParse(requestJson)

    // validate request
    if (error) {
      return jsonResponse({ message: "Invalid request!", error }, 400)
    }

    await findAndEditProjectById(db, id, updatedData)

    return jsonResponse({ message: `Project ${id} Updated!` }, 204)
  } catch (e) {
    await reportError(db, e)
    return jsonResponse({ message: "Something went wrong..." }, 500)
  }
}

const findAndEditProjectById = async (
  db: D1Database,
  id: string,
  data: ProjectModel,
): Promise<ProjectModel | null> => {
  const response = await db
    .prepare("UPDATE project SET json = ?2 WHERE id = ?1")
    .bind(id, JSON.stringify(data))
    .run()
  return response
}
