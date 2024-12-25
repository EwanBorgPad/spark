import { createHash } from "node:crypto"
import { DrizzleD1Database } from "drizzle-orm/d1/driver"
import { sql } from "drizzle-orm"

type ResponseOptions = {
  statusCode?: number
  headers?: Record<string, string | undefined>
}
/**
 * Easier way to return response
 * @param retval
 * @param options
 */
export const jsonResponse = (
  retval?: string | Record<string, unknown> | null,
  options?: number | ResponseOptions,
): Response => {
  if (typeof options === 'number') {
    options = {
      statusCode: options,
    }
  }

  const body = (retval !== null && typeof retval === 'object')
    ? JSON.stringify(retval)
    : retval as string
  const status = options?.statusCode ?? 200
  const headers = removeUndefinedValues({
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "http://localhost:5173",
    "Access-Control-Allow-Methods": "OPTIONS, GET, PUT, POST, DELETE, HEAD",
    ...(options?.headers ? options.headers : {}),
  })

  return new Response(body, { status, headers })
}
/**
 * Reports an error.
 * Use this to signal that something unexpected or something that needs attention happened.
 * ATM it writes the error to a DB table, but ultimately we might switch to something else (mailing, sentry, etc.)
 * @param db
 * @param e
 */
export const reportError = async (db: D1Database | DrizzleD1Database, error: unknown) => {
  const e = error instanceof Error ? error : new Error(String(error))

  console.error(e)

  const id = uuidv4()
  const message = e.message
  const createdAt = new Date().toISOString()
  const json = JSON.stringify({
    stack: e.stack,
    name: e.name,
    cause: e.cause,
  })

  if (db instanceof DrizzleD1Database) {
    await db.run(sql`INSERT INTO error (id, message, created_at, json) VALUES (${id}, ${message}, ${createdAt}, ${json});`)
  } else {
    await db
      .prepare('INSERT INTO error (id, message, created_at, json) VALUES (?1, ?2, ?3, ?4);')
      .bind(id, message, createdAt, json)
      .run()
  }
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

export const extractProjectId = (url: string) => {
  const parsedUrl = new URL(url)
  const pathSegments = parsedUrl.pathname.split("/")

  const projectsIndex = pathSegments.indexOf("projects")
  const id = projectsIndex !== -1 ? pathSegments[projectsIndex + 1] : null

  return id
}

function removeUndefinedValues(obj: Record<string, any>): Record<string, any> {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== undefined)
  );
}


