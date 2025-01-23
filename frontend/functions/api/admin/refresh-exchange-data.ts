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

    await exchangeService.refreshExchangeData({ db })

    return jsonResponse({ message: "Ok!" }, 200)
  } catch (e) {
    await reportError(ctx.env.DB, e)
    return jsonResponse({ message: "Something went wrong..." }, 500)
  }
}
