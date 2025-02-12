import { z } from 'zod'
import { projectTable } from '../../../shared/drizzle-schema'
import { jsonResponse, reportError } from "../cfPagesFunctionsUtils"
import { drizzle } from "drizzle-orm/d1"
import { eq } from "drizzle-orm"
import nacl from 'tweetnacl'
import { decodeUTF8 } from 'tweetnacl-util'
import { PublicKey } from '@solana/web3.js'

const requestSchema = z.object({
    projectId: z.string(),
    info: z.object({
      claimUrl: z.string(),
      tweetUrl: z.string(),
      tokenContractUrl: z.string(),
      poolContractUrl: z.string(),
    }),
    auth: z.object({
      address: z.string(),
      message: z.string(),
      signature: z.array(z.number().int()),
    })
})

type ENV = {
  DB: D1Database
  ADMIN_ADDRESSES: string
}
export const onRequestPost: PagesFunction<ENV> = async (ctx) => {
  const db = drizzle(ctx.env.DB, { logger: true })
  try {
    // validate env
    const { ADMIN_ADDRESSES } = ctx.env
    if (!ADMIN_ADDRESSES) throw new Error('Misconfigured env! ADMIN_ADDRESSES is missing')
    const adminAddresses = ADMIN_ADDRESSES.split(',')

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

    //// auth
    const { address, message, signature } = data.auth

    // auth - confirm signature
    const isVerified = nacl.sign.detached.verify(
      decodeUTF8(message),
      new Uint8Array(signature),
      new PublicKey(address).toBytes(),
    );
    if (!isVerified) {
      await reportError(db, new Error(`Invalid signature (after-sale-update)! publicKey: ${address}, message: ${message}, signature: ${signature}`))
      return jsonResponse(null, 401)
    }

    // auth - confirm address is admin address
    const isAdminConfirmed = adminAddresses.includes(address)
    if (!isAdminConfirmed) {
      await reportError(db, new Error(`Non-admin tried accessing admin functionality! address=(${address})`))
      return jsonResponse(null, 401)
    }

    // happy flow
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
