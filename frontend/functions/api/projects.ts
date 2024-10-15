import { ProjectModel, projectSchema } from "../../shared/models"
import { hasAdminAccess, jsonResponse, reportError } from "./cfPagesFunctionsUtils"
import { initializeLpb } from "../../shared/anchor"

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
    const id = new URL(url).searchParams.get("id")

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

    // dummy values for now
    const me = '5oY4RHVH4PBS3YDCuQ86gnaM27KvdC9232TpB71wLi1W'
    const usdcTokenAddress = 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr'

    const adminSecretKey = ctx.env.ADMIN_AUTHORITY_SECRET_KEY.split(',').map(Number)
    const uid = hashStringToU64(data.info.id)
    await initializeLpb({
      args: {
        uid,

        projectOwnerAddress: me,

        launchedTokenMintAddress: usdcTokenAddress,
        launchedTokenLpDistribution: 80,
        launchedTokenCap: 100,

        raisedTokenMintAddress: usdcTokenAddress,
        raisedTokenMinCap: 1_000,
        raisedTokenMaxCap: 100_000,

        cliffDuration: 100,
        vestingDuration: 100,
      },
      adminSecretKey,
    })

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

const getProjectById = async (
  db: D1Database,
  id: string,
): Promise<ProjectModel | null> => {
  const project = await db
    .prepare("SELECT * FROM project WHERE id = ?1")
    .bind(id)
    .first<{ id: string; json: ProjectModel }>()
  return project ? JSON.parse(project.json) : null
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
