import { z } from "zod"
import { jsonResponse, reportError } from "./cfPagesFunctionsUtils"

const allowedMethods = [
  "getAccountInfo",
  "getTokenAccountsByOwner",
  "getLatestBlockhash",
  "getMinimumBalanceForRentExemption",
] as const

const RpcSchema = z.object({
  id: z.string(),
  jsonrpc: z.string(),
  method: z.string(),
  params: z.unknown(),
})

type ENV = {
  DB: D1Database
  SOLANA_RPC_URL: string
}
export const onRequestPost: PagesFunction<ENV> = async (ctx) => {
  const db = ctx.env.DB
  const solanaRpcUrl = ctx.env.SOLANA_RPC_URL
  try {
    //// validate request
    const requestJson = await ctx.request.json()
    const { error, data } = RpcSchema.safeParse(requestJson)

    if (error) {
      return jsonResponse(null, 400)
    }

    const rpcMethod = data?.method || ''

    if (!allowedMethods.includes(rpcMethod)) {
      return jsonResponse({ message: `Method not allowed (${rpcMethod})!` }, 403)
    }

    //// happy flow
    const request = new Request(solanaRpcUrl, {
      method: 'post',
      body: JSON.stringify(data),
    })

    const response = await fetch(request)
    const responseJson = await response.json()

    return jsonResponse(responseJson, response.status)
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
    return jsonResponse({message: error}, 500)
  }
}
