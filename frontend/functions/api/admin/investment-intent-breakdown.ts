import { hasAdminAccess, jsonResponse, reportError } from "../cfPagesFunctionsUtils"

/**
 * Query for fetching investment intents.
 * ?1 param = projectId
 */
const query = `
  SELECT
    address,
    json -> 'investmentIntent' -> ?1 ->> 'amount' AS investment_interest_amount,
    json -> 'investmentIntent' -> ?1 ->> 'providedAt' AS investment_interest_provided_at,
    json -> 'termsOfUse' ->> 'countryOfOrigin' AS terms_of_use_country_of_origin,
    json -> 'termsOfUse' ->> 'acceptedAt' AS terms_of_use_accepted_at
  FROM user
  WHERE json -> 'investmentIntent' -> ?1 IS NOT NULL;
`

type ENV = {
  DB: D1Database
  ADMIN_API_KEY_HASH: string
}
export const onRequestGet: PagesFunction<ENV> = async (ctx) => {
  const db = ctx.env.DB

  try {
    const { searchParams } = new URL(ctx.request.url)
    const projectId = searchParams.get('projectId')
    if (!projectId) return jsonResponse({ message: 'projectId is missing!' }, 400)

    // authorize request
    if (!hasAdminAccess(ctx)) {
      return jsonResponse(null, 401)
    }

    const queryResult = await db
      .prepare(query)
      .bind(projectId)
      .all()

    const data = queryResult.results

    return jsonResponse({ data }, {
      headers: {
        "Cache-Control": "public, max-age=15",
      }
    })
  } catch (e) {
    await reportError(db, e)
    return jsonResponse({ message: "Something went wrong..." }, 500)
  }
}
