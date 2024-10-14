import { GetProjectsResponse } from "../../../shared/models"
import { jsonResponse, reportError } from "../cfPagesFunctionsUtils"

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
    const url = new URL(ctx.request.url)
    const page = parseInt(url.searchParams.get("page") || "1")
    const limit = parseInt(url.searchParams.get("limit") || "10")

    if (page < 1 || limit < 1) {
      return new Response("Invalid pagination parameters", { status: 400 })
    }

    const offset = (page - 1) * limit

    const projects = await getProjectsFromDB(db, page, limit, offset)

    if (projects) {
      return jsonResponse(projects, 200)
    } else {
      return jsonResponse({ message: "Not found!" }, 404)
    }
  } catch (e) {
    await reportError(db, e)
    return jsonResponse({ message: "Something went wrong..." }, 500)
  }
}

const getProjectsFromDB = async (
  db: D1Database,
  page: number,
  limit: number,
  offset: number,
): Promise<GetProjectsResponse | null> => {
  // SQL query to fetch paginated projects
  const query = `SELECT * FROM project LIMIT ? OFFSET ?`
  const statement = db.prepare(query).bind(limit, offset)
  const result = await statement.all()

  const totalQuery = `SELECT COUNT(*) AS total FROM project`
  const totalResult = (await db.prepare(totalQuery).first()) as {
    total: number
  }

  const total = totalResult?.total || 0
  const totalPages = Math.ceil(total / limit)

  const projects = result.results.map((project) =>
    JSON.parse(project.json as string),
  )

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
