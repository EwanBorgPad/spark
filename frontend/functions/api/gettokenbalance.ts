import { jsonResponse, reportError } from "./cfPagesFunctionsUtils"
import { getRpcUrlForCluster } from "../../shared/solana/rpcUtils"
import { Connection, PublicKey } from '@solana/web3.js'
import { getAssociatedTokenAddress } from '@solana/spl-token'

// Enhanced cache for token balances with longer TTL
const balanceCache = new Map<string, { balance: number; timestamp: number; promise?: Promise<number> }>()
const CACHE_TTL = 1800000 // 30 minutes cache - very aggressive to prevent RPC calls

// Clean up expired cache entries
function cleanupCache() {
  const now = Date.now()
  for (const [key, value] of balanceCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      balanceCache.delete(key)
    }
  }
}

// Retry configuration for RPC calls
const MAX_RETRIES = 2
const BASE_DELAY = 2000 // 2 seconds

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = MAX_RETRIES
): Promise<T> {
  let lastError: Error
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      
      // Check for rate limiting more comprehensively
      const isRateLimited = error.toString().includes('429') || 
                           error.toString().includes('Too Many Requests') ||
                           error.toString().includes('rate limit')
      
      // If it's not a rate limit error or we've exhausted retries, throw immediately
      if (attempt === maxRetries || !isRateLimited) {
        throw error
      }
      
      // Calculate delay with exponential backoff and add some jitter
      const baseDelay = BASE_DELAY * Math.pow(2, attempt)
      const jitter = Math.random() * 1000 // Add up to 1 second of random jitter
      const delay = baseDelay + jitter
      
      await sleep(delay)
    }
  }
  
  throw lastError!
}

type ENV = {
  DB: D1Database
  RPC_URL: string
}

type GetTokenBalanceResponse = {
  success: boolean
  balance: number
  mint: string
  userAddress: string
}

