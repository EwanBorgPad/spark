import { isApiKeyValid } from '../../services/apiKeyService'
import { exchangeService } from '../../services/exchangeService'
import { jsonResponse, reportError } from "../cfPagesFunctionsUtils"
import { drizzle } from "drizzle-orm/d1"

type ENV = {
  DB: D1Database
}
export const onRequestPost: PagesFunction<ENV> = async (ctx) => {
  const db = drizzle(ctx.env.DB, { logger: true })
  try {
    // authorize request
    if (!await isApiKeyValid({ ctx, permissions: ['write'] })) {
      return jsonResponse(null, 401)
    }

    try {
      const status = await exchangeService.refreshExchangeData({ db })
      return jsonResponse(status, 200)
    } catch (e) {
      return jsonResponse({
        message: 'Something went wrong...',
        error: e.message,
      }, 500)
    }
    
  } catch (e) {
    await reportError(db, e)
    return jsonResponse({ message: "Something went wrong..." }, 500)
  }
}
