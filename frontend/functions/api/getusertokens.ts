import { Connection, PublicKey } from "@solana/web3.js";
import { jsonResponse, reportError } from './cfPagesFunctionsUtils';
import { drizzle } from "drizzle-orm/d1";

type ENV = {
  RPC_URL: string;
  DB: D1Database;
  VITE_ENVIRONMENT_TYPE?: string;
}

type TokenMetadata = {
  name?: string;
  symbol?: string;
  image?: string;
  description?: string;
  uri?: string;
  logoURI?: string;
}

type UserToken = {
  mint: string;
  amount: string;
  decimals: number;
  uiAmount: number;
  metadata: TokenMetadata;
}

// Known token registry for common tokens
const KNOWN_TOKENS: Record<string, TokenMetadata> = {
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": {
    name: "USD Coin",
    symbol: "USDC",
    image: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png"
  },
  "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB": {
    name: "USDT",
    symbol: "USDT",
    image: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.png"
  },
  "So11111111111111111111111111111111111111112": {
    name: "Wrapped SOL",
    symbol: "SOL",
    image: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png"
  },
  "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So": {
    name: "Marinade staked SOL",
    symbol: "mSOL",
    image: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So/logo.png"
  },
  "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs": {
    name: "Wrapped Ethereum",
    symbol: "WETH",
    image: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs/logo.png"
  },
  "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R": {
    name: "Raydium",
    symbol: "RAY",
    image: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R/logo.png"
  },
  "SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt": {
    name: "Serum",
    symbol: "SRM",
    image: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt/logo.png"
  }
};

/**
 * Enhanced token metadata fetcher with multiple fallback strategies
 */
async function getTokenMetadata(connection: Connection, mintAddress: string | PublicKey): Promise<TokenMetadata> {
  const mint = typeof mintAddress === 'string' ? new PublicKey(mintAddress) : mintAddress;
  const mintString = mint.toBase58();
  
  console.log(`Fetching metadata for mint: ${mintString}`);
  
  // Strategy 1: Check known tokens first
  if (KNOWN_TOKENS[mintString]) {
    console.log(`Found in known tokens registry: ${mintString}`);
    return KNOWN_TOKENS[mintString];
  }
  
  // Strategy 2: Try Metaplex metadata
  try {
    const metaplexMetadata = await getMetaplexMetadata(connection, mint);
    if (metaplexMetadata.name || metaplexMetadata.symbol) {
      console.log(`Found Metaplex metadata for: ${mintString}`);
      return metaplexMetadata;
    }
  } catch (error) {
    console.warn(`Metaplex metadata failed for ${mintString}:`, error);
  }
  
  // Strategy 3: Try Jupiter API
  try {
    const jupiterMetadata = await getJupiterTokenMetadata(mintString);
    if (jupiterMetadata.name || jupiterMetadata.symbol) {
      console.log(`Found in Jupiter API: ${mintString}`);
      return jupiterMetadata;
    }
  } catch (error) {
    console.warn(`Jupiter API failed for ${mintString}:`, error);
  }
  
  console.log(`No metadata found for ${mintString}`);
  return {};
}

/**
 * Get metadata from Metaplex Token Metadata program
 */
async function getMetaplexMetadata(connection: Connection, mint: PublicKey): Promise<TokenMetadata> {
  const TOKEN_METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
  
  const [metadataPDA] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );

  const metadataAccount = await connection.getAccountInfo(metadataPDA);
  
  if (!metadataAccount) {
    return {};
  }

  const metadata = parseMetadataAccount(metadataAccount.data);
  
  // If there's a URI, fetch external metadata
  if (metadata.uri) {
    try {
      const externalMetadata = await fetchExternalMetadata(metadata.uri);
      return { ...metadata, ...externalMetadata };
    } catch (error) {
      console.warn(`Failed to fetch external metadata from URI: ${metadata.uri}`, error);
    }
  }

  return metadata;
}

/**
 * Parse Metaplex metadata account
 */
function parseMetadataAccount(data: Buffer): TokenMetadata {
  try {
    let offset = 1; // Skip the key byte
    
    // Skip update authority (32 bytes)
    offset += 32;
    
    // Skip mint (32 bytes)  
    offset += 32;
    
    // Parse name
    const nameLength = data.readUInt32LE(offset);
    offset += 4;
    
    if (nameLength > 0 && nameLength < 200 && offset + nameLength <= data.length) {
      const nameBytes = data.slice(offset, offset + nameLength);
      const name = nameBytes.toString('utf8').replace(/\0/g, '').trim();
      offset += nameLength;
      
      // Parse symbol
      const symbolLength = data.readUInt32LE(offset);
      offset += 4;
      
      let symbol = '';
      if (symbolLength > 0 && symbolLength < 50 && offset + symbolLength <= data.length) {
        const symbolBytes = data.slice(offset, offset + symbolLength);
        symbol = symbolBytes.toString('utf8').replace(/\0/g, '').trim();
        offset += symbolLength;
      }
      
      // Parse URI
      const uriLength = data.readUInt32LE(offset);
      offset += 4;
      
      let uri = '';
      if (uriLength > 0 && uriLength < 500 && offset + uriLength <= data.length) {
        const uriBytes = data.slice(offset, offset + uriLength);
        uri = uriBytes.toString('utf8').replace(/\0/g, '').trim();
      }
      
      return {
        name: name || undefined,
        symbol: symbol || undefined,
        uri: uri || undefined
      };
    }
  } catch (error) {
    console.error('Error parsing metadata account:', error);
  }
  
  return {};
}

