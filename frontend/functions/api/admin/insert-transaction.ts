import { z } from "zod"
import { jsonResponse, reportError } from "../cfPagesFunctionsUtils"
import { drizzle } from "drizzle-orm/d1"
import { Buffer } from "buffer"
import { Connection } from "@solana/web3.js"
import { getRpcUrlForCluster } from "../../../shared/solana/rpcUtils"
import { DepositService } from "../../services/depositService"
import { calculateTokens } from "../../../shared/utils/calculateTokens"
import { exchangeService } from "../../services/exchangeService"
import { EligibilityService } from "../../services/eligibilityService"
import { projectTable } from "../../../shared/drizzle-schema"
import { eq } from "drizzle-orm"
import { isApiKeyValid } from '../../services/apiKeyService'

type ENV = {
    DB: D1Database,
    SOLANA_RPC_URL: string
}

const requestSchema = z.object({
    txId: z.string(),
    projectId: z.string(),
    cluster: z.enum(["mainnet", "devnet"]).default("mainnet")
})

export const onRequestPost: PagesFunction<ENV> = async (ctx) => {
    const db = drizzle(ctx.env.DB, { logger: true })

    try {
        // authorize request
        if (!await isApiKeyValid({ ctx, permissions: ['write'] })) {
            return jsonResponse(null, 401)
        }
        const SOLANA_RPC_URL = ctx.env.SOLANA_RPC_URL

        // validate env
        if (!SOLANA_RPC_URL) {
            throw new Error('Missing SOLANA_RPC_URL in env!')
        }

        /////////////////////////////////////////
        //// REQUEST PARSING AND VALIDATION /////
        /////////////////////////////////////////

        const { data, error } = requestSchema.safeParse(await ctx.request.json())

        if (error || !data) return jsonResponse({ message: 'Bad request!', error }, 400)

        const { projectId, txId, cluster } = data

        // Get project data
        const project = await db
            .select()
            .from(projectTable)
            .where(eq(projectTable.id, projectId))
            .get()

        if (!project) return jsonResponse({ message: 'Project not found!' }, 404)

        /////////////////////////////////////////
        ////////// TRANSACTION RECOVERY /////////
        /////////////////////////////////////////

        const heliusApiKey = SOLANA_RPC_URL.split('api-key=')[1]  // extract helius api key

        console.log(`Recovering transaction ${txId} for project ${projectId}`)

        // Extract transaction data
        const {
            amountInLamports,
            decimals,
            lbpAddress,
            nftAddress,
            tokenAddress,
            tokenAmount,
            userWalletAddress
        } = await extractTransactionData(txId, heliusApiKey, cluster)

        console.log('Transaction data extracted successfully')

        // Get exchange data
        const raisedTokenCoinGeckoName = project.json.config.raisedTokenData.coinGeckoName
        if (!raisedTokenCoinGeckoName) {
            throw new Error(`raisedTokenCoinGeckoName missing for project (${projectId})!`)
        }

        const exchangeData = await exchangeService.getExchangeData({
            db,
            baseCurrency: raisedTokenCoinGeckoName,
            targetCurrency: 'usd',
        })

        // Calculate tokens
        const tokensCalculation = calculateTokens({
            projectData: project.json,
            borgCoinInput: tokenAmount,
            borgPriceInUSD: Number(exchangeData.currentPrice),
        })

        // Get eligibility status
        const eligibilityStatus = await EligibilityService.getEligibilityStatus({
            db,
            address: userWalletAddress,
            projectId,
            rpcUrl: getRpcUrlForCluster(SOLANA_RPC_URL, cluster),
        })
        const eligibilityTier = eligibilityStatus.eligibilityTier
        const tierId = eligibilityTier ? eligibilityTier.id : 'unknown'

        // Record the deposit
        await DepositService.createUserDeposit({
            db,
            amount: amountInLamports.toString(),
            projectId,
            walletAddress: userWalletAddress,
            tokenAddress,
            txId,
            lbpAddress,
            tierId,
            nftAddress,
            json: {
                cluster,
                uiAmount: tokenAmount,
                decimalMultiplier: decimals.toString(),
                tokensCalculation,
                transactionStatus: {
                    confirmationStatus: 'finalized'
                },
            },
        })

        return jsonResponse({
            success: true,
            message: "Deposit successfully recovered and recorded in database",
            data: {
                txId,
                userWalletAddress,
                tokenAmount,
                projectId
            }
        }, 200)
    } catch (e) {
        await reportError(db, e)
        return jsonResponse({ message: "Something went wrong...", error: e.message }, 500)
    }
}

// Copy of the extraction function from senddeposittransaction.ts
async function extractTransactionData(txId: string, heliusApiKey: string, cluster: string) {
    // api to parse with helius transactions with NFT and SPL token transfers which is ideal for our case
    const url = cluster === 'devnet'
        ? `https://api-devnet.helius.xyz/v0/transactions?api-key=${heliusApiKey}&commitment=confirmed`
        : `https://api.helius.xyz/v0/transactions?api-key=${heliusApiKey}&commitment=confirmed`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            transactions: [
                txId
            ]
        }),
    })
    const res = await response.json() as any
    const dataObject = res[0]

    // user is always the fee payer for the transaction
    const userWalletAddress = dataObject.feePayer
    const tokenTransfers = dataObject.tokenTransfers
    const splTokenTransfer = tokenTransfers.find(transfer => transfer.tokenStandard === 'Fungible')
    const nftTransfer = tokenTransfers.find(transfer => transfer.tokenStandard === 'NonFungible' || transfer.tokenStandard === 'ProgrammableNonFungible')

    // the following parsing logic can be found in helius api link above
    const tokenAddress = splTokenTransfer.mint
    const nftAddress = nftTransfer.mint
    const tokenAmount = splTokenTransfer.tokenAmount
    const lbpAddress = nftTransfer.fromUserAccount

    let decimals = 0
    dataObject.accountData.forEach(data => {
        if (data.tokenBalanceChanges.length)
            if (data.tokenBalanceChanges[0].mint === tokenAddress)
                decimals = data.tokenBalanceChanges[0].rawTokenAmount.decimals
    })

    const amountInLamports = BigInt(tokenAmount * Math.pow(10, decimals))

    return {
        userWalletAddress,
        tokenAddress,
        tokenAmount,
        lbpAddress,
        nftAddress,
        decimals,
        amountInLamports
    }
}

// CORS handling
export const onRequestOptions: PagesFunction<ENV> = async () => {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    })
} 