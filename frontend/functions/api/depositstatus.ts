import { getRpcUrlForCluster } from "../../shared/solana/rpcUtils"
import { DepositService } from "../services/depositService"
import { jsonResponse, reportError } from "./cfPagesFunctionsUtils"
import { projectTable } from "../../shared/drizzle-schema"
import { eq } from "drizzle-orm"
import { drizzle } from "drizzle-orm/d1"

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

        const rpcUrl = getRpcUrlForCluster(ctx.env.SOLANA_RPC_URL, project.json.config.cluster)

        const depositStatus = await DepositService.getDepositStatus({
            db, walletAddress: address, projectId, rpcUrl,
        })

        return jsonResponse(depositStatus, {
            headers: {
                "Cache-Control": "no-cache",
            }
        })
    } catch (e) {
        await reportError(ctx.env.DB, e)
        return jsonResponse({ message: "Something went wrong..." }, 500)
    }
}
