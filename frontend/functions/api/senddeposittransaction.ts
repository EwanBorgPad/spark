import { z } from "zod"
import { jsonResponse, reportError } from "./cfPagesFunctionsUtils"
import { drizzle } from "drizzle-orm/d1"
import { Connection, Keypair, Transaction } from "@solana/web3.js"
import { getRpcUrlForCluster } from "../../shared/solana/rpcUtils"
import { signatureSubscribe } from "../services/signatureSubscribeService"
import { DepositService } from "../services/depositService"
import { EligibilityService } from "../services/eligibilityService"
import { calculateTokens } from "../../shared/utils/calculateTokens"
import { exchangeService } from "../services/exchangeService"
import { Buffer } from "buffer"
import * as bs58 from "bs58"
import { SaleResultsService } from "../services/saleResultsService"
import { projectTable } from "../../shared/drizzle-schema"
import { eq } from "drizzle-orm"

type ENV = {
    DB: D1Database,
    SOLANA_RPC_URL: string,
    NFT_MINT_WALLET_PRIVATE_KEY: string
}
const requestSchema = z.object({
    serializedTx: z.string(),
    projectId: z.string()
})

export const onRequestPost: PagesFunction<ENV> = async (ctx) => {
    const db = drizzle(ctx.env.DB, { logger: true })

    try {
        const SOLANA_RPC_URL = ctx.env.SOLANA_RPC_URL
        const privateKey = ctx.env.NFT_MINT_WALLET_PRIVATE_KEY

        // validate env
        if (!SOLANA_RPC_URL) {
            throw new Error('Misconfigured env!')
        }

        // return jsonResponse({ message: 'Sale is not open!' }, 409)

        // validate request
        const { data, error } = requestSchema.safeParse(await ctx.request.json())

        const projectId = data?.projectId
        if (!data?.serializedTx) return jsonResponse({ error: 'Request error. Missing serializedTx' }, 404)
        if (!projectId) return jsonResponse({ error: 'Request error. ProjectId serializedTx' }, 404)
        if (error) return jsonResponse({ error: 'Request error!' }, 404)

        // get project, cluster and connection
        const project = await db
            .select()
            .from(projectTable)
            .where(eq(projectTable.id, projectId))
            .get()
        if (!project) return jsonResponse({ message: 'Project not found!' }, 404)

        // validate raise target
        const saleResults = await SaleResultsService.getSaleResults({ db, projectId: data.projectId })
        if (saleResults.raiseTargetReached) {
            return jsonResponse({ message: 'Raise target has been reached!' }, 409)
        }

        const cluster = project.json.config.cluster as ('mainnet' | 'devnet')
        const connection = new Connection(getRpcUrlForCluster(SOLANA_RPC_URL, cluster))

        // sign with our private key wallet
        const privateKeypair = Keypair.fromSecretKey(new Uint8Array(bs58.default.decode(privateKey)))
        const tx = Transaction.from(Buffer.from(data.serializedTx, 'base64'))
        tx.partialSign(privateKeypair)

        // TODO @depositValidations

        console.log("Sending transaction...")
        const txId = await connection.sendRawTransaction(tx.serialize(), {
            skipPreflight: true     // this needs to be enabled because of latestHashBlock expiring
        })
        console.log("Finished sending the transaction...")

        console.log('Signature status subscribing...')
        const transactionStatus = await signatureSubscribe(connection, txId)
        console.log(`Signature status finished: ${transactionStatus}.`)

        // handle timeout from signature status fetch
        if (transactionStatus.status === 'error') {
            const message = `Transaction error! code=(${transactionStatus.errorCode}), txId=(${transactionStatus.txId})`
            throw new Error(message)
        }

        // handle errors from chain
        // if ('err' in transactionStatus) {
        //     const message = JSON.stringify(transactionStatus.err)
        //     throw new Error(`Transaction error! err=(${message}), txId=(${transactionStatus.txId})`)
        // }

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

        const raisedTokenCoinGeckoName = project.json.config.raisedTokenData.coinGeckoName
        if (!raisedTokenCoinGeckoName) throw new Error(`raisedTokenCoinGeckoName missing for project (${projectId})!`)

        const exchangeData = await exchangeService.getExchangeData({
            db,
            baseCurrency: raisedTokenCoinGeckoName,
            targetCurrency: 'usd',
        })

        const tokensCalculation = calculateTokens({
            projectData: project.json,
            borgCoinInput: tokenAmount,
            borgPriceInUSD: exchangeData.currentPrice,
        })

        const eligibilityStatus = await EligibilityService.getEligibilityStatus({
            db,
            address: userWalletAddress,
            projectId: data.projectId,
            rpcUrl: getRpcUrlForCluster(SOLANA_RPC_URL, cluster),
        })
        const eligibilityTier = eligibilityStatus.eligibilityTier
        const tierId = eligibilityTier ? eligibilityTier.id : 'unknown'

        //// TODO @eligibilitySnapshot - users might fall out of eligibility tier after they invest (they have less borg now)
        // if (!eligibilityTier) {
        //     return jsonResponse({ message: 'Not eligible!' }, 403)
        // }

        // update db
        if (
            transactionStatus.confirmationStatus &&
            ['confirmed', 'finalized'].includes(transactionStatus.confirmationStatus)
        ) {
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
                    transactionStatus,
                },
            })
        }

        return jsonResponse({ message: "Ok!" }, 200)
    } catch (e) {
        await reportError(db, e)
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
    const userWalletAddress = dataObject.feePayer
    const tokenTransfers = dataObject.tokenTransfers
    const splTokenTransfer = tokenTransfers.find(transfer => transfer.tokenStandard === 'Fungible')
    const nftTransfer = tokenTransfers.find(transfer => transfer.tokenStandard === 'NonFungible')
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
