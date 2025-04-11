import { jsonResponse, reportError } from "../cfPagesFunctionsUtils"
import { AnalystService } from "../../services/analystService"
import { GetMeTwitterResponse } from "../../../shared/types/api-types"
import { Analyst } from "../../../shared/drizzle-schema"

const TWITTER_API_OAUTH2_TOKEN_URL = "https://api.twitter.com/2/oauth2/token"
const TWITTER_API_GET_ME_URL = "https://api.twitter.com/2/users/me?user.fields=profile_image_url"

type ENV = {
  TWITTER_CLIENT_ID: string
  TWITTER_CLIENT_SECRET: string
  DB: D1Database
  AUTH_SESSIONS_STAGE: KVNamespace;
  AUTH_SESSIONS_PRODUCTION: KVNamespace;
  AUTH_SESSION_DEVELOP: KVNamespace;
  VITE_ENVIRONMENT_TYPE: string
}
export const onRequest: PagesFunction<ENV> = async (ctx) => {
  const db = ctx.env.DB
  console.log(ctx.request);
  try {
    const url = ctx.request.url

    const code = new URL(url).searchParams.get("code")
    console.log("🚀 ~ code:", code)
    const state = new URL(url).searchParams.get("state")
    console.log("🚀 ~ state:", state)


    if (!code || !state ) {
      const locationBasePath = getHeaderLocationBasePath(new URL(url))
      return new Response(JSON.stringify({ message: "Code, state or project url is missing!" }), {
        status: 302,
        headers: { 
          "Location": `${locationBasePath}/draft-picks/null`
        }
      })
    }

    const redirectUri = new URL(url)
    console.log(redirectUri);
    redirectUri.searchParams.delete("state")
    redirectUri.searchParams.delete("code")

    // sign in with code
    const accessToken = await signInWithCode({
      code,
      clientId: ctx.env.TWITTER_CLIENT_ID,
      clientSecret: ctx.env.TWITTER_CLIENT_SECRET,
      redirectUri: redirectUri.href,
    })
    console.log("🚀 ~ accessToken:", accessToken)

    // get me
    const twitterUserResponse = await fetch(TWITTER_API_GET_ME_URL, {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      },
    })
    console.log("🚀 ~ twitterUserResponse:", twitterUserResponse)
    if (!twitterUserResponse.ok) {
      throw new Error("Get Me Response Failed!")
    }

    const twitterUserResponseBody = await twitterUserResponse.json<GetMeTwitterResponse>()
    console.log("🚀 ~ twitterUserResponseBody:", twitterUserResponseBody)

    const twitterId = twitterUserResponseBody.data.id
    const twitterAvatar = twitterUserResponseBody.data.profile_image_url
    const twitterUsername = twitterUserResponseBody.data.username
    const twitterName = twitterUserResponseBody.data.name

    // check if the analyst is stored in the db
    const existingAnalyst = await AnalystService.findAnalystByTwitterAccount({ db, twitterId })

    console.log({ existingAnalyst })

    let analyst: Analyst;

    if (!existingAnalyst) {
      console.log("User not found in db, inserting...")
      analyst = await AnalystService.createNewAnalyst({db, ...twitterUserResponseBody.data }) as Analyst
      console.log("🚀 ~ newAnalyst:", analyst)
      console.log("User inserted into db.")

      
    } else {
      console.log("User found in db, updating twitter id...")

      analyst = await AnalystService.updateAnalyst({
        db, 
        analyst: existingAnalyst, 
        updates: {
          twitterId,
          twitterAvatar,
          twitterName,
          twitterUsername
        }
      })
      console.log("🚀 ~ updatedAnalyst:", analyst)

      console.log("✅ User twitter id updated, returning updated version of analyst.")
    }

    // Generate a unique session ID
    const sessionId = crypto.randomUUID();

    const locationBasePath = getHeaderLocationBasePath(redirectUri)
    
    // Store the data in KV with a 10-second expiration
    const kvStore = ctx.env.AUTH_SESSION_DEVELOP;
    // const kvStore = ctx.env.VITE_ENVIRONMENT_TYPE === 'develop' ? ctx.env.AUTH_SESSIONS_STAGE : ctx.env.AUTH_SESSIONS_PRODUCTION;
    await kvStore.put(sessionId, JSON.stringify({ analyst }), {
      expirationTtl: 60,
    });

    return jsonResponse(null, {
      statusCode: 302,
      headers: { 
        "Location": `${locationBasePath}/draft-picks/null?sessionId=${sessionId}`,
        "Cache-Control": "no-store"
      }
    })

  } catch (e) {
    await reportError(db, e)
    return jsonResponse({ message: "Something went wrong..." }, 500)
  }
}

type SignInWithCodeArgs = {
  code: string
  clientId: string
  clientSecret: string
  redirectUri: string
}
async function signInWithCode({
  code,
  clientId,
  clientSecret,
  redirectUri,
}: SignInWithCodeArgs): Promise<string> {
  const twitterAuthUrl = new URL(TWITTER_API_OAUTH2_TOKEN_URL)
  twitterAuthUrl.searchParams.set("code", code)
  twitterAuthUrl.searchParams.set("grant_type", "authorization_code")
  twitterAuthUrl.searchParams.set("client_id", clientId)
  twitterAuthUrl.searchParams.set("redirect_uri", redirectUri)
  twitterAuthUrl.searchParams.set("code_verifier", "challenge")

  const bearerToken = btoa(`${clientId}:${clientSecret}`)
  console.log("🚀 ~ twitterAuthUrl:", twitterAuthUrl)

  const authRes = await fetch(twitterAuthUrl, {
    method: "post",
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${bearerToken}`
  },
  })
  const authResponse = await authRes.json<SignInWithCodeResponse>()

  if (authResponse?.error) throw new Error ("signInWithCode failed")

  return authResponse["access_token"]
}

type SignInWithCodeResponse = {
  access_token: string
  error?: string
  error_description?: string
}

const getHeaderLocationBasePath = (url: URL) => {
  console.log("🚀 ~ url.origin: ", url.origin);
  if (url.origin === "http://localhost:8788") {
    return "http://localhost:5173"
  } else {
    return url.origin
  }
}