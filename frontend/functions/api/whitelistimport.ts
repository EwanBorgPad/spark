import { hasAdminAccess, jsonResponse, reportError } from "./cfPagesFunctionsUtils"
import { SolanaAddressSchema } from "../../shared/models"
import { z } from "zod"

const requestSchema = z.object({
  rows: z.array(z.object({
    projectId: z.string().min(2),
    address: SolanaAddressSchema,
    tierId: z.string(),
  }))
})

type ENV = {
  DB: D1Database
  ADMIN_API_KEY_HASH: string
}
export const onRequestPost: PagesFunction<ENV> = async (ctx) => {
  const db = ctx.env.DB

  try {
    // authorize request
    if (!hasAdminAccess(ctx)) {
      return jsonResponse(null, 401)
    }

    // parse request
    const requestJson = await ctx.request.json()
    const { error, data } = requestSchema.safeParse(requestJson)

    // validate request
    if (error) {
      return jsonResponse({ message: "Invalid request!", error }, 400)
    }

    ////////////////////////////////////////
    //// TODO Improvement: Validations /////
    //// Check if projects/tiers exist /////
    ////////////////////////////////////////

    // bulk insert
    const placeholders = []
    const values = []
    let index = 1
    for (const user of data.rows) {
      placeholders.push(`($${index}, $${index + 1}, $${index + 2})`)
      values.push(user.address, user.projectId, user.tierId)
      index += 3
    }

    const query = `
        REPLACE INTO whitelist (address, project_id, tier_id)
        VALUES ${placeholders.join(', ')};
    `;

    await db.prepare(query).bind(...values).run()

    return jsonResponse({ message: "Created!" }, 201)
  } catch (e) {
    const db = ctx.env.DB
    await reportError(db, e)
    return jsonResponse({ message: "Something went wrong..." }, 500)
  }
}
