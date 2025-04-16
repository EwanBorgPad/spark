import { isApiKeyValid } from '../../services/apiKeyService'
import { jsonResponse, reportError } from "../cfPagesFunctionsUtils"
import { drizzle } from "drizzle-orm/d1"
import { userTable } from "../../../shared/drizzle-schema"
import { sql } from "drizzle-orm"

/**
 * Query for fetching only email addresses from the user table.
 */
const query = `
  SELECT
    json -> 'emailData' ->> 'email' AS email
  FROM user
  WHERE json -> 'emailData' IS NOT NULL;
`

type ENV = {
  DB: D1Database
}

export const onRequestGet: PagesFunction<ENV> = async (ctx) => {
  const db = ctx.env.DB

  try {
    // authorize request
    if (!await isApiKeyValid({ ctx, permissions: ["read"] })) {
      return jsonResponse(null, 401)
    }
    
    // execute request
    const queryResult = await db
      .prepare(query)
      .all()

    // Extract just the email addresses
    const emails = queryResult.results.map(result => result.email)

    return jsonResponse({ emails }, {
      headers: {
        "Cache-Control": "public, max-age=15",
      }
    })
  } catch (e) {
    await reportError(db, e)
    return jsonResponse({ message: "Something went wrong..." }, 500)
  }
} 