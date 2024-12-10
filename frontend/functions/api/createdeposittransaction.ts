import { jsonResponse, reportError } from "./cfPagesFunctionsUtils"
import { ComputeBudgetProgram, Connection, Keypair, ParsedAccountData, PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js"
import { createTransferInstruction } from "@solana/spl-token"
import { z } from "zod"
import { getRpcUrlForCluster } from "../../shared/solana/rpcUtils"
import { ProjectService } from "../services/projectService"
import * as bs58 from "bs58"
import { createProgrammableNft, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { createNoopSigner, createSignerFromKeypair, percentAmount, publicKey, signerIdentity, transactionBuilder } from "@metaplex-foundation/umi"
import { toWeb3JsInstruction, toWeb3JsKeypair } from '@metaplex-foundation/umi-web3js-adapters'
import { PRIORITY_FEE_MICRO_LAMPORTS } from "../../shared/constants"
import { EligibilityService } from "../services/eligibilityService"
import { drizzle } from "drizzle-orm/d1"
import { DepositService } from "../services/depositService"
import { getTokenData, Cluster } from "../services/constants"
import { exchangeService } from "../services/exchangeService"
import { addPlugin, addPluginV1, create, createPlugin, createPluginV2, pluginAuthority } from '@metaplex-foundation/mpl-core'

type ENV = {
    DB: D1Database,
    SOLANA_RPC_URL: string,
    NFT_MINT_WALLET_PRIVATE_KEY: string
}
const requestSchema = z.object({
    userWalletAddress: z.string(),
    tokenAmount: z.number(),
    projectId: z.string()
})
export const onRequestPost: PagesFunction<ENV> = async (ctx) => {
    const db = ctx.env.DB
    const SOLANA_RPC_URL = ctx.env.SOLANA_RPC_URL
    const privateKey = ctx.env.NFT_MINT_WALLET_PRIVATE_KEY
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
        const projectId = data.projectId

        const project = await ProjectService.findProjectById({ db, id: projectId })
        if (!project) {
            return jsonResponse({ message: "Project not found!" }, 404)
        }

        const lbpWalletAddress = project.info.lbpWalletAddress

        if (!lbpWalletAddress) {
            return jsonResponse({ message: "LBPWA not configured!" }, 500)
        }

        // data initialization
        const userWalletAddress = data.userWalletAddress
        const receivingAddress = lbpWalletAddress
        const tokenAmount = data.tokenAmount

        // getting connection to the RPC
        const cluster = project?.cluster ?? 'devnet'
        const rpcUrl = getRpcUrlForCluster(SOLANA_RPC_URL, cluster)
        const connection = new Connection(rpcUrl, {
            confirmTransactionInitialTimeout: 10000,
            commitment: 'confirmed',    // status has to be confirmed because we mint the nft and get the address of it immediately after sending the mint tx
            disableRetryOnRateLimit: true
        })
        // get price and token mint
        const tokenMint = project.info.raisedTokenMintAddress

        // create transfer and mint nft instruction
        const tx = await createUserDepositTransaction(userWalletAddress, receivingAddress, tokenMint, tokenAmount, connection, privateKey)

        return jsonResponse({ transaction: tx }, 200)
    } catch (e) {
        await reportError(ctx.env.DB, e)
        return jsonResponse({ message: "Something went wrong..." }, 500)
    }
}

export async function createUserDepositTransaction(
    fromWallet: string,
    toWallet: string,
    tokenMint: string,
    amount: number,
    connection: Connection,
    privateKey: string
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

        // wallet that will be minting the nft (our private wallet)
        const nftMintingWalletKeypair = Keypair.fromSecretKey(new Uint8Array(bs58.default.decode(privateKey)))

        // add priority fee
        const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
            microLamports: PRIORITY_FEE_MICRO_LAMPORTS,
        })

        // get instructions from the builder for transfering nft
        const { instructions: listOfInstructions, nftMintSigner } = await mintNftAndCreateTransferNftInstructions(connection, privateKey, fromPublicKey.toBase58())

        // create the transaction and all the neccessary instructions to it
        const transaction = new Transaction().add(transferInstruction).add(addPriorityFee)
        listOfInstructions.forEach(ix => transaction.add(ix))

        // fetch latest blockhash
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
        transaction.recentBlockhash = blockhash
        transaction.lastValidBlockHeight = lastValidBlockHeight
        transaction.feePayer = fromPublicKey // User signs to pay fees
        // sign with our minting wallet and nftMint keypair
        transaction.partialSign(nftMintingWalletKeypair, nftMintSigner)
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

async function mintNftAndCreateTransferNftInstructions(connection: Connection, privateKey: string, usersWalletAddress: string) {
    // create umi client for mpl token package
    const umi = createUmi(connection)
    const userPublicKey = publicKey(usersWalletAddress)
    const userSigner = createNoopSigner(userPublicKey)
    const privateKeypair = Keypair.fromSecretKey(new Uint8Array(bs58.default.decode(privateKey)))
    // convert to Umi compatible keypair
    const mintingWalletKeypair = umi.eddsa.createKeypairFromSecretKey(privateKeypair.secretKey)
    const signer = createSignerFromKeypair(umi, mintingWalletKeypair)
    // create mint address for nft
    const mint = Keypair.generate()
    // convert it to umi keypair
    const mintKeypair = umi.eddsa.createKeypairFromSecretKey(mint.secretKey)
    const mintSigner = createSignerFromKeypair(umi, mintKeypair)
    // umi uses our private wallet as signer for minting nft
    umi.use(signerIdentity(signer))
    umi.use(mplTokenMetadata())

    // make tx for minting nft
    const builder = transactionBuilder().add(createProgrammableNft(umi, {
        symbol: 'bpBORGY',
        mint: mintSigner,
        name: "BORGY Liquidity Provider",
        uri: "https://pub-afd56fb014c94eac935a52c2d0d6a5e8.r2.dev/nftmeta/nft-metadata.json",
        updateAuthority: signer,
        sellerFeeBasisPoints: percentAmount(0),
        payer: userSigner,
        authority: signer,
        tokenOwner: userPublicKey,
    }))

    // send minting nft tx
    const listOfInstructions = builder.getInstructions()
    // convert metaplex Instruction to Solana web 3 js Instruction https://developers.metaplex.com/umi/web3js-differences-and-adapters
    const instructions = listOfInstructions.map(ix => {
        return toWeb3JsInstruction(ix)
    })
    const nftMintSigner = toWeb3JsKeypair(mintKeypair)


    return {
        instructions,
        nftMintSigner
    }
}
