import { getRpcUrlForCluster } from "../../shared/solana/rpcUtils"
import { DepositService } from "../services/depositService"
import { ProjectService } from "../services/projectService"
import { jsonResponse } from "./cfPagesFunctionsUtils"

type ENV = {
    DB: D1Database
    SOLANA_RPC_URL: string
}
export const onRequestGet: PagesFunction<ENV> = async (ctx) => {
    const db = ctx.env.DB

    try {
        const { searchParams } = new URL(ctx.request.url)
        const address = searchParams.get("address")
        const projectId = searchParams.get("projectId")

        if (!address) return jsonResponse({ message: 'address is missing!' }, 400)
        if (!projectId) return jsonResponse({ message: 'projectId is missing!' }, 400)

        const project = await ProjectService.findProjectByIdOrFail({
            db,
            id: projectId
        })

        if (!project)
            return jsonResponse({ message: `Project not found (id=${projectId})!` }, 404)

        // TODO @clusterSeparation(dev/test/main)
        const cluster = project.cluster ?? 'devnet'

        const rpcUrl = getRpcUrlForCluster(ctx.env.SOLANA_RPC_URL, cluster)

        const depositStatus = await DepositService.getDepositStatus({
            db, walletAddress: address, projectId, rpcUrl,
        })

        return jsonResponse(depositStatus, 200)
    } catch (e) {
        await reportError(ctx.env.DB)
        return jsonResponse({ message: "Something went wrong..." }, 500)
    }
}