/**
 * Fetch from Jupiter API
 */
async function getJupiterTokenMetadata(mintString: string): Promise<TokenMetadata> {
  try {
    const response = await fetch(
      `https://token.jup.ag/strict`,
      { signal: AbortSignal.timeout(5000) }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const tokens = await response.json() as TokenMetadata[];
    const token = tokens.find((t: any) => t.address === mintString);
    
    if (token) {
      return {
        name: token.name || undefined,
        symbol: token.symbol || undefined,
        image: token.image || undefined,
        description: token.description || undefined
      };
    }
  } catch (error) {
    console.error('Error fetching from Jupiter API:', error);
  }
  
  return {};
}

/**
 * Fetch external metadata from URI
 */
async function fetchExternalMetadata(uri: string): Promise<Partial<TokenMetadata>> {
  try {
    let fetchUrl = uri;
    
    // Handle different URI schemes
    if (uri.startsWith('ipfs://')) {
      fetchUrl = uri.replace('ipfs://', 'https://ipfs.io/ipfs/');
    } else if (uri.startsWith('ar://')) {
      fetchUrl = uri.replace('ar://', 'https://arweave.net/');
    }
    
    const response = await fetch(fetchUrl, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const metadata = await response.json() as TokenMetadata;
    
    return {
      name: metadata.name || undefined,
      symbol: metadata.symbol || undefined,
      description: metadata.description || undefined,
      image: metadata.image || undefined
    };
  } catch (error) {
    console.error('Error fetching external metadata:', error);
    return {};
  }
}

/**
 * Get metadata with fallback
 */
async function getTokenMetadataWithFallback(
  connection: Connection,
  mintAddress: string | PublicKey
): Promise<TokenMetadata> {
  const mint = typeof mintAddress === 'string' ? new PublicKey(mintAddress) : mintAddress;
  const mintString = mint.toBase58();
  
  const metadata = await getTokenMetadata(connection, mint);
  
  // If still no metadata, create fallback
  if (!metadata.name && !metadata.symbol) {
    return {
      name: `Token ${mintString.slice(0, 8)}...`,
      symbol: mintString.slice(0, 4).toUpperCase(),
      ...metadata
    };
  }
  
  return metadata;
}

/**
 * Batch fetch metadata for multiple tokens
 */
async function getBatchTokenMetadata(
  connection: Connection,
  mintAddresses: string[]
): Promise<Record<string, TokenMetadata>> {
  const results: Record<string, TokenMetadata> = {};
  
  // Process in smaller batches to avoid rate limiting
  const batchSize = 3;
  for (let i = 0; i < mintAddresses.length; i += batchSize) {
    const batch = mintAddresses.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (mintString) => {
      try {
        const metadata = await getTokenMetadataWithFallback(connection, mintString);
        return { mintString, metadata };
      } catch (error) {
        console.error(`Failed to fetch metadata for ${mintString}:`, error);
        return { 
          mintString, 
          metadata: {
            name: `Token ${mintString.slice(0, 8)}...`,
            symbol: mintString.slice(0, 4).toUpperCase()
          }
        };
      }
    });
    
    const batchResults = await Promise.allSettled(batchPromises);
    
    batchResults.forEach((result) => {
      if (result.status === 'fulfilled') {
        results[result.value.mintString] = result.value.metadata;
      }
    });
    
    // Add delay between batches
    if (i + batchSize < mintAddresses.length) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }
  
  return results;
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

    // First, collect all non-zero token accounts
    const validTokenAccounts = [];
    for (const tokenAccount of tokenAccounts.value) {
      const parsedInfo = tokenAccount.account.data.parsed?.info;
      if (!parsedInfo) continue;
      
      const amount = BigInt(parsedInfo.tokenAmount.amount);
      if (amount === 0n) continue; // Skip tokens with zero balance
      
      validTokenAccounts.push({
        mint: parsedInfo.mint,
        amount: amount.toString(),
        decimals: parsedInfo.tokenAmount.decimals,
        uiAmount: parsedInfo.tokenAmount.uiAmount || 0
      });
    }

    console.log(`Processing ${validTokenAccounts.length} tokens with non-zero balance`);

    // Batch fetch metadata for all tokens
    const mintAddresses = validTokenAccounts.map(token => token.mint);
    const metadataMap = await getBatchTokenMetadata(connection, mintAddresses);

    // Create user tokens array with metadata
    const userTokens: UserToken[] = validTokenAccounts.map(token => ({
      mint: token.mint,
      amount: token.amount,
      decimals: token.decimals,
      uiAmount: token.uiAmount,
      metadata: metadataMap[token.mint] || {
        name: `Token ${token.mint.slice(0, 8)}...`,
        symbol: token.mint.slice(0, 4).toUpperCase()
      }
    }));

    // Sort tokens by balance (highest first)
    userTokens.sort((a, b) => b.uiAmount - a.uiAmount);

    // Get SOL balance
    const solBalance = await connection.getBalance(userPubKey);
    const solBalanceInSol = solBalance / 1e9; // Convert lamports to SOL

    console.log(`Successfully processed ${userTokens.length} tokens for ${userAddress}`);

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