
import { jsonResponse, reportError } from "../cfPagesFunctionsUtils"

const TWITTER_OAUTH2_BASE_PATH = "https://twitter.com/i/oauth2/authorize"
// const TWITTER_ANALYST_CALLBACK_URL = "http://localhost:8788/api/analyst/twittercallback"
// const TWITTER_ANALYST_CALLBACK_URL = "https://borgpad.com/api/analyst/twittercallback"

type ENV = {
  TWITTER_CLIENT_ID: string
  TWITTER_ANALYST_CALLBACK_URL: string
  VITE_ENVIRONMENT_TYPE: string
  DB: D1Database
}
export const onRequestGet: PagesFunction<ENV> = async (ctx) => {
  const db = ctx.env.DB
  try {
    const callbackUrl = ctx.env?.TWITTER_ANALYST_CALLBACK_URL
    const twitterClientId = ctx.env?.TWITTER_CLIENT_ID
    if (!callbackUrl || !twitterClientId) {
      throw new Error("Misconfigured path, variable missing!")
    }

    const state = Math.random().toString(36).substring(7);
    const params = new URLSearchParams({
        'response_type': 'code',
        'client_id': twitterClientId,
        'redirect_uri': callbackUrl,
        'scope': 'users.read tweet.read offline.access',
        'state': state,
        'code_challenge': 'challenge',
        'code_challenge_method': 'plain'
    });

    const twitterAuthUrl = `${TWITTER_OAUTH2_BASE_PATH}?${params.toString()}`

    return jsonResponse({ twitterAuthUrl }, 302 )
    
  } catch (e) {
    await reportError(db, e)
    return jsonResponse({ message: "Something went wrong..." }, 500)
  }
}

export const onRequestOptions: PagesFunction<ENV> = async (ctx) => {
  try {
    if (ctx.env.VITE_ENVIRONMENT_TYPE !== "develop") return
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': 'http://localhost:5173', // Adjusted this for frontend origin
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (error) {
    return jsonResponse({ message: error }, 500)
  }
}
