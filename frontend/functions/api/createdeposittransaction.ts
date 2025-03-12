import { z } from 'zod'
import * as bs58 from 'bs58'
import { drizzle } from 'drizzle-orm/d1'
import { eq } from 'drizzle-orm'

import { ComputeBudgetProgram, Connection, Keypair, ParsedAccountData, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js'
import { createTransferInstruction } from '@solana/spl-token'
import { createProgrammableNft, mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { createNoopSigner, createSignerFromKeypair, percentAmount, publicKey, signerIdentity, transactionBuilder } from '@metaplex-foundation/umi'
import { toWeb3JsInstruction, toWeb3JsKeypair } from '@metaplex-foundation/umi-web3js-adapters'

import { jsonResponse, reportError } from './cfPagesFunctionsUtils'

import { projectTable } from '../../shared/drizzle-schema'
import { getRpcUrlForCluster } from '../../shared/solana/rpcUtils'
import { PRIORITY_FEE_MICRO_LAMPORTS } from '../../shared/constants'

import { DepositService } from '../services/depositService'
import { SaleResultsService } from '../services/saleResultsService'
import { SnapshotService } from '../services/snapshotService'
import { NftConfigType, SolanaAddressSchema } from '../../shared/models'


type ENV = {
    DB: D1Database
    SOLANA_RPC_URL: string
    NFT_MINT_WALLET_PRIVATE_KEY: string
}
const requestSchema = z.object({
    userWalletAddress: SolanaAddressSchema,
    tokenAmount: z.number().positive(),
    projectId: z.string().min(1),
})
/**
 * Creates the deposit transaction for a user, one of the main project functionalities.
 * Validates that all the conditions are met:
 *  - projectSaleOpen - Project sale is open.
 *  - raiseTargetNotReached - Sale target has not been reached.
 *  - userIsEligible - User is eligible.
 *  - userCaps - User is not over their max, nor below their min investment amount.
 *  - eligibilityTierStartTime - User's eligibilityTier has started.
 * Improvements:
 *  - For better UX, also check if user has enough raisedToken and SOL for this transaction.
 * @param ctx 
 * @returns 
 */
export const onRequestPost: PagesFunction<ENV> = async (ctx) => {
    const db = drizzle(ctx.env.DB, { logger: true })
    try {
        const SOLANA_RPC_URL = ctx.env.SOLANA_RPC_URL
        const nftMintAuthorityPrivateKey = ctx.env.NFT_MINT_WALLET_PRIVATE_KEY
        if (!SOLANA_RPC_URL || !nftMintAuthorityPrivateKey) throw new Error('Misconfigured env!')

        /////////////////////////////////////////
        //// REQUEST PARSING AND VALIDATION /////
        /////////////////////////////////////////

        const { data, error } = requestSchema.safeParse(await ctx.request.json())
        if (error || !data) return jsonResponse({ message: 'Bad request!', error }, 400)

        const { projectId, tokenAmount, userWalletAddress } = data

        const project = await db
            .select()
            .from(projectTable)
            .where(eq(projectTable.id, projectId))
            .get()
        if (!project) return jsonResponse({ message: 'Project not found!' }, 404)

        const lbpWalletAddress = project.json.config.lbpWalletAddress
        if (!lbpWalletAddress) return jsonResponse({ message: "LBPWA not configured!" }, 500)

        const rpcUrl = getRpcUrlForCluster(SOLANA_RPC_URL, project.json.config.cluster)

        console.log('Request parsed successfully!')

        /////////////////////////////////////////
        ////// PROJECT TIMELINE VALIDATION //////
        /////////////////////////////////////////

        const now = new Date()

        const saleOpensDate = project.json.info.timeline.find(timeline => timeline.id === 'SALE_OPENS')?.date
            ? new Date(project.json.info.timeline.find(timeline => timeline.id === 'SALE_OPENS')?.date)
            : null

        const saleClosesDate = project.json.info.timeline.find(timeline => timeline.id === 'SALE_CLOSES')?.date
            ? new Date(project.json.info.timeline.find(timeline => timeline.id === 'SALE_CLOSES')?.date)
            : null

        if (!saleOpensDate) throw new Error(`SALE_OPENS not found for (${projectId})!`)
        if (!saleClosesDate) throw new Error(`SALE_CLOSES not found for (${projectId})!`)

        // @VALIDATION: projectSaleOpen
        if (now < saleOpensDate) return jsonResponse({ errorCode: 'SALE_NOT_OPEN_FOR_PROJECT' }, 409)
        if (now > saleClosesDate) return jsonResponse({ errorCode: 'SALE_CLOSED_FOR_PROJECT' }, 409)

        console.log('projectSaleOpen confirmed.')

        /////////////////////////////////////////
        //////// SALE RESULTS VALIDATION ////////
        /////////////////////////////////////////

        const saleResults = await SaleResultsService.getSaleResults({ db, projectId })

        // @VALIDATION: raiseTargetReached
        if (saleResults.raiseTargetReached) return jsonResponse({ errorCode: 'PROJECT_RAISE_TARGET_REACHED' }, 409)

        console.log('raiseTargetNotReached confirmed.')

        /////////////////////////////////////////
        /////// DEPOSIT STATUS VALIDATION ///////
        /////////////////////////////////////////

        const { isEligible, eligibilityStatus, depositStatus } = await DepositService.getDepositStatus({
            db,
            projectId,
            rpcUrl,
            walletAddress: userWalletAddress,
        })

        // @VALIDATION: userIsEligible
        if (!isEligible) return jsonResponse({ errorCode: 'USER_NOT_ELIGIBLE' }, 409)

        console.log('userIsEligible confirmed.')

        const {
            maxAmountAllowed,
            minAmountAllowed,
            amountDeposited,
            startTime: startTimeByEligibilityTier,
        } = depositStatus

        // @VALIDATION: userCaps
        const userDepositAmount = tokenAmount * Math.pow(10, amountDeposited.decimals)

        console.log(`userDepositAmount: (${userDepositAmount}); minAmountAllowed: (${minAmountAllowed.amount}); maxAmountAllowed: (${maxAmountAllowed.amount})`)

        if (userDepositAmount > Number(maxAmountAllowed.amount)) return jsonResponse({ errorCode: 'USER_MAX_INVESTMENT_EXCEEDED' }, 409)
        if (userDepositAmount < Number(minAmountAllowed.amount)) return jsonResponse({ errorCode: 'USER_MIN_INVESTMENT_INSUFFICIENT' }, 409)

        console.log('userCaps confirmed.')

        // @VALIDATION: eligibilityTierStartTime
        if (now < startTimeByEligibilityTier) return jsonResponse({ errorCode: 'SALE_NOT_OPEN_FOR_ELIGIBILITY_TIER' }, 409)

        console.log('eligibilityTierStartTime confirmed.')

        /////////////////////////////////////////
        ////////////// HAPPY FLOW ///////////////
        /////////////////////////////////////////

        const connection = new Connection(rpcUrl, {
            confirmTransactionInitialTimeout: 10000,
            commitment: 'confirmed',
            disableRetryOnRateLimit: true,
        })

        const tokenMint = project.json.config.raisedTokenData.mintAddress
        const nftConfig = project.json.config.nftConfig

        console.log('Creating transaction...')

        const tx = await createUserDepositTransaction(userWalletAddress, lbpWalletAddress, tokenMint, tokenAmount, connection, nftMintAuthorityPrivateKey, nftConfig)

        console.log('Creating snapshot...')

        await SnapshotService.createSnapshot({
            db, address: userWalletAddress, projectId, eligibilityStatus,
        })

        console.log('Returning response...')

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
    privateKey: string,
    nftConfig: NftConfigType
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

        if (!toTokenAccount?.value?.[0]?.pubkey) {
            throw new Error("Error! Receiving token account pubkey missing! Check if token account is initialized for receiving wallet!")
        }

        // create transfer instruction
        const transferInstruction: TransactionInstruction = createTransferInstruction(
            fromTokenAccount.value[0].pubkey,
            toTokenAccount.value[0].pubkey,
            fromPublicKey, // Owner of the source account
            amount * multiplier
        )

        // add priority fee
        const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
            microLamports: PRIORITY_FEE_MICRO_LAMPORTS,
        })

        // get instructions from the builder for transfering nft
        const { instructions: listOfInstructions, nftMintSigner } = await mintNftAndCreateTransferNftInstructions(connection, privateKey, fromPublicKey.toBase58(), nftConfig)

        // create the transaction and all the neccessary instructions to it
        const transaction = new Transaction().add(transferInstruction).add(addPriorityFee)
        listOfInstructions.forEach(ix => transaction.add(ix))

        // fetch latest blockhash
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
        transaction.recentBlockhash = blockhash
        transaction.lastValidBlockHeight = lastValidBlockHeight
        transaction.feePayer = fromPublicKey // User signs to pay fees
        // sign with our nftMint keypair
        transaction.partialSign(nftMintSigner)
        // serialize transaction for frontend
        const serializedTransaction = transaction.serialize({
            requireAllSignatures: false,
        })

        return serializedTransaction.toString('base64') // Send serialized tx back
    } catch (error) {
        const errorMessage = `Failed to create transaction! error={${error.message}`
        console.error(errorMessage)
        throw new Error(errorMessage)
    }
}


async function mintNftAndCreateTransferNftInstructions(connection: Connection, privateKey: string, usersWalletAddress: string, nftConfig: NftConfigType) {
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
        symbol: nftConfig.symbol,
        name: nftConfig.name,
        uri: nftConfig.uri,
        
        mint: mintSigner,
        updateAuthority: signer,
        sellerFeeBasisPoints: percentAmount(0),
        payer: userSigner,
        authority: signer,
        tokenOwner: userPublicKey,
        
        collection: {
            verified: false,
            // @ts-expect-error TS2322: Type 'string' is not assignable to type 'PublicKey'.
            key: 'H4TkbayRd1fhF7wu9odrrYZREkHNMrV5Rhmtkor9wVoK', // https://solscan.io/token/H4TkbayRd1fhF7wu9odrrYZREkHNMrV5Rhmtkor9wVoK
        }
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

