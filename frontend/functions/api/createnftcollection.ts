import { jsonResponse, reportError } from "./cfPagesFunctionsUtils"
import { Connection, Keypair, clusterApiUrl, PublicKey } from "@solana/web3.js"
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js"
import { drizzle } from "drizzle-orm/d1"
import { projectTable } from "../../shared/drizzle-schema"
import { eq } from "drizzle-orm"
import bs58 from "bs58"
import { checkAdminAuthorization, isAdminReturnValue } from "../services/authService"
import { AdminAuthFields } from "../../shared/models"
import { authSchema } from "../../shared/schemas/analysis-schema"

type ENV = {
    DB: D1Database
    BORGPAD_PRIVATE_KEY: string
    SOLANA_RPC_URL: string
    ADMIN_ADDRESSES: string
    VITE_ENVIRONMENT_TYPE: "develop" | "production"
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

        // Parse and validate auth data
        const { error, data } = authSchema.safeParse(auth)
        if (error) {
            return jsonResponse({
                message: 'Invalid auth data format'
            }, 400)
        }

        // Check if user is admin using the auth service
        const authResult: isAdminReturnValue = checkAdminAuthorization({ 
            ctx, 
            auth: data as AdminAuthFields 
        })
        
        if (!authResult.isAdmin) {
            const { error: authError } = authResult as { error: { code: number; message: string }, isAdmin: false }
            await reportError(db, new Error(authError.message))
            return jsonResponse({ message: "Unauthorized! Only admins can create NFT collections." }, authError.code)
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
    let rpcUrl: string;
    
    if (env.SOLANA_RPC_URL) {
        // Extract the Helius API key if present
        const heliusApiKeyMatch = env.SOLANA_RPC_URL.match(/api-key=([^&]+)/);
        const heliusApiKey = heliusApiKeyMatch ? heliusApiKeyMatch[1] : null;
        
        if (heliusApiKey) {
            // Format proper Helius URL based on cluster
            rpcUrl = cluster === "mainnet" 
                ? `https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`
                : `https://devnet.helius-rpc.com/?api-key=${heliusApiKey}`;
        } else {
            // Use provided URL as is
            rpcUrl = env.SOLANA_RPC_URL;
        }
    } else {
        // Fallback to default RPC endpoints
        rpcUrl = cluster === "mainnet" 
            ? "https://api.mainnet-beta.solana.com" 
            : "https://api.devnet.solana.com";
    }
    
    console.log("Using RPC URL:", rpcUrl);
    
    const connection = new Connection(rpcUrl, "confirmed");
    const privateKeyString = env.BORGPAD_PRIVATE_KEY;
    
    // Validate private key
    if (!privateKeyString || typeof privateKeyString !== 'string') {
        throw new Error("Invalid private key: BORGPAD_PRIVATE_KEY is missing or not a string");
    }
    
    // Generate the metadata URI based on project ID and cluster
    const baseDomain = cluster === "devnet" ? "files.staging.borgpad.com" : "files.borgpad.com";
    const metadataUri = `https://${baseDomain}/${projectId}/nft-metadata/collection-metadata.json`;
    
    console.log(`Using metadata URI: ${metadataUri}`);
    
    try {
        // Convert base58 string to Uint8Array
        const privateKeyUint8Array = bs58.decode(privateKeyString);
        
        // Initialize wallet
        const wallet = Keypair.fromSecretKey(privateKeyUint8Array);
        
        // Initialize Metaplex
        const metaplex = Metaplex.make(connection).use(keypairIdentity(wallet));
        
        console.log(`Creating NFT collection for project ${projectId} on ${cluster}`);
        console.log(`Metadata URI: ${metadataUri}`);
        console.log(`Name: ${nftConfig.name}, Symbol: ${nftConfig.symbol}`);
        
        // Create the collection NFT
        const result = await metaplex.nfts().create({
            uri: metadataUri,
            name: nftConfig.name,
            symbol: nftConfig.symbol,
            sellerFeeBasisPoints: 500, // 5% royalties
            isCollection: true,
        });
        
        const collectionNFT = result.nft;
        const signature = result.response.signature;
        
        console.log("Collection NFT created:", collectionNFT.address.toBase58());
        console.log("Transaction signature:", signature);
        
        return {
            collectionAddress: collectionNFT.address.toBase58(),
            transactionSignature: signature
        };
    } catch (error) {
        console.error("Failed to create NFT collection:", error);
        
        // Check if this is a confirmation error but the transaction might have succeeded
        if (error.toString().includes("block height exceeded") || 
            error.toString().includes("TransactionExpiredBlockheightExceededError")) {
          
            // Extract the signature from the error message if possible
            const signatureMatch = error.toString().match(/Signature\s+([a-zA-Z0-9]+)\s+has expired/);
            const possibleSignature = signatureMatch ? signatureMatch[1] : "unknown";
            
            console.log("Transaction may have succeeded despite confirmation error. Signature:", possibleSignature);
            
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
                // Need to recreate wallet and metaplex here since they're in a different scope
                const privateKeyUint8Array = bs58.decode(privateKeyString);
                const wallet = Keypair.fromSecretKey(privateKeyUint8Array);
                const metaplex = Metaplex.make(connection).use(keypairIdentity(wallet));
                
                const nfts = await metaplex.nfts().findAllByCreator({ creator: wallet.publicKey });
                
                // Get the most recently created NFT (likely our collection)
                const possibleCollection = nfts[0];
                
                if (possibleCollection) {
                    console.log("Found potential collection NFT:", possibleCollection.address.toBase58());
                    
                    return {
                        collectionAddress: possibleCollection.address.toBase58(),
                        transactionSignature: possibleSignature,
                        warning: "Transaction confirmation timed out, but collection may have been created successfully"
                    };
                }
            } catch (lookupError) {
                console.error("Error looking up possible collection:", lookupError);
            }
        }
        
        throw error;
    }
}

// CORS headers
export const onRequestOptions: PagesFunction<ENV> = async (ctx) => {
    try {
        if (ctx.env.VITE_ENVIRONMENT_TYPE !== "develop") return
        return new Response(null, {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': 'http://localhost:5173',
                'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
        })
    } catch (error) {
        return jsonResponse({ message: error }, 500)
    }
}
