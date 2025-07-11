export type GitHubUser = {
  id: string
  username: string
  name: string
  email: string
  avatar_url: string
}

export type GitHubAuthData = {
  accessToken: string
  user: GitHubUser
}

type GitHubEmail = {
  email: string
  primary: boolean
  verified: boolean
}

const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || ''
const GITHUB_CLIENT_SECRET = import.meta.env.VITE_GITHUB_CLIENT_SECRET || ''
const REDIRECT_URI = `${window.location.origin}/apply`

// Check if GitHub credentials are configured
const isGitHubConfigured = () => {
  if (!GITHUB_CLIENT_ID) {
    console.error('VITE_GITHUB_CLIENT_ID is not configured')
    return false
  }
  return true
}

export class GitHubAuth {
  private static STORAGE_KEY = 'github_auth_data'

  // Generate OAuth URL
  static getAuthUrl(): string {
    if (!isGitHubConfigured()) {
      throw new Error('GitHub OAuth is not properly configured')
    }
    
    const state = Math.random().toString(36).substring(2, 15)
    localStorage.setItem('github_oauth_state', state)
    
    const params = new URLSearchParams({
      client_id: GITHUB_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      scope: 'user:email',
      state: state,
      allow_signup: 'true'
    })
    
    return `https://github.com/login/oauth/authorize?${params.toString()}`
  }

  // Handle OAuth callback
  static async handleCallback(code: string, state: string): Promise<GitHubAuthData> {
    if (!isGitHubConfigured()) {
      throw new Error('GitHub OAuth is not properly configured')
    }
    
    // Verify state parameter
    const storedState = localStorage.getItem('github_oauth_state')
    if (state !== storedState) {
      throw new Error('Invalid state parameter')
    }
    localStorage.removeItem('github_oauth_state')

    // Exchange code for access token via our backend API
    // (In local development, this is proxied to GitHub's OAuth endpoint)
    const tokenResponse = await fetch('/api/github-oauth-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code: code,
        redirect_uri: REDIRECT_URI,
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token')
    }

    const tokenData = await tokenResponse.json()
    
    if (tokenData.error) {
      throw new Error(tokenData.error_description || 'OAuth error')
    }
    
    const accessToken = tokenData.access_token

    // Get user info
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `token ${accessToken}`,
      },
    })

    if (!userResponse.ok) {
      throw new Error('Failed to get user info')
    }

    const userInfo = await userResponse.json()

    // Get user email
    const emailResponse = await fetch('https://api.github.com/user/emails', {
      headers: {
        Authorization: `token ${accessToken}`,
      },
    })

    let primaryEmail = userInfo.email
    if (emailResponse.ok) {
      const emails: GitHubEmail[] = await emailResponse.json()
      const primary = emails.find((email: GitHubEmail) => email.primary)
      if (primary) {
        primaryEmail = primary.email
      }
    }

    const user: GitHubUser = {
      id: userInfo.id.toString(),
      username: userInfo.login,
      name: userInfo.name || userInfo.login,
      email: primaryEmail,
      avatar_url: userInfo.avatar_url,
    }

    const authData: GitHubAuthData = {
      accessToken,
      user,
    }

    // Store in localStorage
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(authData))

    return authData
  }

  // Get stored auth data
  static getStoredAuth(): GitHubAuthData | null {
    const stored = localStorage.getItem(this.STORAGE_KEY)
    if (!stored) return null
    
    try {
      return JSON.parse(stored)
    } catch {
      return null
    }
  }

  // Clear stored auth data
  static clearAuth(): void {
    localStorage.removeItem(this.STORAGE_KEY)
    localStorage.removeItem('github_oauth_state')
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return this.getStoredAuth() !== null
  }

  // Initiate OAuth flow
  static login(): void {
    const authUrl = this.getAuthUrl()
    window.location.href = authUrl
  }

  // Logout
  static logout(): void {
    this.clearAuth()
  }
} 