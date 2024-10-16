import { createHash } from "node:crypto"
import { ProjectModel } from "../../shared/models"

/**
 * Easier way to return response
 * @param retval
 * @param statusCode
 */
export const jsonResponse = (
  retval?: string | Record<string, unknown> | null,
  statusCode?: number,
): Response => {
  const body = (retval !== null && typeof retval === 'object')
    ? JSON.stringify(retval)
    : retval as string
  const status = statusCode ?? 200
  return new Response(body, {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "http://localhost:5173",
    },
  })
}
/**
 * Reports an error.
 * Use this to signal that something unexpected or something that needs attention happened.
 * ATM it writes the error to a DB table, but ultimately we might switch to something else (mailing, sentry, etc.)
 * @param db
 * @param e
 */
export const reportError = async (db: D1Database, e: Error) => {
  console.error(e)

  const id = uuidv4()
  const message = e.message
  const createdAt = new Date().toISOString()
  const json = JSON.stringify({
    stack: e.stack,
    name: e.name,
    cause: e.cause,
  })
  await db
    .prepare('INSERT INTO error (id, message, created_at, json) VALUES (?1, ?2, ?3, ?4);')
    .bind(id, message, createdAt, json)
    .run()
}
/**
 * Call this function to check if the user has admin privileges in provided context.
 * @param ctx
 */
export const hasAdminAccess = (ctx: EventContext<{ ADMIN_API_KEY_HASH: string }, any, Record<string, unknown>>) => {
  const providedApiKey = (ctx.request.headers.get('authorization') ?? '').replace('Bearer ', '')
  const providedApiKeyHash = createHash('sha256').update(providedApiKey).digest('hex')

  const correctApiKeyHash = ctx.env.ADMIN_API_KEY_HASH

  const isValid = Boolean(providedApiKey) && Boolean(correctApiKeyHash)
    && providedApiKeyHash === correctApiKeyHash
  return isValid
}
/**************************************/
/********* PRIVATE FUNCTIONS **********/
/**************************************/
function uuidv4() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
    (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
  )
}

// not used
export const hashStringToU64 = (input: string): number => {
  const FNV_PRIME: number = 1099511628211
  const OFFSET_BASIS: number = 14695981039346656037

  let hash: number = OFFSET_BASIS

  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = (hash * FNV_PRIME) % 2 ** 53 // Ensure the hash stays within the safe integer range
  }

  return hash
}

export const getProjectById = async (
  db: D1Database,
  id: string,
): Promise<ProjectModel | null> => {
  const project = await db
    .prepare("SELECT * FROM project WHERE id = ?1")
    .bind(id)
    .first<{ id: string; json: ProjectModel }>()
  return project ? JSON.parse(project.json) : null
}

export const extractProjectId = (url: string) => {
  const parsedUrl = new URL(url)
  const pathSegments = parsedUrl.pathname.split("/")

  const projectsIndex = pathSegments.indexOf("projects")
  const id = projectsIndex !== -1 ? pathSegments[projectsIndex + 1] : null

  return id
}
