import { GetProjectsResponse, projectSchema } from "../../../shared/models"
import {
  hasAdminAccess,
  jsonResponse,
  reportError,
} from "../cfPagesFunctionsUtils"
import { ProjectService } from "../../services/projectService"

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
    const limit = parseInt(url.searchParams.get("limit") || "9")

    if (page < 1 || limit < 1) {
      return new Response("Invalid pagination parameters", { status: 400 })
    }

    const offset = (page - 1) * limit

    const projects = await getProjectsFromDB(db, page, limit, offset)

    return jsonResponse(projects, 200)
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

  const selectProjects = await db
    .prepare(`SELECT * FROM project LIMIT ? OFFSET ?`)
    .bind(limit, offset)
    .all()

  const selectCount = (await db
    .prepare(`SELECT COUNT(*) AS total FROM project`)
    .first()) as { total: number }

  const total = selectCount?.total || 0
  const totalPages = Math.ceil(total / limit)

  const projects = selectProjects.results.map((project) =>
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
    const existingProject = await ProjectService.findProjectById({ db, id: data.info.id })
    if (existingProject) {
      return jsonResponse({ message: "Project with provided id already exists!", }, 409)
    }

    // if (!ctx.env.ADMIN_AUTHORITY_SECRET_KEY) throw new Error('ADMIN_AUTHORITY_SECRET_KEY missing!')
    // if (!ctx.env.SOLANA_RPC_URL) throw new Error('SOLANA_RPC_URL missing!')

    // const adminSecretKey = ctx.env.ADMIN_AUTHORITY_SECRET_KEY.split(',').map(Number)
    // const rpcUrl = ctx.env.SOLANA_RPC_URL

    // const uid = hashStringToU64(data.info.id)

    // await initializeLpb({
    //   args: {
    //     uid,

    //     projectOwnerAddress: data.info.projectOwnerAddress,

    //     launchedTokenMintAddress: data.info.launchedTokenMintAddress,
    //     launchedTokenLpDistribution: data.info.launchedTokenLpDistribution,
    //     launchedTokenCap: data.info.launchedTokenCap,

    //     raisedTokenMintAddress: data.info.raisedTokenMintAddress,
    //     raisedTokenMinCap: data.info.raisedTokenMinCap,
    //     raisedTokenMaxCap: data.info.raisedTokenMaxCap,

    //     cliffDuration: data.info.cliffDuration,
    //     vestingDuration: data.info.vestingDuration,
    //   },
    //   adminSecretKey,
    //   rpcUrl,
    // })

    // persist in db
    await db
      .prepare("INSERT INTO project (id, json) VALUES (?1, ?2)")
      .bind(data.info.id, JSON.stringify(data))
      .run()

    return jsonResponse({ message: "Created!" }, 201)
  } catch (e) {
    await reportError(db, e)
    return jsonResponse({ message: "Something went wrong..." }, 500)
  }
}

const hashStringToU64 = (input: string): number => {
  const FNV_PRIME: number = 1099511628211;
  const OFFSET_BASIS: number = 14695981039346656037;

  let hash: number = OFFSET_BASIS;

  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = (hash * FNV_PRIME) % 2 ** 53; // Ensure the hash stays within the safe integer range
  }

  return hash;
}
