import { eq } from "drizzle-orm"
import { drizzle } from "drizzle-orm/d1"

import { jsonResponse, reportError } from "./cfPagesFunctionsUtils"
import { EligibilityService } from "../services/eligibilityService"
import { projectTable } from "../../shared/drizzle-schema"

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

    if (!project)
      return jsonResponse({ message: `Project not found (id=${projectId})!`}, 404)

    // TODO @clusterSeparation(dev/test/main)
    const cluster = project.json.cluster ?? 'devnet'

    const rpcUrl = getRpcUrlForCluster(ctx.env.SOLANA_RPC_URL, cluster)

    const eligibilityStatus = await EligibilityService.getEligibilityStatus({
      db, address, projectId, rpcUrl,
    })

    const retval = {
      ...eligibilityStatus,
      cluster,
    }

    return jsonResponse(retval, 200)
  } catch (e) {
    await reportError(ctx.env.DB, e)
    return jsonResponse({ message: "Something went wrong..." }, 500)
  }
}

/**
 * Very bad function to fix the day -- adjust the
 * TODO @clusterSeparation(dev/test/main)
 * @param rpcUrl
 * @param cluster
 */
export function getRpcUrlForCluster(rpcUrl: string, cluster: 'mainnet' | 'devnet'): string {
  if (cluster === 'mainnet') {
    return rpcUrl
      .replace('devnet', 'mainnet')
      .replace('testnet', 'mainnet')
  } else if (cluster === 'devnet') {
    return rpcUrl
      .replace('mainnet', 'devnet')
      .replace('testnet', 'devnet')
  } else {
    throw new Error(`Unknown cluster=${cluster}!`)
  }
}
