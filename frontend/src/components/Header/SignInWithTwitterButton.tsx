import { Button } from "@/components/Button/Button.tsx"
import { useEffect } from "react"

/**
 * Find available scopes here: https://developer.x.com/en/docs/authentication/oauth-2-0/authorization-code
 */
const TWITTER_AUTH_SCOPE = ['tweet.read', 'users.read', 'follows.read', 'offline.access'].join(' ')
const TWITTER_OAUTH_BASE_URL = 'https://twitter.com/i/oauth2/authorize?'
const TWITTER_API_BASE_URL = 'https://api.twitter.com/2/oauth2/token?'

const clientId = import.meta.env.VITE_TWITTER_CLIENT_ID
const redirectUri = import.meta.env.VITE_TWITTER_REDIRECT_URI


export const SignInWithTwitterButton = () => {

  // TODO @twitter this function should run on page land, currently it is done through an on-mount effect for the SignInWithTwitterButton, that's not reliable enough
  async function signInWithCode() {
    const searchParams = new URL(window.location.href).searchParams;

    const state = searchParams.get('state')
    const code = searchParams.get('code')

    if (state !== 'state' || !code) return

    const queryParams = {
      code,
      'grant_type': 'authorization_code',
      'client_id': clientId,
      'redirect_uri': redirectUri,
      'code_verifier': 'challenge',
    }

    const params = (new URLSearchParams(queryParams)).toString()

    const finalUrl = TWITTER_API_BASE_URL + params

    console.log({ finalUrl })

    console.log('requesting....')
    // TODO @twitter calling twitter API directly won't work because of CORS -> set up a function to mitigate this
    const response = await fetch(finalUrl, {
      method: 'post',
    })
    console.log('requesting finished.')

    console.log({ response })
  }

  useEffect(() => {
    signInWithCode()
  }, [])

  function signInWithTwitter() {
    const queryParams = {
      'client_id': clientId,
      'redirect_uri': redirectUri,
      'scope': TWITTER_AUTH_SCOPE,

      'response_type': 'code',
      'state': 'state',
      'code_challenge': 'challenge',
      'code_challenge_method': 'plain',
    }

    const params = new URLSearchParams(queryParams)
    const paramsString = params.toString()

    const finalUrl = TWITTER_OAUTH_BASE_URL + paramsString

    window.location.href = finalUrl
  }

  return <Button onClick={signInWithTwitter}>
    Sign In With Twitter
  </Button>
}
