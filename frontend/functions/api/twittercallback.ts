
type ENV = {
  VITE_TWITTER_CLIENT_ID: string
  VITE_TWITTER_REDIRECT_URI: string
}
export const onRequest: PagesFunction<ENV> = async (context) => {
  try {
    const code = new URL(context.request.url).searchParams.get('code')

    console.log({ code })
    const env = context.env
    console.log({ env })

    if (!code) {
      return new Response(
        JSON.stringify({ message: 'Code is missing!'}),
        { status: 400 },
      )
    }

    const getMeResponse = await signInWithCode({
      code,
      clientId: env.VITE_TWITTER_CLIENT_ID,
      redirectUri: env.VITE_TWITTER_REDIRECT_URI,
    })

    console.log({ getMeResponse })

    return new Response(null, {
      status: 302,
      headers: {
        'Location': '/',
      }
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

const TWITTER_API_OAUTH2_TOKEN_URL = 'https://api.twitter.com/2/oauth2/token'
const TWITTER_API_GET_ME_URL = 'https://api.twitter.com/2/users/me?user.fields=profile_image_url'

type SignInWithCodeArgs = {
  code: string
  clientId: string
  redirectUri: string
}
async function signInWithCode({ code, clientId, redirectUri }: SignInWithCodeArgs) {
  const twitterAuthUrl = new URL(TWITTER_API_OAUTH2_TOKEN_URL)
  twitterAuthUrl.searchParams.set('code', code)
  twitterAuthUrl.searchParams.set('grant_type', 'authorization_code')
  twitterAuthUrl.searchParams.set('client_id', clientId)
  twitterAuthUrl.searchParams.set('redirect_uri', redirectUri)
  twitterAuthUrl.searchParams.set('code_verifier', 'challenge')

  const authRes = await fetch(twitterAuthUrl, {
    method: 'post',
  })
  const authResponse = await authRes.json()

  const accessToken = authResponse['access_token']

  const getMeRes = await fetch(TWITTER_API_GET_ME_URL, {
    method: 'get',
    headers: {
      'Authorization': 'Bearer ' + accessToken,
    },
  })
  const getMeResponse = await getMeRes.json<GetMeResponse>()

  return getMeResponse
}

type GetMeResponse = {
  data: {
    id: string
    username: string
    name: string
  }
}
