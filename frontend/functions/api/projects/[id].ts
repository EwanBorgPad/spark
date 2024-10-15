import { ProjectModel, projectSchema } from "../../../shared/models"
import {
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
      return jsonResponse(
        { message: "Project with provided id already exists!" },
        409,
      )
    }

    // commented out until it is integrated with the backoffice
    // const me = ''
    // const adminSecretKey = ctx.env.ADMIN_AUTHORITY_SECRET_KEY.split(',').map(Number)
    // const uid = hashStringToU64(data.info.id)
    // await initializeLpb({
    //   args: {
    //     uid,
    //     projectOwner: me,
    //     projectTokenMint: me,
    //     projectTokenLpDistribution: 50, // Example percentage
    //     projectMaxCap: 1_000_000,
    //     userTokenMint: me,
    //     userMinCap: 100,
    //     userMaxCap: 10_000,
    //     fundCollectionPhaseStartTime: new Date(1_700_000_000 * 1000),
    //     fundCollectionPhaseEndTime: new Date(1_710_000_000 * 1000),
    //     lpLockedPhaseLockingTime: new Date(1_720_000_000 * 1000),
    //     lpLockedPhaseVestingTime: new Date(1_730_000_000 * 1000),
    //     bump: 1,
    //   },
    //   adminSecretKey,
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

// @TODO - to be deleted
/**
 * Post request handler - creates a project
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
const extractProjectId = (url: string) => {
  const parsedUrl = new URL(url)
  const pathSegments = parsedUrl.pathname.split("/")

  const projectsIndex = pathSegments.indexOf("projects")
  const id = projectsIndex !== -1 ? pathSegments[projectsIndex + 1] : null

  return id
}


const hashStringToU64 = (input: string): number => {
  const FNV_PRIME: number = 1099511628211
  const OFFSET_BASIS: number = 14695981039346656037

  let hash: number = OFFSET_BASIS

  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = (hash * FNV_PRIME) % 2 ** 53 // Ensure the hash stays within the safe integer range
  }

  return hash
}
