import { any, z } from "zod"
import { jsonResponse, reportError } from "./cfPagesFunctionsUtils"
import { Connection, Transaction, Keypair } from "@solana/web3.js"
import { getRpcUrlForCluster } from "../../shared/solana/rpcUtils"
import { ProjectService } from "../services/projectService"
import { signatureSubscribe } from "../../src/utils/solanaFunctions"
import * as bs58 from "bs58"
import { Buffer } from "buffer"

type ENV = {
    DB: D1Database,
    SOLANA_RPC_URL: string
    NFT_MINT_WALLET_PRIVATE_KEY: string
}
const requestSchema = z.object({
    serializedTx: z.string(),
    projectId: z.string()
})

export const onRequestPost: PagesFunction<ENV> = async (ctx) => {
    const db = ctx.env.DB
    const SOLANA_RPC_URL = ctx.env.SOLANA_RPC_URL
    const privateKey = ctx.env.NFT_MINT_WALLET_PRIVATE_KEY
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
            return jsonResponse({ message: 'Project not found!' }, 404)
        }

        const cluster = project.cluster
        const connection = new Connection(getRpcUrlForCluster(SOLANA_RPC_URL, cluster))

        // sign with our private key wallet
        const privateKeypair = Keypair.fromSecretKey(new Uint8Array(bs58.default.decode(privateKey)))
        const tx = Transaction.from(Buffer.from(data.serializedTx, 'base64'))
        tx.partialSign(privateKeypair)
        // TODO @claimValidations

        console.log("Sending transaction...")
        const txId = await connection.sendRawTransaction(tx.serialize())
        console.log("Finished sending the transaction...")

        console.log('Signature status subscribing...')
        const status = await signatureSubscribe(connection, txId)
        console.log(`Signature status finished: ${status}.`)

        const explorerLink = `https://explorer.solana.com/tx/${txId}?cluster=${cluster}`
        console.log(explorerLink)

        return jsonResponse({ txId }, 200)
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
