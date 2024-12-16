import { any, z } from "zod"
import { jsonResponse, reportError } from "./cfPagesFunctionsUtils"
import { drizzle } from "drizzle-orm/d1"
import { Connection, Transaction } from "@solana/web3.js"
import { getRpcUrlForCluster } from "../../shared/solana/rpcUtils"
import { ProjectService } from "../services/projectService"
import { signatureSubscribe } from "../../src/utils/solanaFunctions"
import { DepositService } from "../services/depositService"
import { EligibilityService } from "../services/eligibilityService"
import { calculateTokens } from "../../shared/utils/calculateTokens"
import { exchangeService } from "../services/exchangeService"
import { getTokenData } from "../services/constants"

type ENV = {
    DB: D1Database,
    SOLANA_RPC_URL: string
}
const requestSchema = z.object({
    serializedTx: z.string(),
    projectId: z.string()
})

export const onRequestPost: PagesFunction<ENV> = async (ctx) => {
    const db = ctx.env.DB
    const drizzleDb = drizzle(db)
    const SOLANA_RPC_URL = ctx.env.SOLANA_RPC_URL
    try {
        // validate env
        if (!SOLANA_RPC_URL) {
            throw new Error('Misconfigured env!')
        }

        // validate request
        const { data, error } = requestSchema.safeParse(await ctx.request.json())

        if (!data?.serializedTx) return jsonResponse({ error: 'Request error. Missing serializedTx' }, 404)
        if (!data?.projectId) return jsonResponse({ error: 'Request error. ProjectId serializedTx' }, 404)
        if (error) return jsonResponse({ error: 'Request error!' }, 404)

        // get project, cluster and connection
        const project = await ProjectService.findProjectById({
            db,
            id: data.projectId
        })

        if (!project) {
            return jsonResponse({ message: 'Project not found! '}, 404)
        }

        // TODO @hardcoded
        if (project.info.id === 'borgy') {
            return jsonResponse({ message: 'Target has been reached!' }, 409)
        }

        const cluster = (project?.cluster as ('mainnet' | 'devnet')) ?? 'devnet'
        const connection = new Connection(getRpcUrlForCluster(SOLANA_RPC_URL, cluster))

        // TODO @depositValidations

        console.log("Sending transaction...")
        const txId = await connection.sendRawTransaction(Buffer.from(data.serializedTx, 'base64'), {
             // TODO check this skipPreflight
            skipPreflight: true     // this needs to be enabled because of latestHashBlock expiring
        })
        console.log("Finished sending the transaction...")

        console.log('Signature status subscribing...')
        const status = await signatureSubscribe(connection, txId)
        console.log(`Signature status finished: ${status}.`)

        const explorerLink = `https://explorer.solana.com/tx/${txId}?cluster=${cluster}`
        console.log(explorerLink)

        const heliusApiKey = SOLANA_RPC_URL.split('api-key=')[1]    // extract helius api key

        // get all values neccessary for db update
        const {
            amountInLamports,
            decimals,
            lbpAddress,
            nftAddress,
            tokenAddress,
            tokenAmount,
            userWalletAddress
        } = await extractTransactionData(txId, heliusApiKey, cluster)

        const raisedTokenData = getTokenData({ cluster, tokenAddress: project.info.raisedTokenMintAddress })

        if (!raisedTokenData) {
            return jsonResponse({ message: 'Raised token data missing!' }, 500)
        }

        const exchangeData = await exchangeService.getExchangeData({
            db: drizzleDb,
            baseCurrency: raisedTokenData.coinGeckoName,
            targetCurrency: 'usd',
        })

        const tokensCalculation = calculateTokens({
            projectData: project,
            borgCoinInput: tokenAmount,
            borgPriceInUSD: exchangeData.currentPrice,
        })

        const eligibilityStatus = await EligibilityService.getEligibilityStatus({
            db: drizzleDb,
            address: userWalletAddress,
            projectId: data.projectId,
            rpcUrl: getRpcUrlForCluster(SOLANA_RPC_URL, cluster),
        })

        const eligibilityTier = eligibilityStatus.eligibilityTier

        if (!eligibilityTier) {
            return jsonResponse({ message: 'Not eligible!' }, 403)
        }

        const tierId = eligibilityTier.id

        // TODO @eligibilityChecks

        // update db
        if (status === 'confirmed') {
            await DepositService.createUserDeposit({
                db,
                amount: amountInLamports.toString(),
                projectId: data.projectId,
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
                },
            })
        }

        return jsonResponse({ message: "Ok!" }, 200)
    } catch (e) {
        await reportError(ctx.env.DB, e)
        return jsonResponse({ message: "Something went wrong..." }, 500)
    }
}

// Used for CORS debugging problem
export const onRequestOptions: PagesFunction<ENV> = async (ctx) => {
    try {
        return new Response(null, {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': 'http://localhost:5173', // Adjust this to frontends origin
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
        })
    } catch (error) {
        return jsonResponse({ message: error }, 500)
    }
}

async function extractTransactionData(txId: string, heliusApiKey: string, cluster: string) {
    // api to parse with helius transactions with NFT and SPL token transfers which is ideal for our case https://docs.helius.dev/solana-apis/enhanced-transactions-api/parse-transaction-s#parse-transaction-s
    const url = cluster === 'devnet' ? `https://api-devnet.helius.xyz/v0/transactions?api-key=${heliusApiKey}&commitment=confirmed` : `https://api.helius.xyz/v0/transactions?api-key=${heliusApiKey}&commitment=confirmed`   // adjust the url from cluster
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
    console.log(dataObject)
    const userWalletAddress = dataObject.feePayer
    const tokenTransfers = dataObject.tokenTransfers
    // @ts-expect-error typing
    const splTokenTransfer = tokenTransfers.find(transfer => transfer.tokenStandard === 'Fungible')
    // @ts-expect-error typing
    const nftTransfer = tokenTransfers.find(transfer => transfer.tokenStandard === 'NonFungible')
    // the following parsing logic can be found in helius api link above
    const tokenAddress = splTokenTransfer.mint
    const nftAddress = nftTransfer.mint
    const tokenAmount = splTokenTransfer.tokenAmount
    const lbpAddress = nftTransfer.fromUserAccount

    let decimals = 0
    // @ts-expect-error typing
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
