import { Connection, PublicKey } from "@solana/web3.js";
import { jsonResponse, reportError } from './cfPagesFunctionsUtils';
import { drizzle } from "drizzle-orm/d1";

type ENV = {
  RPC_URL: string;
  DB: D1Database;
  VITE_ENVIRONMENT_TYPE?: string;
}

type TokenAccountInfo = {
  mint: string;
  amount: string;
  decimals: number;
  uiAmount: number;
}

type TokenMetadata = {
  name?: string;
  symbol?: string;
  image?: string;
  description?: string;
}

type UserToken = {
  mint: string;
  amount: string;
  decimals: number;
  uiAmount: number;
  metadata: TokenMetadata;
}

export const onRequestGet: PagesFunction<ENV> = async (ctx) => {
  const db = drizzle(ctx.env.DB, { logger: true });
  try {
    const url = new URL(ctx.request.url);
    const userAddress = url.searchParams.get('address');
    
    if (!userAddress) {
      return jsonResponse({ message: "User address parameter is required" }, 400);
    }

    // Validate the address format
    let userPubKey: PublicKey;
    try {
      userPubKey = new PublicKey(userAddress);
    } catch (error) {
      return jsonResponse({ message: "Invalid user address format" }, 400);
    }

    const connection = new Connection(ctx.env.RPC_URL);

    // Get all token accounts owned by the user with parsed data
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(userPubKey, {
      programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"), // SPL Token Program
    });

    console.log(`Found ${tokenAccounts.value.length} token accounts for ${userAddress}`);

    const userTokens: UserToken[] = [];

    // Process each token account
    for (const tokenAccount of tokenAccounts.value) {
      try {
        // Parse token account data - using parsed format
        const parsedInfo = tokenAccount.account.data.parsed?.info;
        if (!parsedInfo) continue;
        
        const mint = new PublicKey(parsedInfo.mint);
        const amount = BigInt(parsedInfo.tokenAmount.amount);
        const decimals = parsedInfo.tokenAmount.decimals;
        const uiAmount = parsedInfo.tokenAmount.uiAmount || 0;
        
        // Skip tokens with zero balance
        if (amount === 0n) continue;

        // Try to fetch token metadata
        let metadata: TokenMetadata = {};
        try {
          // Try to get metadata from Metaplex (common for NFTs and well-formed tokens)
          const metadataPDA = PublicKey.findProgramAddressSync(
            [
              Buffer.from("metadata"),
              new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s").toBuffer(),
              mint.toBuffer(),
            ],
            new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s")
          )[0];

          const metadataAccount = await connection.getAccountInfo(metadataPDA);
          if (metadataAccount) {
            // Parse basic metadata (this is a simplified parser)
            const metadataBuffer = Buffer.from(metadataAccount.data);
            if (metadataBuffer.length > 100) {
              try {
                // Very basic metadata parsing - name starts around byte 69
                let offset = 69;
                const nameLength = metadataBuffer.readUInt32LE(offset);
                if (nameLength > 0 && nameLength < 200) {
                  offset += 4;
                  const nameBytes = metadataBuffer.slice(offset, offset + nameLength);
                  metadata.name = nameBytes.toString('utf8').replace(/\0/g, '').trim();
                  
                  offset += nameLength;
                  const symbolLength = metadataBuffer.readUInt32LE(offset);
                  if (symbolLength > 0 && symbolLength < 50) {
                    offset += 4;
                    const symbolBytes = metadataBuffer.slice(offset, offset + symbolLength);
                    metadata.symbol = symbolBytes.toString('utf8').replace(/\0/g, '').trim();
                  }
                }
              } catch (parseError) {
                console.warn(`Failed to parse metadata for ${mint.toBase58()}:`, parseError);
              }
            }
          }
        } catch (metadataError) {
          console.warn(`Failed to fetch metadata for ${mint.toBase58()}:`, metadataError);
        }

        // If we don't have metadata, use mint address as fallback
        if (!metadata.name && !metadata.symbol) {
          metadata.name = `Token ${mint.toBase58().slice(0, 8)}...`;
          metadata.symbol = mint.toBase58().slice(0, 4).toUpperCase();
        }

        userTokens.push({
          mint: mint.toBase58(),
          amount: amount.toString(),
          decimals,
          uiAmount,
          metadata
        });

      } catch (error) {
        console.warn(`Failed to process token account:`, error);
        continue;
      }
    }

    // Sort tokens by balance (highest first)
    userTokens.sort((a, b) => b.uiAmount - a.uiAmount);

    // Get SOL balance
    const solBalance = await connection.getBalance(userPubKey);
    const solBalanceInSol = solBalance / 1e9; // Convert lamports to SOL

    return jsonResponse({
      success: true,
      userAddress,
      solBalance: {
        mint: "So11111111111111111111111111111111111111112", // SOL mint
        amount: solBalance.toString(),
        decimals: 9,
        uiAmount: solBalanceInSol,
        metadata: {
          name: "Solana",
          symbol: "SOL",
          image: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png"
        }
      },
      tokens: userTokens,
      tokenCount: userTokens.length
    }, 200);

  } catch (e) {
    console.error("Error fetching user tokens:", e);
    await reportError(ctx.env.DB, e);
    return jsonResponse({ message: "Something went wrong fetching user tokens..." }, 500);
  }
};

export const onRequestOptions: PagesFunction<ENV> = async (ctx) => {
  try {
    if (ctx.env.VITE_ENVIRONMENT_TYPE !== "develop") return;
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': 'http://localhost:5173',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    return jsonResponse({ message: error }, 500);
  }
}; 