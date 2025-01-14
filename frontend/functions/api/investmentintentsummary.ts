import { jsonResponse, reportError } from "./cfPagesFunctionsUtils"

/**
 * Query for fetching investment intent's summary.
 * ?1 param = projectId
 */
const query = `
  SELECT
      SUM(json -> 'investmentIntent' -> ?1 ->> 'amount') as sum,
      AVG(json -> 'investmentIntent' -> ?1 ->> 'amount') as avg,
      COUNT(json -> 'investmentIntent' -> ?1 ->> 'amount') as count
  FROM user;
`

type ENV = {
  DB: D1Database
}
export const onRequestGet: PagesFunction<ENV> = async (ctx) => {
  const db = ctx.env.DB

  try {
    const { searchParams } = new URL(ctx.request.url)
    const projectId = searchParams.get("projectId")
    if (!projectId) return jsonResponse({ message: 'projectId is missing!' }, 400)

    const result = await db
      .prepare(query)
      .bind(projectId)
      .first()

    const response = {
      sum: result?.sum ?? 0,
      avg: result?.avg ?? 0,
      count: result?.count ?? 0,
    }

    return jsonResponse(response, {
      headers: {
        "Cache-Control": "public, max-age=15",
      }
    })
  } catch (e) {
    await reportError(db, e)
    return jsonResponse({ message: "Something went wrong..." }, 500)
  }
}
