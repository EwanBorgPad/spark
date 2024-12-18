import { GetExchangeResponse } from "../../shared/models"
import { addSeconds } from "date-fns/addSeconds"
import { DrizzleD1Database } from "drizzle-orm/d1/driver"
import { sql } from "drizzle-orm"

/**
 * GET /exchange
 * Serves exchange data from a 3rd party exchange, and caches the response in the D1 db in order to avoid being rate limited.
 * TODO @exchange this works ok for one currencyPair, let's think about what happens when we have a lot of different queries
 * TODO @exchange think about how this service notifies us that rate limit has been hit, seems very important
 * TODO @security should we whitelist currencies? (this way anyone can post any string there)
 *
 * TODO handle rate limit correctly
 * TODO check if calling this from frontend should be removed
 * TODO migrate to drizzleorm
 * TODO whitelist currencies to prevent api abuse
 */
/**
 * Caching statuses terminology borrowed from CloudFlare https://developers.cloudflare.com/cache/concepts/cache-responses/
 */
type CacheStatus =
/** Resource was found in cache. */
  | 'HIT'
  /** The resource was not found in Cloudflare’s cache and was served from the origin web server. */
  | 'MISS'
/**
 * Time in seconds after which the cache is invalidated
 * TODO document the api's actual rate limits (check http headers for that data)
 */
const CACHE_TTL_SECONDS = 30

const SUPPORTED_CURRENCY_PAIRS: [string, string][] = [
  ['swissborg', 'usd'],
  ['usd', 'usd'],
]

type GetExchangeDataArgs = {
  db: DrizzleD1Database
  baseCurrency: string
  targetCurrency: string
}
const getExchangeData = async ({
  db,
  baseCurrency,
  targetCurrency,
} :GetExchangeDataArgs) => {
  const isSupportedCurrencyPair = SUPPORTED_CURRENCY_PAIRS.some(pair => pair[0] === baseCurrency && pair[1] === targetCurrency)
  if (!isSupportedCurrencyPair) {
    throw new Error(`Unsupported currency pair (${baseCurrency}-${targetCurrency})!`)
  }

  // build cache key
  const cacheKey = `exchange-api/${baseCurrency}-${targetCurrency}`

  // pull existing cache
  const cacheDbResult = await db.run(sql`SELECT * FROM cache_store WHERE cache_key = ${cacheKey}`)

  const cache = cacheDbResult.results[0]

  const isExpired = cache ? (new Date() > new Date(cache.expires_at)) : true

  let coinMarketData
  let cacheStatus: CacheStatus
  let createdAt: string
  let expiresAt: string

  if (cache && !isExpired) {
    cacheStatus = 'HIT'
    coinMarketData = JSON.parse(cache.cache_data)
    createdAt = cache.created_at
    expiresAt = cache.expires_at
  } else {
    // refetch from origin and save to db
    cacheStatus = 'MISS'
    coinMarketData = await getCoinMarketData({ baseCurrency, targetCurrency })
    createdAt = new Date().toISOString()
    expiresAt = addSeconds(new Date(createdAt), CACHE_TTL_SECONDS).toISOString()

    await db
      .run(
        sql`REPLACE INTO cache_store (cache_key, created_at, expires_at, cache_data)
        VALUES (${cacheKey}, ${createdAt}, ${expiresAt}, ${JSON.stringify(coinMarketData)});`
      )
  }

  const result: GetExchangeResponse = {
    baseCurrency,
    targetCurrency,
    ...coinMarketData,
    cache: {
      cacheStatus,
      createdAt,
      expiresAt,
    }
  }

  return result
}

/**
 * For the exchange we're currently using coingecko.
 * - There's also a price-only API https://api.coingecko.com/api/v3/simple/price?ids=swissborg&vs_currencies=usd
 *  but this one returns that + much more, so let's just use this one (/coins/markets).
 * - The API has a rate limit of around 4-5 requests per minute (can't find this info, but it seems to be around that).
 */
const GET_COIN_MARKET_DATA_API_URL =
  "https://api.coingecko.com/api/v3/coins/markets" // ?ids=swissborg&vs_currency=usd'

type GetCoinMarketDataArgs = {
  baseCurrency: string
  targetCurrency: string
}
/**
 * Click here to get response https://api.coingecko.com/api/v3/coins/markets?ids=swissborg&vs_currency=usd
 * Not all fields are typed, only those that are actually used are.
 */
type GetCoinMarketDataApiResponse = {
  current_price: number
  market_cap: number
  fully_diluted_valuation: number
}[]
const getCoinMarketData = async ({ baseCurrency, targetCurrency }: GetCoinMarketDataArgs): Promise<GetExchangeResponse> => {
  const url = new URL(GET_COIN_MARKET_DATA_API_URL)
  url.searchParams.set("ids", baseCurrency)
  url.searchParams.set("vs_currency", targetCurrency)

  const response = await fetch(url, {
    headers: {
      // omitting user-agent header triggers cloudflare protection
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
    },
  })
  const responseJson = (await response.json()) as GetCoinMarketDataApiResponse

  const data = responseJson[0]

  return {
    baseCurrency,
    targetCurrency,
    currentPrice: data.current_price,
    marketCap: data.market_cap,
    fullyDilutedValuation: data.fully_diluted_valuation,
    quotedFrom: GET_COIN_MARKET_DATA_API_URL,
  }
}

export const exchangeService = {
  SUPPORTED_CURRENCY_PAIRS,
  getExchangeData,
}
