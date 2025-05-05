import { z } from "zod"
import { jsonResponse, reportError } from "../cfPagesFunctionsUtils"
import { drizzle } from "drizzle-orm/d1"
import { projectTable } from "../../../shared/drizzle-schema"
import { eq } from "drizzle-orm"

type ENV = {
    DB: D1Database,
    SOLANA_RPC_URL: string,
}

// Request schema for checking if a token account exists
const checkTokenAccountSchema = z.object({
    walletAddress: z.string(),
    tokenMint: z.string(),
    projectId: z.string().optional(), // Make projectId optional for direct token account checks
})

export const onRequestGet: PagesFunction<ENV> = async (ctx) => {
    const db = drizzle(ctx.env.DB, { logger: true })

    try {
        const SOLANA_RPC_URL = ctx.env.SOLANA_RPC_URL
        const HELIUS_API_KEY = SOLANA_RPC_URL.split('api-key=')[1]    // extract helius api key

        // Validate env
        if (!HELIUS_API_KEY) {
            return jsonResponse({ message: 'Missing environment variable: HELIUS_API_KEY' }, 500)
        }

        // Get query parameters
        const url = new URL(ctx.request.url)
        const walletAddress = url.searchParams.get('walletAddress')
        const tokenMint = url.searchParams.get('tokenMint')
        const projectId = url.searchParams.get('projectId')

        // Validate request
        if (!walletAddress || !tokenMint) {
            return jsonResponse({ message: 'Missing required parameters: walletAddress or tokenMint' }, 400)
        }

        // Validate with schema
        const { success } = checkTokenAccountSchema.safeParse({
            walletAddress,
            tokenMint,
            projectId: projectId || undefined
        })

        if (!success) {
            return jsonResponse({ message: 'Invalid parameters' }, 400)
        }

        // If projectId is provided, get the project and cluster
        let cluster = 'mainnet'
        
        if (projectId) {
            const project = await db
                .select()
                .from(projectTable)
                .where(eq(projectTable.id, projectId))
                .get()
                
            if (!project) {
                return jsonResponse({ message: 'Project not found!' }, 404)
            }
            
            cluster = project.json.config.cluster
        }

        // Use Helius API to check if token account exists
        const baseUrl = cluster === 'devnet' 
            ? `https://api-devnet.helius.xyz/v0/addresses/${walletAddress}/balances?api-key=${HELIUS_API_KEY}` 
            : `https://api.helius.xyz/v0/addresses/${walletAddress}/balances?api-key=${HELIUS_API_KEY}`
            
        console.log(`Checking token account for wallet: ${walletAddress}, mint: ${tokenMint}, cluster: ${cluster}`)
            
        const response = await fetch(baseUrl)
        
        if (!response.ok) {
            throw new Error(`Helius API error: ${response.status} ${response.statusText}`)
        }
        
        const responseText = await response.text()
        
        if (!responseText || responseText.trim() === '') {
            return jsonResponse({ 
                exists: false,
                tokenAccountInfo: null,
                error: "Empty response from Helius API"
            }, 200)
        }
        
        let balanceData
        try {
            balanceData = JSON.parse(responseText)
        } catch (e) {
            console.error("Failed to parse Helius API response:", responseText)
            return jsonResponse({ 
                exists: false, 
                tokenAccountInfo: null,
                error: "Invalid JSON response from Helius API" 
            }, 200)
        }
        
        // Check if tokens property exists and is an array
        if (!balanceData.tokens || !Array.isArray(balanceData.tokens)) {
            return jsonResponse({ 
                exists: false,
                tokenAccountInfo: null
            }, 200)
        }
        
        // Check if token account exists
        const tokenAccount = balanceData.tokens.find((token) => token.mint === tokenMint)
        const exists = !!tokenAccount
        
        console.log(`Token account check result:`, {
            walletAddress,
            tokenMint,
            exists,
            tokenAccount
        })

        return jsonResponse({ 
            exists,
            tokenAccountInfo: tokenAccount || null
        }, 200)
        
    } catch (e) {
        console.error("Error checking token account:", e)
        await reportError(db, e)
        return jsonResponse({ 
            message: "Error checking token account", 
            error: e.message,
            exists: false,
            tokenAccountInfo: null 
        }, 500)
    }
}

// CORS headers
export const onRequestOptions: PagesFunction<ENV> = async () => {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    })
}
