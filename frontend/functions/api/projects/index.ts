import { GetProjectsResponse, projectSchema } from "../../../shared/models"
import {
  getProjectById,
  hasAdminAccess,
  jsonResponse,
  reportError,
} from "../cfPagesFunctionsUtils"

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

/**
 * Post request handler - creates a project
 * @param ctx
 */
export const onRequestPost: PagesFunction<ENV> = async (ctx) => {
  const db = ctx.env.DB
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
    const existingProject = await getProjectById(db, data.info.id)
    if (existingProject) {
      return jsonResponse({ message: "Project with provided id already exists!", }, 409)
    }

    if (!ctx.env.ADMIN_AUTHORITY_SECRET_KEY) throw new Error('ADMIN_AUTHORITY_SECRET_KEY missing!')
    if (!ctx.env.SOLANA_RPC_URL) throw new Error('SOLANA_RPC_URL missing!')

    const adminSecretKey = ctx.env.ADMIN_AUTHORITY_SECRET_KEY.split(',').map(Number)
    const rpcUrl = ctx.env.SOLANA_RPC_URL

    const uid = hashStringToU64(data.info.id)

    await initializeLpb({
      args: {
        uid,

        projectOwnerAddress: data.info.projectOwnerAddress,

        launchedTokenMintAddress: data.info.launchedTokenMintAddress,
        launchedTokenLpDistribution: data.info.launchedTokenLpDistribution,
        launchedTokenCap: data.info.launchedTokenCap,

        raisedTokenMintAddress: data.info.raisedTokenMintAddress,
        raisedTokenMinCap: data.info.raisedTokenMinCap,
        raisedTokenMaxCap: data.info.raisedTokenMaxCap,

        cliffDuration: data.info.cliffDuration,
        vestingDuration: data.info.vestingDuration,
      },
      adminSecretKey,
      rpcUrl,
    })

    // persist in db
    await db
      .prepare("INSERT INTO project (id, json, created_at) VALUES (?1, ?2, ?3)")
      .bind(data.info.id, JSON.stringify(data), new Date().toISOString())
      .run()

    return jsonResponse({ message: "Created!" }, 201)
  } catch (e) {
    await reportError(db, e)
    return jsonResponse({ message: "Something went wrong..." }, 500)
  }
}
