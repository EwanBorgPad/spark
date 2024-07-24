import { jsonResponse } from "./cfPagesFunctionsUtils"

type ENV = {
  DB: D1Database
}
export const onRequestGet: PagesFunction<ENV> = async (ctx) => {
  try {
    // parse request
    const { searchParams } = new URL(ctx.request.url)
    const baseCurrency = searchParams.get('baseCurrency')
    const targetCurrency = searchParams.get('targetCurrency')

    // validate request
    if (!baseCurrency || !targetCurrency) {
      return jsonResponse({
        message: 'Must provide baseCurrency and targetCurrency args!'
      }, 400)
    }

    // pull existing cache

    // refetch if needed and save to db
    const coinMarketData = await getCoinMarketData({ baseCurrency, targetCurrency })

    // return result
    return jsonResponse(coinMarketData)
  } catch (e) {
    console.error(e)
    return jsonResponse({
      message: "Something went wrong...",
    }, 500)
  }
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
type GetCoinMarketDataResponse = {
  currentPrice: number
  marketCap: number
  fullyDilutedValuation: number
}
const getCoinMarketData = async ({ baseCurrency, targetCurrency }: GetCoinMarketDataArgs): Promise<GetCoinMarketDataResponse> => {
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
    currentPrice: data.current_price,
    marketCap: data.market_cap,
    fullyDilutedValuation: data.fully_diluted_valuation,
  }
}
