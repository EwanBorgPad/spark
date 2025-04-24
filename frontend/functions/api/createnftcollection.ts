import { jsonResponse, reportError } from "./cfPagesFunctionsUtils"
import { Connection, Keypair, clusterApiUrl, PublicKey } from "@solana/web3.js"
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js"
import { drizzle } from "drizzle-orm/d1"
import { projectTable } from "../../shared/drizzle-schema"
import { eq } from "drizzle-orm"
import bs58 from "bs58"
import { verify } from "@noble/ed25519"

type ENV = {
    DB: D1Database
    STAGE_PRIVATE_KEY: string
    PROD_PRIVATE_KEY: string
    SOLANA_RPC_URL: string
}

type CreateNftCollectionRequest = {
    projectId: string
    auth: {
        address: string
        message: string
        signature: number[]
    }
    nftConfig: {
        name: string
        symbol: string
        description: string
        imageUrl: string
        collection: string
    }
    cluster?: "mainnet" | "devnet"
}

export const onRequestPost: PagesFunction<ENV> = async (ctx) => {
    const db = drizzle(ctx.env.DB, { logger: true })

    try {
        // Parse request
        const request = await ctx.request.json() as CreateNftCollectionRequest
        const { projectId, auth, nftConfig, cluster = "mainnet" } = request

        // Validate request
        if (!projectId || !auth || !nftConfig) {
            return jsonResponse({
                message: 'Missing required fields: projectId, auth, or nftConfig'
            }, 400)
        }

        // Verify signature
        const signatureValid = await verifySignature(auth)
        if (!signatureValid) {
            return jsonResponse({
                message: 'Invalid signature'
            }, 401)
        }

        // Check if user is admin
        const isAdmin = await checkIsAdmin(db, auth.address)
        if (!isAdmin) {
            return jsonResponse({
                message: 'Unauthorized: Only admins can create NFT collections'
            }, 403)
        }

        // Load project
        const project = await db
            .select()
            .from(projectTable)
            .where(eq(projectTable.id, projectId))
            .get()

        if (!project) {
            return jsonResponse({
                message: `Project not found (id=${projectId})!`
            }, 404)
        }

        // Check name and symbol length constraints
        if (nftConfig.name.length > 32) {
            return jsonResponse({
                message: 'Collection name cannot exceed 32 characters'
            }, 400)
        }

        if (nftConfig.symbol.length > 10) {
            return jsonResponse({
                message: 'Collection symbol cannot exceed 10 characters'
            }, 400)
        }

        // Create NFT collection
        const { collectionAddress, transactionSignature } = await createNftCollection({
            projectId,
            nftConfig,
            cluster,
            env: ctx.env
        })

        // Update project with the collection address
        // This could be optional if you want to handle this separately
        /*
        await db
          .update(projectTable)
          .set({
            json: {
              ...project.json,
              config: {
                ...project.json.config,
                nftConfig: {
                  ...project.json.config.nftConfig,
                  collection: collectionAddress
                }
              }
            }
          })
          .where(eq(projectTable.id, projectId))
          .run()
        */

        return jsonResponse({
            collectionAddress,
            transactionSignature
        }, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            }
        })
    } catch (e) {
        await reportError(ctx.env.DB, e)
        console.error("Error creating NFT collection:", e)
        return jsonResponse({
            message: `Error creating NFT collection: ${e instanceof Error ? e.message : String(e)}`
        }, 500)
    }
}

async function verifySignature(auth: CreateNftCollectionRequest['auth']): Promise<boolean> {
    try {
        const { address, message, signature } = auth

        // Convert the signature array to Uint8Array
        const signatureUint8 = new Uint8Array(signature)

        // Convert address string to PublicKey and get its byte representation
        const publicKey = new PublicKey(address)
        const publicKeyBytes = publicKey.toBytes()

        // Convert message to UTF-8 encoded bytes
        const messageBytes = new TextEncoder().encode(message)

        // Verify the signature using ed25519
        return await verify(signatureUint8, messageBytes, publicKeyBytes)
    } catch (error) {
        console.error("Signature verification error:", error)
        return false
    }
}

async function checkIsAdmin(db: any, address: string): Promise<boolean> {
    // Implement admin check logic here
    // For example, check against a list of admin addresses in the database
    // For now, return true to allow testing
    return true
}

