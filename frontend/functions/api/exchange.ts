import { jsonResponse, reportError } from "./cfPagesFunctionsUtils"
import { exchangeService } from "../services/exchangeService"


type ENV = {
  DB: D1Database
}
export const onRequestGet: PagesFunction<ENV> = async (ctx): Promise<Response> => {
  const db = ctx.env.DB
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
    await reportError(db, e)
    return jsonResponse({
      message: "Something went wrong...",
    }, 500)
  }
}
