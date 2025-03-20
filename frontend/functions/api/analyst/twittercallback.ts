import { AnalystType } from "../../../shared/models"
import { jsonResponse, reportError } from "../cfPagesFunctionsUtils"
import { AnalystService } from "../../services/analystService"

const TWITTER_API_OAUTH2_TOKEN_URL = "https://api.twitter.com/2/oauth2/token"
const TWITTER_API_GET_ME_URL = "https://api.twitter.com/2/analysts/me" // ?analyst.fields=profile_image_url

type ENV = {
  TWITTER_CLIENT_ID: string
  DB: D1Database
}
export const onRequest: PagesFunction<ENV> = async (ctx) => {
  const db = ctx.env.DB
  try {
    const url = ctx.request.url

    const code = new URL(url).searchParams.get("code")
    console.log("🚀 ~ code:", code)
    const address = new URL(url).searchParams.get("address")
    console.log("🚀 ~ address:", address)

    if (!code || !address) {
      return new Response(JSON.stringify({ message: "Code or address is missing!" }), {
        status: 400,
      })
    }

    const redirectUri = new URL(url)
    redirectUri.searchParams.delete("state")
    redirectUri.searchParams.delete("code")

    // sign in with code
    const accessToken = await signInWithCode({
      code,
      clientId: ctx.env.TWITTER_CLIENT_ID,
      redirectUri: redirectUri.href,
    })
    console.log("🚀 ~ accessToken:", accessToken)

    // get me
    const getMeRes = await fetch(TWITTER_API_GET_ME_URL, {
      method: "get",
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    })
    const getMeResponse = await getMeRes.json<GetMeResponse>()
    console.log("🚀 ~ getMeResponse:", getMeResponse)

    // database business
    const twitterId = getMeResponse.data.id

    // check if the analyst is stored in the db
    const existingAnalyst = await AnalystService.findAnalystByTwitterAccount({ db, twitterId })

    console.log({ existingAnalyst })

    const initialTwitterData = {
      twitterId,
    }
    // if (!existingAnalyst) {
    //   console.log("Analyst not found in db, inserting...")
    //   const json: AnalystType = { twitterId }
    //   await db
    //     .prepare("INSERT INTO analyst (address, json) VALUES (?1, ?2)")
    //     .bind(address, JSON.stringify(json))
    //     .run()
    //   console.log("Analyst inserted into db.")
    // } else {
    //   console.log("Analyst found in db, updating...")

    //   const json = existingAnalyst ?? {}
    //   if (!json.twitter) json.twitterId = twitterId

    //   await db
    //     .prepare("UPDATE analyst SET json = ?2 WHERE address = ?1")
    //     .bind(address, JSON.stringify(json))
    //     .run()
    //   console.log("Analyst twitter id updated")
    // }

    return new Response(null, {
      status: 302,
      headers: {
        Location: "/",
      },
    })
  } catch (e) {
    await reportError(db, e)
    return jsonResponse({ message: "Something went wrong..." }, 500)
  }
}

type SignInWithCodeArgs = {
  code: string
  clientId: string
  redirectUri: string
}
async function signInWithCode({
  code,
  clientId,
  redirectUri,
}: SignInWithCodeArgs): Promise<string> {
  const twitterAuthUrl = new URL(TWITTER_API_OAUTH2_TOKEN_URL)
  twitterAuthUrl.searchParams.set("code", code)
  twitterAuthUrl.searchParams.set("grant_type", "authorization_code")
  twitterAuthUrl.searchParams.set("client_id", clientId)
  twitterAuthUrl.searchParams.set("redirect_uri", redirectUri)
  twitterAuthUrl.searchParams.set("code_verifier", "challenge")

  const authRes = await fetch(twitterAuthUrl, {
    method: "post",
  })
  const authResponse = await authRes.json<SignInWithCodeResponse>()

  return authResponse["access_token"]
}

type SignInWithCodeResponse = {
  access_token: string
}
type GetMeResponse = {
  data: {
    id: string
    userName: string
    name: string
  }
}
