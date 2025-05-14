import { jsonResponse, reportError } from "../cfPagesFunctionsUtils";

type ENV = {
  DB: D1Database
}

// Add this handler for OPTIONS requests
export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "http://localhost:5173",
      "Access-Control-Allow-Methods": "OPTIONS, GET, PUT, POST, DELETE, HEAD",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  })
}

// Endpoint to get a user's referral code
export const onRequestGet: PagesFunction<ENV> = async (ctx) => {
  const db = ctx.env.DB
  try {
    const url = new URL(ctx.request.url)
    const projectId = url.searchParams.get("projectId")


    // Order all the referrals for the leaderboard by invested_dollar_value grouped by referrer_by
    const leaderboardReferrals = await db
      .prepare(`
        SELECT 
          SUBSTR(referrer_by, 1, 4) AS referrer_by, 
          SUM(invested_dollar_value) AS total_invested,
          MAX(result_type) as result_type
        FROM referral
        WHERE project_id = ?
        GROUP BY referrer_by
        ORDER BY 
          CASE 
            WHEN MAX(result_type) = 'ranking' THEN 1
            WHEN MAX(result_type) = 'raffle' THEN 2
            ELSE 3
          END,
          total_invested DESC
      `)
      .bind(projectId)
      .all();

    console.log("leaderboardReferrals", leaderboardReferrals.results);

    // Get the sum of invested_dollar_value for the same address for referrer_by
    const totalTicketsDistributed = await db
    .prepare(`
      SELECT SUM(invested_dollar_value) AS total_invested
      FROM referral
      WHERE project_id = ?
    `)
    .bind(projectId)
    .all();

    console.log("totalTicketsDistributed", totalTicketsDistributed.results);

    return jsonResponse(
      { 
        leaderboardReferrals: leaderboardReferrals.results, 
        totalTicketsDistributed: totalTicketsDistributed.results
      }, 200);
  } catch (e) {
    await reportError(db, e);
    return jsonResponse({ message: "Something went wrong..." }, 500);
  }
}