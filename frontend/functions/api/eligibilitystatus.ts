import { jsonResponse } from "./cfPagesFunctionsUtils"
import { EligibilityService } from "../services/eligibilityService"

type ENV = {
  DB: D1Database
  SOLANA_RPC_URL: string
}
export const onRequestGet: PagesFunction<ENV> = async (ctx) => {
  try {
    const db = ctx.env.DB
    const rpcUrl = ctx.env.SOLANA_RPC_URL

    const { searchParams } = new URL(ctx.request.url)
    const address = searchParams.get("address")
    const projectId = searchParams.get("projectId")

    if (!address) return jsonResponse({ message: 'address is missing!' }, 400)
    if (!projectId) return jsonResponse({ message: 'projectId is missing!' }, 400)

    const eligibilityStatus = await EligibilityService.getEligibilityStatus({
      db, address, projectId, rpcUrl,
    })

    return jsonResponse(eligibilityStatus, 200)
  } catch (e) {
    console.error(e)
    return jsonResponse({ message: "Something went wrong..." }, 500)
  }
}
