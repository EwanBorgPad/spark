import {
    extractAnalystId,
  jsonResponse,
  reportError,
} from "../cfPagesFunctionsUtils"
import { analystTable } from "../../../shared/drizzle-schema"
import { and, eq } from "drizzle-orm"
import { drizzle } from "drizzle-orm/d1"

type ENV = {
  DB: D1Database,
}
/**
 * Get request handler - returns a analyst by id
 * @param ctx
 */
export const onRequestGet: PagesFunction<ENV> = async (ctx) => {
  const db = drizzle(ctx.env.DB, { logger: true })
  try {
    const url = ctx.request.url
    const analystId = extractAnalystId(url)

    // validate request
    if (!analystId) {
      return jsonResponse({ message: "Please provide id query param" }, 400)
    }

    const analyst = await db
      .select()
      .from(analystTable)
      .where(
        and(
          eq(analystTable.id, analystId),
        )
      )
      .get()
    if (!analyst) return jsonResponse({ message: 'Analyst not found!' }, 404)

    return jsonResponse(analyst, {
      headers: {
        "Cache-Control": "public, max-age=15",
      }
    })
  } catch (e) {
    await reportError(db, e)
    return jsonResponse({ message: "Something went wrong..." }, 500)
  }
}
