import { jsonResponse, reportError } from "../cfPagesFunctionsUtils"
import { drizzle } from "drizzle-orm/d1"
import { UserService } from "../../services/userService"

type ENV = {
  DB: D1Database
}
export const onRequestGet: PagesFunction<ENV> = async (ctx) => {
  const db = drizzle(ctx.env.DB, { logger: true })
  try {
    // parse request
    const { searchParams } = new URL(ctx.request.url)
    const address = searchParams.get('address')

    // validate request
    if (!address) {
      return jsonResponse({
        message: 'Missing wallet address!'
      }, 400)
    }

    // happy flow

    const serviceResults = await UserService.getUserDepositsByProjects(db, address)

    return jsonResponse(serviceResults, {
      headers: {
        "Cache-Control": "public, max-age=20",
      }
    })
  } catch (e) {
    await reportError(ctx.env.DB, e)
    return jsonResponse({ message: "Something went wrong..." }, 500)
  }
}
