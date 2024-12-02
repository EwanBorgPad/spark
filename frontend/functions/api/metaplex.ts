import { jsonResponse, reportError } from "./cfPagesFunctionsUtils"
import { drizzle } from "drizzle-orm/d1"
import { keypairIdentity, Metaplex } from "@metaplex-foundation/js"
import { Connection, Keypair } from "@solana/web3.js"
import * as bs58 from "bs58"

type ENV = {
    DB: D1Database
}
export const onRequestGet: PagesFunction<ENV> = async (ctx) => {
    const db = drizzle(ctx.env.DB, { logger: true })
    try {
        // insert rpc url
        const connection = new Connection('')
        // insert your private key for minting nft
        const myKeypair = Keypair.fromSecretKey(new Uint8Array(bs58.default.decode('')))

        const metaplex = Metaplex.make(connection).use(keypairIdentity(myKeypair))

        const response = await metaplex.nfts().create({
            name: "BorgTestNFT",
            symbol: "BTNFT",
            sellerFeeBasisPoints: 0,
            uri: "https://example.com/json"
        })

        return jsonResponse({ nftAddress: response.nft.address.toBase58() }, 200)
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
