const express = require('express')
const cors = require('cors')

const app = express()
const PORT = 3001

// Load environment variables from .env.local or .env if available
try {
  const dotenv = require('dotenv')
  const fs = require('fs')
  
  if (fs.existsSync('.env.local')) {
    dotenv.config({ path: '.env.local' })
    console.log('✓ Loaded environment from .env.local')
  } else if (fs.existsSync('.env')) {
    dotenv.config({ path: '.env' })
    console.log('✓ Loaded environment from .env')
  } else {
    console.log('⚠️  No .env or .env.local file found')
  }
} catch (e) {
  console.log('Note: dotenv not available, using process.env directly')
}

app.use(cors())
app.use(express.json())

app.post('/api/github-oauth-token', async (req, res) => {
  try {
    const { client_id, client_secret, code, redirect_uri } = req.body

    console.log('GitHub OAuth proxy: Exchanging code for token...')

    // Validate required fields
    if (!client_id || !client_secret || !code || !redirect_uri) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Use dynamic import for fetch since we're in CommonJS
    const fetch = (await import('node-fetch')).default

    // Exchange code for access token with GitHub
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id,
        client_secret,
        code,
        redirect_uri,
      }).toString(),
    })

    const tokenData = await tokenResponse.json()

    if (tokenData.error) {
      console.error('GitHub OAuth error:', tokenData.error, tokenData.error_description)
      return res.status(400).json({
        error: tokenData.error,
        error_description: tokenData.error_description,
      })
    }

    console.log('GitHub OAuth proxy: Token exchange successful')
    res.json({
      access_token: tokenData.access_token,
      token_type: tokenData.token_type,
      scope: tokenData.scope,
    })
  } catch (error) {
    console.error('GitHub OAuth proxy error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.listen(PORT, () => {
  console.log(`🔄 GitHub OAuth proxy server running on http://localhost:${PORT}`)
  console.log(`   Ready to handle OAuth requests for local development`)
}) 