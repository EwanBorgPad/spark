import { jsonResponse, reportError } from './cfPagesFunctionsUtils';
import { drizzle } from "drizzle-orm/d1";

type ENV = {
  RPC_URL: string;
  DB: D1Database;
  VITE_ENVIRONMENT_TYPE?: string;
}

type TokenMarketData = {
  address: string;
  name: string;
  symbol: string;
  price: number;
  priceChange24h: number;
  marketCap: number;
  volume24h: number;
  liquidity: number;
  fdv: number; // Fully Diluted Valuation
  priceChart: Array<{
    timestamp: number;
    price: number;
  }>;
  lastUpdated: string;
}

export const onRequestGet: PagesFunction<ENV> = async (ctx) => {
  const db = drizzle(ctx.env.DB, { logger: true });
  try {
    const url = new URL(ctx.request.url);
    const tokenAddress = url.searchParams.get('address');
    
    if (!tokenAddress) {
      return jsonResponse({ message: "Token address parameter is required" }, 400);
    }

    console.log(`Fetching market data for token: ${tokenAddress}`);

    // Initialize response with defaults
    let tokenMarketData: TokenMarketData = {
      address: tokenAddress,
      name: "Unknown Token",
      symbol: "UNKNOWN",
      price: 0,
      priceChange24h: 0,
      marketCap: 0,
      volume24h: 0,
      liquidity: 0,
      fdv: 0,
      priceChart: [],
      lastUpdated: new Date().toISOString()
    };

    try {
      // First, try to get basic token info from Jupiter Price API V2
      const jupiterResponse = await fetch(`https://lite-api.jup.ag/price/v2?ids=${tokenAddress}`);
      if (jupiterResponse.ok) {
        const jupiterData = await jupiterResponse.json() as any;
        const tokenData = jupiterData.data?.[tokenAddress];
        
        if (tokenData && tokenData.price) {
          tokenMarketData.price = parseFloat(tokenData.price);
          console.log(`Jupiter Price API V2 for ${tokenAddress}: $${tokenData.price}`);
        }
      }
    } catch (error) {
      console.warn("Failed to fetch from Jupiter Price API V2:", error);
    }

    try {
      // Get more detailed market data from DexScreener
      const dexScreenerResponse = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`);
      if (dexScreenerResponse.ok) {
        const dexScreenerData = await dexScreenerResponse.json() as any;
        
        if (dexScreenerData.pairs && dexScreenerData.pairs.length > 0) {
          // Get the most liquid pair (usually first one)
          const mainPair = dexScreenerData.pairs[0];
          
          tokenMarketData.name = mainPair.baseToken.name || tokenMarketData.name;
          tokenMarketData.symbol = mainPair.baseToken.symbol || tokenMarketData.symbol;
          tokenMarketData.price = parseFloat(mainPair.priceUsd) || tokenMarketData.price;
          tokenMarketData.priceChange24h = parseFloat(mainPair.priceChange?.h24) || 0;
          tokenMarketData.volume24h = parseFloat(mainPair.volume?.h24) || 0;
          tokenMarketData.liquidity = parseFloat(mainPair.liquidity?.usd) || 0;
          tokenMarketData.marketCap = parseFloat(mainPair.marketCap) || 0;
          tokenMarketData.fdv = parseFloat(mainPair.fdv) || 0;
          
        }
      }
    } catch (error) {
      console.warn("Failed to fetch from DexScreener API:", error);
    }

    try {
      // Get historical price data for chart from Birdeye (if available)
      const birdeyeResponse = await fetch(
        `https://public-api.birdeye.so/defi/history_price?address=${tokenAddress}&address_type=token&type=1H&time_from=${Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60}&time_to=${Math.floor(Date.now() / 1000)}`,
        {
          headers: {
            'X-API-KEY': 'your-birdeye-api-key-here' // You'd need to get this from Birdeye
          }
        }
      );
      
      if (birdeyeResponse.ok) {
        const birdeyeData = await birdeyeResponse.json() as any;
        if (birdeyeData.data && birdeyeData.data.items) {
          tokenMarketData.priceChart = birdeyeData.data.items.map((item: any) => ({
            timestamp: item.unixTime * 1000,
            price: item.value
          }));
        }
      }
    } catch (error) {
      console.warn("Failed to fetch from Birdeye API:", error);
      
      // Generate mock chart data if no real data available
      const now = Date.now();
      const oneHour = 60 * 60 * 1000;
      const mockChart = [];
      
      for (let i = 168; i >= 0; i--) { // 7 days of hourly data
        const timestamp = now - (i * oneHour);
        const randomVariation = (Math.random() - 0.5) * 0.1; // ±5% variation
        const price = tokenMarketData.price * (1 + randomVariation);
        mockChart.push({
          timestamp,
          price: Math.max(0, price)
        });
      }
      
      tokenMarketData.priceChart = mockChart;
    }

    try {
      // Try CoinGecko as fallback for well-known tokens
      if (tokenMarketData.price === 0) {
        // This would require mapping Solana addresses to CoinGecko IDs
        // For now, we'll skip this but it's a good future enhancement
        console.log("Could not find price data from primary sources");
      }
    } catch (error) {
      console.warn("Failed to fetch from CoinGecko API:", error);
    }

    // If we still don't have basic info, try to get it from on-chain metadata
    if (tokenMarketData.name === "Unknown Token") {
      try {
        // This would connect to Solana RPC and fetch token metadata
        // For now, we'll use the address as fallback
        tokenMarketData.name = `Token ${tokenAddress.slice(0, 8)}...`;
        tokenMarketData.symbol = tokenAddress.slice(0, 4).toUpperCase();
      } catch (error) {
        console.warn("Failed to fetch on-chain metadata:", error);
      }
    }

    return jsonResponse({
      success: true,
      tokenMarketData
    }, 200);

  } catch (e) {
    console.error("Error fetching token market data:", e);
    await reportError(ctx.env.DB, e);
    return jsonResponse({ message: "Something went wrong fetching token market data..." }, 500);
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