export const onRequestGet: PagesFunction<ENV> = async (ctx) => {
  const db = ctx.env.DB

  try {
    const { searchParams } = new URL(ctx.request.url)
    const userAddress = searchParams.get("userAddress")
    const tokenMint = searchParams.get("tokenMint")
    const cluster = searchParams.get("cluster") || "mainnet"

    // Validate required parameters
    if (!userAddress || !tokenMint) {
      return jsonResponse({ 
        message: "Missing required parameters: userAddress and tokenMint" 
      }, 400)
    }

    if (!['devnet', 'mainnet'].includes(cluster)) {
      return jsonResponse({ 
        message: `Unsupported cluster (${cluster})!` 
      }, 400)
    }

    // Validate Solana addresses
    try {
      new PublicKey(userAddress)
      new PublicKey(tokenMint)
    } catch (error) {
      return jsonResponse({ 
        message: "Invalid Solana address format" 
      }, 400)
    }

    // Clean up expired cache entries
    cleanupCache()
    
    // Debug: Log environment variable status
    console.log("RPC_URL present:", !!ctx.env.RPC_URL)
    if (ctx.env.RPC_URL) {
      console.log("RPC_URL length:", ctx.env.RPC_URL.length)
    }
    
    // Check cache first with cache key
    const cacheKey = `${userAddress}-${tokenMint}-${cluster}`
    console.log(`[gettokenbalance] Cache key: ${cacheKey}`)
    const cached = balanceCache.get(cacheKey)
    
    if (cached) {
      console.log(`[gettokenbalance] Found cached data:`, cached)
      // If we have a cached result and it's still valid, return it
      if (Date.now() - cached.timestamp < CACHE_TTL) {
        console.log(`[gettokenbalance] Returning cached balance: ${cached.balance}`)
        const response: GetTokenBalanceResponse = {
          success: true,
          balance: cached.balance,
          mint: tokenMint,
          userAddress
        }
        return jsonResponse(response, 200)
      }
      
      // If there's an ongoing request for this key, wait for it
      if (cached.promise) {
        console.log(`[gettokenbalance] Waiting for ongoing request...`)
        try {
          const balance = await cached.promise
          console.log(`[gettokenbalance] Got balance from ongoing request: ${balance}`)
          const response: GetTokenBalanceResponse = {
            success: true,
            balance,
            mint: tokenMint,
            userAddress
          }
          return jsonResponse(response, 200)
        } catch (error) {
          // If the ongoing request failed, remove it and continue with fresh request
          console.log(`[gettokenbalance] Ongoing request failed, removing from cache:`, error)
          balanceCache.delete(cacheKey)
        }
      }
    } else {
      console.log(`[gettokenbalance] No cached data found, fetching fresh data`)
    }

    // Create a promise for this request to prevent duplicate requests
    const balancePromise = (async () => {
      // Get RPC URLs for the cluster with fallback options
      const getRpcUrls = (cluster: string): string[] => {
        const urls: string[] = []
        
        if (ctx.env.RPC_URL) {
          try {
            // Extract the Helius API key if present
            const heliusApiKeyMatch = ctx.env.RPC_URL.match(/api-key=([^&]+)/)
            const heliusApiKey = heliusApiKeyMatch ? heliusApiKeyMatch[1] : null

            if (heliusApiKey) {
              // Add Helius URLs first (they're usually faster)
              if (cluster === "mainnet") {
                urls.push(`https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`)
              } else {
                urls.push(`https://devnet.helius-rpc.com/?api-key=${heliusApiKey}`)
              }
            } else {
              // Use provided URL as is
              urls.push(getRpcUrlForCluster(ctx.env.RPC_URL, cluster))
            }
          } catch (error) {
            // If there's an error with the provided RPC URL, skip it and use fallbacks
            console.error("Error processing RPC_URL:", error)
          }
        }
        
        // Add fallback RPC endpoints in order of reliability
        if (cluster === "mainnet") {
          // Try faster/more reliable endpoints first
          urls.push("https://solana-api.projectserum.com")
          urls.push("https://api.mainnet-beta.solana.com")
          urls.push("https://rpc.ankr.com/solana")
        } else {
          urls.push("https://api.devnet.solana.com")
        }
        
        return urls
      }

      const rpcUrls = getRpcUrls(cluster)
      console.log("Generated RPC URLs:", rpcUrls)
      let connection: Connection
      let lastError: Error

      // Try each RPC URL until one works
      for (const rpcUrl of rpcUrls) {
        try {
          connection = new Connection(rpcUrl, "confirmed")
          // Test the connection with a simple call and timeout
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('RPC timeout')), 10000)
          )
          await Promise.race([
            connection.getSlot(),
            timeoutPromise
          ])
          break // If successful, break out of the loop
        } catch (error) {
          lastError = error as Error
          // If it's a rate limit error, try the next RPC URL
          if (error.toString().includes('429')) {
            continue
          }
          // For other errors, throw immediately
          throw error
        }
      }

      if (!connection!) {
        throw new Error(`All RPC endpoints failed. Last error: ${lastError?.message || 'No RPC URLs available'}`)
      }

      // Get user's token account address
      const userPubkey = new PublicKey(userAddress)
      const tokenMintPubkey = new PublicKey(tokenMint)

      console.log(`[gettokenbalance] User address: ${userAddress}`)
      console.log(`[gettokenbalance] Token mint: ${tokenMint}`)

      const userTokenAccount = await getAssociatedTokenAddress(
        tokenMintPubkey,
        userPubkey
      )
      console.log(`[gettokenbalance] Token account address: ${userTokenAccount.toBase58()}`)

      // Get token account balance with retry logic and timeout
      let balance = 0
      try {
        console.log(`[gettokenbalance] Fetching token account balance...`)
        const tokenAccountInfo = await retryWithBackoff(() => 
          Promise.race([
            connection.getTokenAccountBalance(userTokenAccount),
            new Promise<never>((_, reject) => 
              setTimeout(() => reject(new Error('Token balance fetch timeout')), 20000)
            )
          ])
        )
        console.log(`[gettokenbalance] Raw token account info:`, tokenAccountInfo)
        balance = tokenAccountInfo.value.uiAmount || 0
        console.log(`[gettokenbalance] Calculated balance: ${balance}`)
      } catch (error) {
        // If token account doesn't exist or rate limited, balance is 0
        console.log(`[gettokenbalance] Error fetching balance:`, error)
        balance = 0
      }

      return balance
    })()

    // Store the promise in cache to prevent duplicate requests
    balanceCache.set(cacheKey, { 
      balance: 0, 
      timestamp: Date.now(), 
      promise: balancePromise 
    })

    // Wait for the balance to be fetched
    const balance = await balancePromise

    // Update cache with the final result (remove the promise)
    balanceCache.set(cacheKey, { 
      balance, 
      timestamp: Date.now() 
    })

    console.log(`[gettokenbalance] Final balance calculated: ${balance}`)
    console.log(`[gettokenbalance] Cache updated with new balance`)

    const response: GetTokenBalanceResponse = {
      success: true,
      balance,
      mint: tokenMint,
      userAddress
    }

    console.log(`[gettokenbalance] Returning response:`, response)
    return jsonResponse(response, 200)

  } catch (e) {
    console.error("Token balance fetch error:", e)
    await reportError(db, e)
    return jsonResponse({ 
      message: "Something went wrong while fetching token balance...",
      error: e instanceof Error ? e.message : "Unknown error"
    }, 500)
  }
}

export const onRequestOptions: PagesFunction<ENV> = async (ctx) => {
  try {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': 'http://localhost:5173',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (error) {
    return jsonResponse({ message: error }, 500)
  }
} 