import { jsonResponse, reportError } from "./cfPagesFunctionsUtils"
import { drizzle } from "drizzle-orm/d1"
import { SaleResultsService } from "../services/saleResultsService"


type ENV = {
  DB: D1Database
}
export const onRequestGet: PagesFunction<ENV> = async (ctx) => {
  const db = drizzle(ctx.env.DB, { logger: true })
  try {
    // parse/validate request
    const { searchParams } = new URL(ctx.request.url)
    const projectId = searchParams.get("projectId") ?? 'aurelia'
    // if (!projectId) return jsonResponse({ message: 'projectId is missing!' }, 400)

    const saleResults = await SaleResultsService.getSaleResults({
      db, projectId,
    })

    return jsonResponse(saleResults, {
      headers: {
        "Cache-Control": "public, max-age=15, stale-while-revalidate=30",
      }
    })
  } catch (e) {
    await reportError(ctx.env.DB, e)
    return jsonResponse({ message: "Something went wrong..." }, 500)
  }
}
