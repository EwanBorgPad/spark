import { hasAdminAccess, jsonResponse, reportError } from "./cfPagesFunctionsUtils";
import { z } from "zod";
import { SnapshotService } from "../services/snapshotService";
import { drizzle } from "drizzle-orm/d1";
import { EligibilityService } from "../services/eligibilityService";
import { projectTable } from "../../shared/drizzle-schema";
import { eq, sql } from "drizzle-orm";
import { getRpcUrlForCluster } from "../../shared/solana/rpcUtils";
const requestSchema = z.object({
    projectId: z.string().min(2),
    limit: z.number().int().min(0).max(999),
    offset: z.number().int().min(0).max(9999).default(0)
});
export const onRequestPost = async (ctx) => {
    const db = drizzle(ctx.env.DB, { logger: true });
    try {
        // authorize request
        if (!hasAdminAccess(ctx)) {
            return jsonResponse(null, 401);
        }
        // parse request
        const requestJson = await ctx.request.json();
        const { error, data } = requestSchema.safeParse(requestJson);
        // validate request
        if (error || !data) {
            return jsonResponse({ message: "Invalid request!", error }, 400);
        }
        const { projectId, limit, offset } = data;
        const project = await db
            .select()
            .from(projectTable)
            .where(eq(projectTable.id, projectId))
            .get();
        if (!project)
            return jsonResponse({ message: 'Project not found!' }, 404);
        const rpcUrl = getRpcUrlForCluster(ctx.env.SOLANA_RPC_URL, project.json.config.cluster);
        // load addresses
        const addressesQueryResult = (await db
            .run(sql `SELECT address FROM user WHERE address NOT IN (SELECT address FROM eligibility_status_snapshot WHERE project_id = ${projectId})`)).results;
        const addresses = addressesQueryResult.map(obj => obj.address);
        const paginatedAddresses = addresses.slice(offset, limit);
        for (const address of paginatedAddresses) {
            const eligibilityStatus = await EligibilityService.getEligibilityStatus({ db, address, projectId, rpcUrl });
            await SnapshotService.createSnapshot({ db, address, projectId, eligibilityStatus });
        }
        return jsonResponse({
            message: "Ok",
            doneCount: paginatedAddresses.length,
            todoCount: addresses.length - paginatedAddresses.length,
        }, 200);
    }
    catch (e) {
        const db = ctx.env.DB;
        await reportError(db, e);
        return jsonResponse({ message: "Something went wrong..." }, 500);
    }
};
