import { jsonResponse, reportError } from "./cfPagesFunctionsUtils"
import { ComputeBudgetProgram, Connection, Keypair, ParsedAccountData, PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js"
import { createTransferInstruction } from "@solana/spl-token"
import { z } from "zod"
import { getRpcUrlForCluster } from "../../shared/solana/rpcUtils"
import { ProjectService } from "../services/projectService"
import * as bs58 from "bs58"

type ENV = {
    DB: D1Database,
    SOLANA_RPC_URL: string,
    CLAIM_WALLET_PRIVATE_KEY: string
}
const requestSchema = z.object({
    userWalletAddress: z.string(),
    tokenAmount: z.number(),
    projectId: z.string()
})

export const onRequestPost: PagesFunction<ENV> = async (ctx) => {
    const db = ctx.env.DB
    const SOLANA_RPC_URL = ctx.env.SOLANA_RPC_URL
    const privateKey = ctx.env.CLAIM_WALLET_PRIVATE_KEY
    try {
        // validate env
        if (!SOLANA_RPC_URL || !privateKey) {
            throw new Error('Misconfigured env!')
        }
        // request validation
        const { data, error } = requestSchema.safeParse(await ctx.request.json())
        if (error) return jsonResponse({ error: 'Invalid request' }, 400)
        if (!data?.userWalletAddress) return jsonResponse({ error: 'User wallet address is missing in request body' }, 404)
        if (!data?.tokenAmount) return jsonResponse({ error: 'Token amount is missing in request body' }, 404)
        if (!data?.projectId) return jsonResponse({ error: 'Project ID is missing in request body' }, 404)

        // data initialization
        const privateWalletKeypair = Keypair.fromSecretKey(new Uint8Array(bs58.default.decode(privateKey)))
        const sendingAddress = privateWalletKeypair.publicKey.toBase58()
        const userWalletAddress = data.userWalletAddress
        const tokenAmount = data.tokenAmount
        const projectId = data.projectId

        const project = await ProjectService.findProjectById({ db, id: projectId })
        if (!project) {
            return jsonResponse({ message: "Project not found!" }, 404)
        }

        // getting connection to the RPC
        const cluster = project?.cluster ?? 'devnet'
        const rpcUrl = getRpcUrlForCluster(SOLANA_RPC_URL, cluster)
        const connection = new Connection(rpcUrl, {
            confirmTransactionInitialTimeout: 10000,
            commitment: 'confirmed',
            disableRetryOnRateLimit: true
        })
        const tokenMint = project.info.launchedTokenMintAddress

        // TODO: ALL VALIDATIONS

        // create transfer and mint nft instruction
        const tx = await createClaimTransaction(sendingAddress, userWalletAddress, tokenMint, tokenAmount, connection, privateWalletKeypair)

        return jsonResponse({ transaction: tx }, 200)
    } catch (e) {
        await reportError(ctx.env.DB, e)
        return jsonResponse({ message: "Something went wrong..." }, 500)
    }
}

export async function createClaimTransaction(
    fromWallet: string,
    toWallet: string,
    tokenMint: string,
    amount: number,
    connection: Connection,
    privateWalletKeypair: Keypair
): Promise<string> {
    try {
        const fromPublicKey = new PublicKey(fromWallet)
        const toPublicKey = new PublicKey(toWallet)
        const tokenMintPublicKey = new PublicKey(tokenMint)

        // get token associated accounts
        const fromTokenAccount = await connection.getTokenAccountsByOwner(
            fromPublicKey,
            { mint: tokenMintPublicKey }
        )
        const toTokenAccount = await connection.getTokenAccountsByOwner(
            toPublicKey,
            { mint: tokenMintPublicKey }
        )

        // logic for decimals
        const decimals = await getNumberDecimals(tokenMint, connection)
        const multiplier = Math.pow(10, decimals)

        // create transfer instruction
        const transferInstruction: TransactionInstruction = createTransferInstruction(
            fromTokenAccount.value[0].pubkey,
            toTokenAccount.value[0].pubkey,
            fromPublicKey, // Owner of the source account
            amount * multiplier
        )

        // add priority fee - TODO: check micro lamport value
        const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
            microLamports: 20000,
        })

        // create the transaction and all the neccessary instructions to it
        const transaction = new Transaction().add(transferInstruction).add(addPriorityFee)

        // fetch latest blockhash
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
        transaction.recentBlockhash = blockhash
        transaction.lastValidBlockHeight = lastValidBlockHeight
        transaction.feePayer = toPublicKey // User signs to pay fees
        // private wallet needs to sign to transfer
        transaction.partialSign(privateWalletKeypair)
        // serialize transaction for frontend
        const serializedTransaction = transaction.serialize({
            requireAllSignatures: false,
        })

        return serializedTransaction.toString('base64') // Send serialized tx back
    } catch (error) {
        console.error('Error creating transfer transaction:', error)
        throw new Error('Failed to create transaction')
    }
}


async function getNumberDecimals(mintAddress: string, connection: Connection): Promise<number> {
    const info = await connection.getParsedAccountInfo(new PublicKey(mintAddress))
    const result = (info.value?.data as ParsedAccountData).parsed.info.decimals as number
    return result
}

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
