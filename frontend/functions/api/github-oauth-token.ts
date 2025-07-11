import { jsonResponse, reportError } from "./cfPagesFunctionsUtils"

type ENV = {
  DB: D1Database
  GITHUB_CLIENT_ID: string
  GITHUB_CLIENT_SECRET: string
}

type GitHubTokenRequest = {
  client_id: string
  client_secret: string
  code: string
  redirect_uri: string
}

type GitHubTokenResponse = {
  access_token?: string
  token_type?: string
  scope?: string
  error?: string
  error_description?: string
}

export const onRequestPOST: PagesFunction<ENV> = async (ctx) => {
  try {
    const { client_id, client_secret, code, redirect_uri }: GitHubTokenRequest = await ctx.request.json()

    // Validate required fields
    if (!client_id || !client_secret || !code || !redirect_uri) {
      return jsonResponse({ message: "Missing required fields" }, 400)
    }

    // Validate client_id matches environment variable
    if (client_id !== ctx.env.GITHUB_CLIENT_ID) {
      return jsonResponse({ message: "Invalid client_id" }, 400)
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: ctx.env.GITHUB_CLIENT_ID,
        client_secret: ctx.env.GITHUB_CLIENT_SECRET,
        code: code,
        redirect_uri: redirect_uri,
      }),
    })

    if (!tokenResponse.ok) {
      return jsonResponse({ message: "Failed to exchange code for token" }, 400)
    }

    const tokenData: GitHubTokenResponse = await tokenResponse.json()
    
    if (tokenData.error) {
      return jsonResponse({ message: tokenData.error_description || "OAuth error" }, 400)
    }

    return jsonResponse({
      access_token: tokenData.access_token,
      token_type: tokenData.token_type,
      scope: tokenData.scope,
    }, 200)

  } catch (e) {
    await reportError(ctx.env.DB, e)
    return jsonResponse({ message: "Something went wrong..." }, 500)
  }
} 