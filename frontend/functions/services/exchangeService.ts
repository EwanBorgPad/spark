import { GetExchangeResponse } from "../../shared/models"
import { DrizzleD1Database } from "drizzle-orm/d1/driver"
import { and, eq } from "drizzle-orm"
import { exchangeTable } from '../../shared/drizzle-schema'

type RefreshExchangeData = {
  db: DrizzleD1Database
}
const refreshExchangeData = async ({ db }: RefreshExchangeData): Promise<void> => {

  const exchangeRows = (await db
    .select()
    .from(exchangeTable)
    .all()
  )
    .filter(row => !row.isPinned)

  // the processing time should create enough delay to avoid hitting the rate limit, so I haven't included any sleeps/waits in the loop
  for (const exchangeRow of exchangeRows) {
    const { baseCurrency, targetCurrency } = exchangeRow
    const coinMarketData = await getCoinMarketData({ baseCurrency, targetCurrency })
  
    console.log(`Updating (${baseCurrency}-${targetCurrency}), currentPrice=${coinMarketData.currentPrice}`)
    
    await db.update(exchangeTable)
      .set({ 
        currentPrice: coinMarketData.currentPrice,
        quotedFrom: coinMarketData.quotedFrom,
        quotedAt: coinMarketData.quotedAt,
        rawExchangeResponse: coinMarketData.rawExchangeResponse,
      })
      .where(
        and(
          eq(exchangeTable.baseCurrency, baseCurrency),
          eq(exchangeTable.targetCurrency, targetCurrency),
        )
      )
  }
}


//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
///////////////////// GET EXCHANGE DATA //////////////////////
//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////


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
} :GetExchangeDataArgs): Promise<GetExchangeResponse> => {
  const isSupportedCurrencyPair = SUPPORTED_CURRENCY_PAIRS
    .some(pair => pair[0] === baseCurrency && pair[1] === targetCurrency)
  if (!isSupportedCurrencyPair) {
    throw new Error(`Unsupported currency pair (${baseCurrency}-${targetCurrency})!`)
  }

  // special case for usd
  if (baseCurrency === 'usd' && targetCurrency === 'usd') {
    return {
      baseCurrency,
      targetCurrency,
      currentPrice: '1',
      quotedFrom: 'usdc-peg',
    }
  }

  const exchangeData = await db
    .select()
    .from(exchangeTable)
    .where(
      and(
        eq(exchangeTable.baseCurrency, baseCurrency),
        eq(exchangeTable.targetCurrency, targetCurrency),
      )
    )
    .get()
  
  if (!exchangeData) {
    throw new Error(`Exchange data not found for pair (${baseCurrency}/${targetCurrency})!`)
  }

  return exchangeData
}


//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
/////////////////// COINGECKO INTEGRATION ////////////////////
//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////

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

  if (!response.ok) {
    throw new Error(`CoinGecko error! statusCode=${response.status}`)
  }

  const responseJson = (await response.json()) as GetCoinMarketDataApiResponse

  const data = responseJson[0]

  return {
    baseCurrency,
    targetCurrency,
    
    currentPrice: String(data.current_price),
    quotedFrom: GET_COIN_MARKET_DATA_API_URL,
    quotedAt: new Date().toISOString(),
    rawExchangeResponse: responseJson,
  }
}

export const exchangeService = {
  SUPPORTED_CURRENCY_PAIRS,
  getExchangeData,
  refreshExchangeData,
}
