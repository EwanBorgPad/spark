
import { jsonResponse, reportError } from "../cfPagesFunctionsUtils"

const TWITTER_OAUTH2_BASE_PATH = "https://twitter.com/i/oauth2/authorize"
// const TWITTER_ANALYST_CALLBACK_URL = "https://borgpad.com"
const TWITTER_ANALYST_CALLBACK_URL = "https://borgpad.com/api/analyst/twittercallback"

type ENV = {
  TWITTER_CLIENT_ID: string
  TWITTER_CALLBACK_URL: string
  DB: D1Database
}
export const onRequestGet: PagesFunction<ENV> = async (ctx) => {
  const db = ctx.env.DB
  try {
    const state = Math.random().toString(36).substring(7);
    const params = new URLSearchParams({
        'response_type': 'code',
        'client_id': ctx.env.TWITTER_CLIENT_ID,
        'redirect_uri': TWITTER_ANALYST_CALLBACK_URL,
        'scope': 'users.read',
        'state': state,
        'code_challenge': 'challenge2025',
        'code_challenge_method': 'plain'
    });

    const twitterAuthUrl = `${TWITTER_OAUTH2_BASE_PATH}?${params.toString()}`

    return jsonResponse({ twitterAuthUrl }, 200)
    
  } catch (e) {
    await reportError(db, e)
    return jsonResponse({ message: "Something went wrong..." }, 500)
  }
}

export const onRequestOptions: PagesFunction<ENV> = async (ctx) => {
  try {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': 'http://localhost:5173', // Adjust this to frontend origin
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (error) {
    return jsonResponse({ message: error }, 500)
  }
}
