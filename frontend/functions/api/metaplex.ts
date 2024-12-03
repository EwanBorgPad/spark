import { jsonResponse, reportError } from "./cfPagesFunctionsUtils"
import { drizzle } from "drizzle-orm/d1"
import { keypairIdentity, Metaplex } from "@metaplex-foundation/js"
import { Connection, Keypair, PublicKey, sendAndConfirmTransaction } from "@solana/web3.js"
import * as bs58 from "bs58"
import { createNft, createV1, mplTokenMetadata, TokenStandard } from '@metaplex-foundation/mpl-token-metadata'
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { createSignerFromKeypair, generateSigner, percentAmount, signerIdentity, transactionBuilder, UmiPlugin } from "@metaplex-foundation/umi"

type ENV = {
    DB: D1Database
    SOLANA_RPC_URL: string
}
export const onRequestGet: PagesFunction<ENV> = async (ctx) => {
    const db = drizzle(ctx.env.DB, { logger: true })
    const rpcUrl = ctx.env.SOLANA_RPC_URL
    try {
        const connection = new Connection(rpcUrl)
        const umi = createUmi(connection)
        // insert your wallet secret key here
        const privateKeypair = Keypair.fromSecretKey(new Uint8Array(bs58.default.decode('')))
        // convert to Umi compatible keypair
        const umiKeypair = umi.eddsa.createKeypairFromSecretKey(privateKeypair.secretKey)
        const signer = createSignerFromKeypair(umi, umiKeypair)
        // create mint address for nft
        const mint = Keypair.generate()
        const mintKeypair = umi.eddsa.createKeypairFromSecretKey(mint.secretKey)
        const mintSigner = createSignerFromKeypair(umi, mintKeypair)
        umi.use(signerIdentity(signer))
        umi.use(mplTokenMetadata())

        const builder = transactionBuilder().add(createNft(umi, {
            symbol: 'BTNFT',
            mint: mintSigner,
            name: "Borg Test NFT",
            uri: "https://example.com/json",
            updateAuthority: umi.identity.publicKey,
            sellerFeeBasisPoints: percentAmount(0),
        }))
        const response = await builder.send(umi)

        const signature = bs58.default.encode(response)
        console.log(signature)


        return jsonResponse({ transactionId: signature }, 200)
    } catch (e) {
        await reportError(ctx.env.DB, e)
        return jsonResponse({ message: "Something went wrong..." }, 500)
    }
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
