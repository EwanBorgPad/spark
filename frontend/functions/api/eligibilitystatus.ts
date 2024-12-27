import { eq } from "drizzle-orm"
import { drizzle } from "drizzle-orm/d1"

import { jsonResponse, reportError } from "./cfPagesFunctionsUtils"
import { EligibilityService } from "../services/eligibilityService"
import { projectTable } from "../../shared/drizzle-schema"
import { getRpcUrlForCluster } from "../../shared/solana/rpcUtils"

type ENV = {
  DB: D1Database
  SOLANA_RPC_URL: string
}
export const onRequestGet: PagesFunction<ENV> = async (ctx) => {
  const db = drizzle(ctx.env.DB, { logger: true })

  try {
    const { searchParams } = new URL(ctx.request.url)
    const address = searchParams.get("address")
    const projectId = searchParams.get("projectId")

    if (!address) return jsonResponse({ message: 'address is missing!' }, 400)
    if (!projectId) return jsonResponse({ message: 'projectId is missing!' }, 400)

    const project = await db
      .select()
      .from(projectTable)
      .where(eq(projectTable.id, projectId))
      .get()
    if (!project) return jsonResponse({ message: 'Project not found!' }, 404)

    const cluster = project.json.config.cluster
    const rpcUrl = getRpcUrlForCluster(ctx.env.SOLANA_RPC_URL, cluster)

    const eligibilityStatus = await EligibilityService.getEligibilityStatus({
      db, address, projectId, rpcUrl,
    })

    const retval = {
      cluster,
      ...eligibilityStatus,
    }

    return jsonResponse(retval, 200)
  } catch (e) {
    await reportError(ctx.env.DB, e)
    return jsonResponse({ message: "Something went wrong..." }, 500)
  }
}
