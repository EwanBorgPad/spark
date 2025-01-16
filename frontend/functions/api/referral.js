import { z } from "zod";
import nacl from "tweetnacl";
import { decodeUTF8 } from "tweetnacl-util";
import { PublicKey } from "@solana/web3.js";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { jsonResponse, reportError } from "./cfPagesFunctionsUtils";
import { userTable } from "../../shared/drizzle-schema";
const RequestSchema = z.object({
    referrerTwitterHandle: z.string().startsWith('@'),
    projectId: z.string(),
    publicKey: z.string(),
    message: z.string(),
    signature: z.array(z.number().int()),
});
export const onRequestPost = async (ctx) => {
    const db = drizzle(ctx.env.DB, { logger: true });
    try {
        //// validate request
        const requestJson = await ctx.request.json();
        const { error, data } = RequestSchema.safeParse(requestJson);
        if (error) {
            return jsonResponse(null, 400);
        }
        //// authorization
        const { referrerTwitterHandle, projectId, publicKey, message, signature } = data;
        const isVerified = nacl.sign.detached.verify(decodeUTF8(message), new Uint8Array(signature), new PublicKey(publicKey).toBytes());
        if (!isVerified) {
            return jsonResponse(null, 401);
        }
        //// happy flow
        const referral = {
            referrerTwitterHandle,
            createdAt: new Date().toISOString(),
            message,
            signature,
        };
        const user = await db
            .select()
            .from(userTable)
            .where(eq(userTable.address, publicKey))
            .get();
        if (!user) {
            const json = {
                referral: {
                    [projectId]: referral,
                }
            };
            await db.insert(userTable).values({
                address: publicKey, json,
            });
        }
        else {
            if (!user.json.referral)
                user.json.referral = {};
            user.json.referral[projectId] = referral;
            await db.update(userTable)
                .set(user)
                .where(eq(userTable.address, publicKey));
        }
        return jsonResponse({ message: "Ok!" }, 200);
    }
    catch (e) {
        await reportError(ctx.env.DB, e);
        return jsonResponse({ message: "Something went wrong..." }, 500);
    }
};
