import { z } from 'zod'
import { projectTable } from '../../../shared/drizzle-schema'
import { jsonResponse, reportError } from "../cfPagesFunctionsUtils"
import { drizzle } from "drizzle-orm/d1"
import { eq } from "drizzle-orm"

const requestSchema = z.object({
    projectId: z.string(),
    info: z.object({
      claimUrl: z.string(),
      tweetUrl: z.string(),
      tokenContractUrl: z.string(),
      poolContractUrl: z.string(),
    }),
})

type ENV = {
  DB: D1Database
}
export const onRequestPost: PagesFunction<ENV> = async (ctx) => {
  const db = drizzle(ctx.env.DB, { logger: true })
  try {
    // parse request
    const requestJson = await ctx.request.json()
    const { error, data } = requestSchema.safeParse(requestJson)

    // validate request
    if (error || !data) {
        return jsonResponse({ message: "Invalid request!", error }, 400)
    }

    // TODO authorization

    const { projectId } = data

    const {
      claimUrl,
      tweetUrl,
      tokenContractUrl,
      poolContractUrl
    } = data.info

    const project = await db
        .select()
        .from(projectTable)
        .where(eq(projectTable.id, projectId))
        .get()
    if (!project) return jsonResponse({ message: 'Project not found!' }, 404)

    project.json.info.claimUrl = claimUrl
    project.json.info.tweetUrl = tweetUrl
    project.json.info.tokenContractUrl = tokenContractUrl
    project.json.info.poolContractUrl = poolContractUrl

    await db.update(projectTable)
        .set({ json: project.json })
        .where(eq(projectTable.id, project.id))

    return jsonResponse({ message: "Ok!" }, 200)
  } catch (e) {
    await reportError(ctx.env.DB, e)
    return jsonResponse({ message: "Something went wrong..." }, 500)
  }
}