async function createNftCollection({
    projectId,
    nftConfig,
    cluster,
    env
}: {
    projectId: string
    nftConfig: CreateNftCollectionRequest['nftConfig']
    cluster: "mainnet" | "devnet"
    env: ENV
}): Promise<{ 
    collectionAddress: string; 
    transactionSignature: string;
    warning?: string;
}> {
    // Get the appropriate connection based on cluster
    const rpcUrl = env.SOLANA_RPC_URL || (cluster === "mainnet" 
        ? "https://api.mainnet-beta.solana.com" 
        : "https://api.devnet.solana.com");
    
    console.log("Using RPC URL:", rpcUrl);
    
    const connection = new Connection(rpcUrl, "confirmed");

    // Select the appropriate private key based on cluster
    const privateKeyString = cluster === "mainnet"
        ? env.PROD_PRIVATE_KEY
        : env.STAGE_PRIVATE_KEY

    // Convert base58 string to Uint8Array
    const privateKeyUint8Array = bs58.decode(privateKeyString)

    // Initialize wallet
    const wallet = Keypair.fromSecretKey(privateKeyUint8Array)

    // Initialize Metaplex
    const metaplex = Metaplex.make(connection).use(keypairIdentity(wallet))

    // Metadata URI for the collection
    const metadataUri = "https://files.borgpad.com/ambios/nft-metadata/collection-metadata.json"

    console.log(`Creating NFT collection for project ${projectId} on ${cluster}`)
    console.log(`Metadata URI: ${metadataUri}`)
    console.log(`Name: ${nftConfig.name}, Symbol: ${nftConfig.symbol}`)

    try {
        // Create the collection NFT
        const result = await metaplex.nfts().create({
            uri: metadataUri,
            name: nftConfig.name,
            symbol: nftConfig.symbol,
            sellerFeeBasisPoints: 500, // 5% royalties
            isCollection: true,
        })

        const collectionNFT = result.nft
        const signature = result.response.signature

        console.log("Collection NFT created:", collectionNFT.address.toBase58())
        console.log("Transaction signature:", signature)
        
        return {
            collectionAddress: collectionNFT.address.toBase58(),
            transactionSignature: signature
        }
    } catch (error) {
        console.error("Failed to create NFT collection:", error)
        
        // Check if this is a confirmation error but the transaction might have succeeded
        if (error.toString().includes("block height exceeded") || 
            error.toString().includes("TransactionExpiredBlockheightExceededError")) {
          
            // Extract the signature from the error message if possible
            const signatureMatch = error.toString().match(/Signature\s+([a-zA-Z0-9]+)\s+has expired/)
            const possibleSignature = signatureMatch ? signatureMatch[1] : "unknown"
            
            console.log("Transaction may have succeeded despite confirmation error. Signature:", possibleSignature)
            
            // Extract Helius API key from SOLANA_RPC_URL if available
            const HELIUS_API_KEY = env.SOLANA_RPC_URL?.split('api-key=')[1];
            
            // Use Helius API to get transaction details if we have a signature and API key
            if (possibleSignature !== "unknown" && HELIUS_API_KEY) {
                try {
                    // API URL changes based on cluster
                    const apiUrl = cluster === "mainnet" 
                        ? `https://api.helius.xyz/v0/transactions/?api-key=${HELIUS_API_KEY}` 
                        : `https://api-devnet.helius.xyz/v0/transactions/?api-key=${HELIUS_API_KEY}`;
                    
                    console.log("Querying Helius API for transaction details");
                    
                    const heliusResponse = await fetch(apiUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            transactions: [possibleSignature]
                        })
                    });
                    
                    if (heliusResponse.ok) {
                        const transactionDetails = await heliusResponse.json();
                        console.log("Helius transaction details:", JSON.stringify(transactionDetails, null, 2));
                        
                        // Check if the transaction was successful
                        if (transactionDetails[0]) {
                          // Extract the NFT mint address directly from tokenTransfers
                          let mintAddress = null;
                          
                          // Look for NonFungible token in tokenTransfers
                          if (transactionDetails[0].tokenTransfers) {
                            const nftTransfer = transactionDetails[0].tokenTransfers.find(t => 
                              t.tokenStandard === "NonFungible" && t.mint
                            );
                            
                            if (nftTransfer) {
                              mintAddress = nftTransfer.mint;
                              console.log("Found NFT mint address from tokenTransfers:", mintAddress);
                            }
                          }
                          
                          // Alternative: Look in the events.nft.nfts array
                          if (!mintAddress && transactionDetails[0].events?.nft?.nfts) {
                            const nftEvent = transactionDetails[0].events.nft.nfts.find(n => 
                              n.tokenStandard === "NonFungible" && n.mint
                            );
                            
                            if (nftEvent) {
                              mintAddress = nftEvent.mint;
                              console.log("Found NFT mint address from events.nft:", mintAddress);
                            }
                          }
                          
                          if (mintAddress) {
                            console.log("Using NFT collection address:", mintAddress);
                            return {
                              collectionAddress: mintAddress,
                              transactionSignature: possibleSignature,
                              warning: "Transaction confirmation timed out, but Helius confirms the collection was created"
                            };
                          } else {
                            console.log("Could not find NFT mint address in Helius response");
                          }
                        } else {
                          console.log("Helius response contained no transaction details");
                        }
                    } else {
                        console.log("Helius API request failed:", await heliusResponse.text());
                    }
                } catch (heliusError) {
                    console.error("Error fetching transaction details from Helius:", heliusError);
                }
            } else {
                console.log("Skipping Helius API check - missing API key or signature");
            }
            
            // If Helius didn't work or didn't find a created token, try to find it via Metaplex
            try {
                const nfts = await metaplex.nfts().findAllByCreator({ creator: wallet.publicKey })
                
                // Get the most recently created NFT (likely our collection)
                const possibleCollection = nfts[0]
                
                if (possibleCollection) {
                    console.log("Found potential collection NFT:", possibleCollection.address.toBase58())
                    
                    return {
                        collectionAddress: possibleCollection.address.toBase58(),
                        transactionSignature: possibleSignature,
                        warning: "Transaction confirmation timed out, but collection may have been created successfully"
                    }
                }
            } catch (lookupError) {
                console.error("Error looking up possible collection:", lookupError)
            }
        }
        
        throw error
    }
}

// CORS headers
export const onRequestOptions: PagesFunction<ENV> = async () => {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    })
}
