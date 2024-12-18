import { jsonResponse, reportError } from "./cfPagesFunctionsUtils"
import { exchangeService } from "../services/exchangeService"
import { drizzle } from "drizzle-orm/d1"


type ENV = {
  DB: D1Database
}
export const onRequestGet: PagesFunction<ENV> = async (ctx): Promise<Response> => {
  const db = drizzle(ctx.env.DB, { logger: true })
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

    const response = await exchangeService.getExchangeData({
      db, baseCurrency, targetCurrency,
    })

    // return result
    return jsonResponse(response)
  } catch (e) {
    await reportError(ctx.env.DB, e)
    return jsonResponse({
      message: "Something went wrong...",
    }, 500)
  }
}
