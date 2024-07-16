const TWITTER_API_OAUTH2_TOKEN_URL = "https://api.twitter.com/2/oauth2/token"
const TWITTER_API_GET_ME_URL = "https://api.twitter.com/2/users/me" // ?user.fields=profile_image_url
const TWITTER_API_GET_FOLLOWING_URL =
  "https://api.twitter.com/2/users/:id/following?max_results=1000"

type ENV = {
  VITE_TWITTER_CLIENT_ID: string
  DB: D1Database
}
export const onRequest: PagesFunction<ENV> = async (ctx) => {
  try {
    const url = ctx.request.url

    const code = new URL(url).searchParams.get("code")
    const address = new URL(url).searchParams.get("address")

    if (!code) {
      return new Response(JSON.stringify({ message: "Code is missing!" }), {
        status: 400,
      })
    }

    const redirectUri = new URL(url)
    redirectUri.searchParams.delete("state")
    redirectUri.searchParams.delete("code")

    // sign in with code
    const accessToken = await signInWithCode({
      code,
      clientId: ctx.env.VITE_TWITTER_CLIENT_ID,
      redirectUri: redirectUri.href,
    })

    // get me
    const getMeRes = await fetch(TWITTER_API_GET_ME_URL, {
      method: "get",
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    })
    const getMeResponse = await getMeRes.json<GetMeResponse>()
    console.log({ getMeResponse })

    /**
     * TODO @twitter this is unimplemented because of API limitations (get followers requires a paid account)
     * For now, assume all users hitting this endpoint ARE following BorgPad
     */
    // get followers
    const getFollowingUrl = TWITTER_API_GET_FOLLOWING_URL.replace(
      ":id",
      getMeResponse.data.id,
    )
    const getFollowing = await fetch(getFollowingUrl, {
      method: "get",
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    })
    const getFollowingResponse = await getFollowing.json<GetFollowingResponse>()
    console.log({ getFollowingResponse })

    // database business
    const twitterId = getMeResponse.data.id

    // check if the user is stored in the db
    const existingUser = await ctx.env.DB.prepare(
      "SELECT * FROM user WHERE wallet_address = ?1",
    )
      .bind(address)
      .first<UserModel>()

    console.log({ existingUser })

    if (!existingUser) {
      console.log("User not found in db, inserting...")
      const json: UserModelJson = {
        isFollowingOnX: true
      }
      await ctx.env.DB.prepare(
        "INSERT INTO user (wallet_address, twitter_id, json) VALUES (?1, ?2, ?3)",
      )
        .bind(address, twitterId, JSON.stringify(json))
        .run()
      console.log("User inserted into db.")
    } else {
      console.log("User found in db, updating...")
      const json = existingUser.json ? JSON.parse(existingUser.json) as UserModelJson : {}
      json.isFollowingOnX = true
      await ctx.env.DB.prepare(
        "UPDATE user SET twitter_id = ?2, json = ?3 WHERE wallet_address = ?1",
      )
        .bind(address, twitterId, JSON.stringify(json))
        .run()
      console.log("User twitter id updated")
    }

    return new Response(null, {
      status: 302,
      headers: {
        Location: "/",
      },
    })
  } catch (e) {
    console.error(e)
    return new Response(
      JSON.stringify({
        message: "Something went wrong...",
      }),
      { status: 500 },
    )
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
    username: string
    name: string
  }
}
type GetFollowingResponse = {
  data: {
    id: string
    name: string
    username: string
  }[]
}
type UserModel = {
  wallet_address: string
  twitter_id: string
  json: null | string
}
type UserModelJson = {
  isFollowingOnX?: boolean
  isNotUsaResident?: boolean
}
