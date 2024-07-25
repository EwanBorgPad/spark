/**
 * Easier way to return response
 * @param json
 * @param statusCode
 */
export const jsonResponse = (
  json?: string | Record<string, unknown> | null,
  statusCode?: number,
): Response => {
  const body = typeof json === 'object' ? JSON.stringify(json) : json
  const status = statusCode ?? 200
  return new Response(body, {
    status,
    headers: {
      "Content-Type": "application/json",
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

/**************************************/
/********* PRIVATE FUNCTIONS **********/
/**************************************/
function uuidv4() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
    (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
  )
}
