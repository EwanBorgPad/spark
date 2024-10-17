import {
  extractProjectId,
  getProjectById,
  jsonResponse,
  reportError,
} from "../cfPagesFunctionsUtils"

type GetENV = {
  DB: D1Database
}
/**
 * Get request handler - returns a project by id
 * @param ctx
 */
export const onRequestGet: PagesFunction<GetENV> = async (ctx) => {
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
