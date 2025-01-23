import { exchangeService } from '../../services/exchangeService'
import { jsonResponse, reportError, hasAdminAccess } from "../cfPagesFunctionsUtils"
import { drizzle } from "drizzle-orm/d1"

type ENV = {
  DB: D1Database
  ADMIN_API_KEY_HASH: string
}
export const onRequestPost: PagesFunction<ENV> = async (ctx) => {
  const db = drizzle(ctx.env.DB, { logger: true })
  try {
    // authorize request
    if (!hasAdminAccess(ctx)) {
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
