import { projectSchema } from "../../../shared/models"
import { jsonResponse, reportError } from "../cfPagesFunctionsUtils"
import { projectTable } from "../../../shared/drizzle-schema"
import { eq, sql } from "drizzle-orm"
import { drizzle } from "drizzle-orm/d1"
import { z } from 'zod'
import nacl from "tweetnacl"
import { decodeUTF8 } from "tweetnacl-util"
import { PublicKey } from "@solana/web3.js"


type ENV = {
  DB: D1Database
  ADMIN_ADDRESSES: string
}

const requestSchema = z.object({
  projectId: z.string(),
  project: projectSchema,
  auth: z.object({
    address: z.string(),
    message: z.string(),
    signature: z.array(z.number().int()),
  })
})

/**
 * Post request handler - updates a project
 * @param ctx
 */
export const onRequestPost: PagesFunction<ENV> = async (ctx) => {
  const db = drizzle(ctx.env.DB, { logger: true })
  try {
    // validate env

    const { ADMIN_ADDRESSES } = ctx.env
    if (!ADMIN_ADDRESSES) throw new Error('Misconfigured env! ADMIN_ADDRESSES is missing')
    const adminAddresses = ADMIN_ADDRESSES.split(',')

    // parse/validate request
    const requestJson = await ctx.request.json()
    const { error, data } = requestSchema.safeParse(requestJson)
    if (error || !data)
      return jsonResponse({ message: "Invalid request!", error }, 400)

    //// auth
    const { address, message, signature } = data.auth

    // auth - confirm signature
    const isVerified = nacl.sign.detached.verify(
      decodeUTF8(message),
      new Uint8Array(signature),
      new PublicKey(address).toBytes(),
    )
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

    //// happy flow
    const project = await db
      .select()
      .from(projectTable)
      .where(eq(projectTable.id, data.projectId))
      .get()
    if (!project) return jsonResponse({ message: 'Project not found!' }, 404)
    const id = data.projectId
    const json = JSON.stringify(data.project)
    await db.run(sql`UPDATE project SET json = ${json} WHERE id = ${id}`)

    return jsonResponse("Updated!", 201)
  } catch (e) {
    await reportError(db, e)
    return jsonResponse({ message: "Something went wrong..." }, 500)
  }
}


export const onRequestOptions: PagesFunction<ENV> = async (ctx) => {
  try {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': 'http://localhost:5173', // Adjust this to frontends origin
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  } catch (error) {
    return jsonResponse({ message: error }, 500)
  }
}

