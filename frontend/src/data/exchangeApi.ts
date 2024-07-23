/**
 * For the exchange we're currently using coingecko.
 * - All exchange APIs should be encapsulated in this file for better maintainability.
 * - There's also a price-only API https://api.coingecko.com/api/v3/simple/price?ids=swissborg&vs_currencies=usd
 *  but this one returns that + much more, so let's just use this one (/coins/markets).
 * - The API has a rate limit of around 4-5 requests per minute (can't find this info, but it seems to be around that).
 * - Currently used directly from the frontend (they allow CORS), this might actually work better with the rate limiting because the requests will be coming from different ip addresses,
 *  but we can move this to the backend any time if needed.
 */
const GET_COIN_MARKET_DATA_API_URL =
  "https://api.coingecko.com/api/v3/coins/markets" // ?ids=swissborg&vs_currency=usd'

type GetCoinMarketDataArgs = {
  coin: string
  vsCurrency: string
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
const getCoinMarketData = async ({
  coin,
  vsCurrency,
}: GetCoinMarketDataArgs): Promise<GetCoinMarketDataResponse> => {
  const url = new URL(GET_COIN_MARKET_DATA_API_URL)
  url.searchParams.set("ids", coin)
  url.searchParams.set("vs_currency", vsCurrency)

  const response = await fetch(url)
  const responseJson = (await response.json()) as GetCoinMarketDataApiResponse

  const data = responseJson[0]

  return {
    currentPrice: data.current_price,
    marketCap: data.market_cap,
    fullyDilutedValuation: data.fully_diluted_valuation,
  }
}

export const exchangeApi = {
  getCoinMarketData,
}
