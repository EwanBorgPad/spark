import { jsonResponse, reportError } from "./cfPagesFunctionsUtils"
import { ComputeBudgetProgram, Connection, Keypair, ParsedAccountData, PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js"
import { createTransferInstruction } from "@solana/spl-token"
import { z } from "zod"
import { METADATA_PROGRAM_ADDRESS } from "../../shared/constants"
import { getRpcUrlForCluster } from "../../shared/solana/rpcUtils"
import { ProjectService } from "../services/projectService"
import * as bs58 from "bs58"
import { TokenStandard } from "@metaplex-foundation/mpl-token-metadata"
// TODO @strajo avoid using deprecated package
import { keypairIdentity, Metaplex } from "@metaplex-foundation/js"
import { signatureSubscribe } from "../../src/utils/solanaFunctions"

type ENV = {
    DB: D1Database,
    SOLANA_RPC_URL: string,
    LBP_WALLET_ADDRESS: string
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
    const LBP_WALLET_ADDRESS = ctx.env.LBP_WALLET_ADDRESS
    const privateKey = ctx.env.NFT_MINT_WALLET_PRIVATE_KEY
    try {
        // validate env
        if (!LBP_WALLET_ADDRESS || !SOLANA_RPC_URL || !privateKey) {
            throw new Error('Misconfigured env!')
        }
        // request validation
        const { data, error } = requestSchema.safeParse(await ctx.request.json())
        if (error) return jsonResponse({ error: 'Invalid request' }, 400)
        if (!data?.userWalletAddress) return jsonResponse({ error: 'User wallet address is missing in request body' }, 404)
        if (!data?.tokenAmount) return jsonResponse({ error: 'Token amount is missing in request body' }, 404)
        if (!data?.projectId) return jsonResponse({ error: 'Project ID is missing in request body' }, 404)

        // data initialization
        const userWalletAddress = data.userWalletAddress
        const receivingAddress = LBP_WALLET_ADDRESS
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
            commitment: 'confirmed',    // status has to be confirmed because we mint the nft and get the address of it immediately after sending the mint tx
            disableRetryOnRateLimit: true
        })
        const tokenMint = project.info.raisedTokenMintAddress

        // TODO: ALL VALIDATIONS

        // create transfer and mint nft instruction
        const tx = await createTokenTransferTransaction(userWalletAddress, receivingAddress, tokenMint, tokenAmount, connection, privateKey)

        return jsonResponse({ transaction: tx }, 200)
    } catch (e) {
        await reportError(ctx.env.DB, e)
        return jsonResponse({ message: "Something went wrong..." }, 500)
    }
}

export async function createTokenTransferTransaction(
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

        // connection to metaplex
        const metaplex = new Metaplex(connection, {
            cluster: 'custom'
        })

        // wallet that will be minting the nft (our private wallet)
        const nftMintingWalletKeypair = Keypair.fromSecretKey(new Uint8Array(bs58.default.decode(privateKey)))

        metaplex.use(keypairIdentity(nftMintingWalletKeypair))

        // add priority fee - TODO: check micro lamport value
        const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
            microLamports: 20000,
        })

        // generate new address for nft mint
        const nftMintKeypair = Keypair.generate()

        // tx builder for minting nft - TODO: fill with valid uri, check other values if need to be changed
        const bd = await metaplex.nfts().builders().create({
            uri: "https://pub-afd56fb014c94eac935a52c2d0d6a5e8.r2.dev/nftmeta/nft-metadata.json", // Replace with the actual URI of NFT metadata
            name: "LBP Deposit Receipt NFT",
            sellerFeeBasisPoints: 0, // 0% royalties
            symbol: "LDRNFT",
            creators: [{ address: fromPublicKey, share: 100 }], // Optional: specify creators
            mintAuthority: nftMintingWalletKeypair, // Your wallet is the mint authority
            updateAuthority: nftMintingWalletKeypair, // Usually the same as mintAuthority
            useNewMint: nftMintKeypair
        })

        // fill neccessary information for mint nft tx and sign it
        const nftTx = bd.toTransaction((await connection.getLatestBlockhash()))
        nftTx.add(addPriorityFee)
        nftTx.feePayer = nftMintingWalletKeypair.publicKey
        nftTx.sign(nftMintKeypair, nftMintingWalletKeypair)
        // send mint nft transaction
        const nftSig = await connection.sendRawTransaction(nftTx.serialize())

        console.log('Signature status subscribing...')
        const status = await signatureSubscribe(connection, nftSig)
        console.log(`Signature status finished: ${status}.`)

        // get minted nft by address
        const nft = await metaplex.nfts().findByMint({
            mintAddress: nftMintKeypair.publicKey
        })
        // create builder for transfering nft
        const builder = metaplex.nfts().builders().transfer({
            nftOrSft: {
                tokenStandard: TokenStandard.NonFungible,
                address: nft.address
            },
            toOwner: fromPublicKey,
            fromOwner: nftMintingWalletKeypair.publicKey
        })
        // get instructions from the builder for transfering nft
        const listOfInstructions = builder.getInstructions()

        // create the transaction and all the neccessary instructions to it
        const transaction = new Transaction().add(transferInstruction).add(addPriorityFee)
        listOfInstructions.forEach(ix => transaction.add(ix))

        // fetch latest blockhash
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
        transaction.recentBlockhash = blockhash
        transaction.lastValidBlockHeight = lastValidBlockHeight
        transaction.feePayer = fromPublicKey // User signs to pay fees
        // sign with our minting wallet
        transaction.partialSign(nftMintingWalletKeypair)
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
