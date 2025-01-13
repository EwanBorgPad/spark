import { jsonResponse, reportError } from "./cfPagesFunctionsUtils"
import { drizzle } from "drizzle-orm/d1"
import { SaleResultsService } from "../services/saleResultsService"
import { SaleResults } from "../../shared/models"


type ENV = {
  DB: D1Database
}
export const onRequestGet: PagesFunction<ENV> = async (ctx) => {
  const db = drizzle(ctx.env.DB, { logger: true })
  try {
    const cache = caches.default
    // parse/validate request
    const { searchParams } = new URL(ctx.request.url)
    const projectId = searchParams.get("projectId") ?? 'aurelia'
    // if (!projectId) return jsonResponse({ message: 'projectId is missing!' }, 400)
    let cacheResponse = await cache.match(ctx.request.url)
    if (!cacheResponse) {
      const saleResults = await SaleResultsService.getSaleResults({
        db, projectId,
      })
      console.log("No cache available!")
      console.log("Putting cache in...")
      await cache.put(ctx.request.url, new Response(JSON.stringify(saleResults)))
      console.log("Cache is loaded..")
      return jsonResponse(saleResults, 200)
    }
    const results = await cacheResponse.json() as SaleResults

    return jsonResponse(results, {
      headers: {
        "Cache-Control": "public, max-age=15",
      }
    })
  } catch (e) {
    await reportError(ctx.env.DB, e)
    return jsonResponse({ message: "Something went wrong..." }, 500)
  }
}
