import { addSeconds } from "date-fns/addSeconds";
import { sql } from "drizzle-orm";
/**
 * Time in seconds after which the cache is invalidated
 */
const CACHE_TTL_SECONDS = 30;
const SUPPORTED_CURRENCY_PAIRS = [
    ['swissborg', 'usd'],
    ['usd', 'usd'],
];
const getExchangeData = async ({ db, baseCurrency, targetCurrency, }) => {
    const isSupportedCurrencyPair = SUPPORTED_CURRENCY_PAIRS.some(pair => pair[0] === baseCurrency && pair[1] === targetCurrency);
    if (!isSupportedCurrencyPair) {
        throw new Error(`Unsupported currency pair (${baseCurrency}-${targetCurrency})!`);
    }
    if (baseCurrency === 'usd' && targetCurrency === 'usd') {
        return {
            baseCurrency,
            targetCurrency,
            currentPrice: 1,
            fullyDilutedValuation: 0,
            quotedFrom: 'usdc-peg',
        };
    }
    // build cache key
    const cacheKey = `exchange-api/${baseCurrency}-${targetCurrency}`;
    // pull existing cache
    const cache = (await db
        .run(sql `SELECT * FROM cache_store WHERE cache_key = ${cacheKey}`)).results[0];
    const isExpired = cache ? (new Date() > new Date(cache.expires_at)) : true;
    let coinMarketData;
    let cacheStatus;
    let createdAt;
    let expiresAt;
    if (cache && !isExpired) {
        cacheStatus = 'HIT';
        coinMarketData = JSON.parse(cache.cache_data);
        createdAt = cache.created_at;
        expiresAt = cache.expires_at;
    }
    else {
        // refetch from origin and save to db
        cacheStatus = 'MISS';
        coinMarketData = await getCoinMarketData({ baseCurrency, targetCurrency });
        createdAt = new Date().toISOString();
        expiresAt = addSeconds(new Date(createdAt), CACHE_TTL_SECONDS).toISOString();
        await db
            .run(sql `REPLACE INTO cache_store (cache_key, created_at, expires_at, cache_data)
        VALUES (${cacheKey}, ${createdAt}, ${expiresAt}, ${JSON.stringify(coinMarketData)});`);
    }
    const result = {
        baseCurrency,
        targetCurrency,
        ...coinMarketData,
        cache: {
            cacheStatus,
            createdAt,
            expiresAt,
        }
    };
    return result;
};
/**
 * For the exchange we're currently using coingecko.
 * - There's also a price-only API https://api.coingecko.com/api/v3/simple/price?ids=swissborg&vs_currencies=usd
 *  but this one returns that + much more, so let's just use this one (/coins/markets).
 * - The API has a rate limit of around 4-5 requests per minute (can't find this info, but it seems to be around that).
 */
const GET_COIN_MARKET_DATA_API_URL = "https://api.coingecko.com/api/v3/coins/markets"; // ?ids=swissborg&vs_currency=usd'
const getCoinMarketData = async ({ baseCurrency, targetCurrency }) => {
    const url = new URL(GET_COIN_MARKET_DATA_API_URL);
    url.searchParams.set("ids", baseCurrency);
    url.searchParams.set("vs_currency", targetCurrency);
    const response = await fetch(url, {
        headers: {
            // omitting user-agent header triggers cloudflare protection
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
        },
    });
    const responseJson = (await response.json());
    const data = responseJson[0];
    return {
        baseCurrency,
        targetCurrency,
        currentPrice: data.current_price,
        fullyDilutedValuation: data.fully_diluted_valuation,
        quotedFrom: GET_COIN_MARKET_DATA_API_URL,
    };
};
export const exchangeService = {
    SUPPORTED_CURRENCY_PAIRS,
    getExchangeData,
};
