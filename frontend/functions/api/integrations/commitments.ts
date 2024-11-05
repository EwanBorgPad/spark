import { drizzle } from "drizzle-orm/d1"
import { DrizzleD1Database } from "drizzle-orm/d1/driver"
import { eq } from "drizzle-orm"

import { jsonResponse } from "../cfPagesFunctionsUtils"
import { userTable } from "../../../shared/drizzle-schema"

type ENV = {
  DB: DrizzleD1Database
  INTEGRATIONS_API_KEY: string
}
export const onRequestGet: PagesFunction<ENV> = async (ctx) => {
  const db = drizzle(ctx.env.DB, { logger: true })

  try {
    // env loading/validation
    const integrationsApiKey = ctx.env.INTEGRATIONS_API_KEY
    if (!integrationsApiKey) {
      throw new Error('INTEGRATIONS_API_KEY is missing!')
    }

    // request parsing
    const { searchParams } = new URL(ctx.request.url)
    const projectId = searchParams.get('projectId')
    const address = searchParams.get('address')
    const apiKey = searchParams.get('apiKey')

    // request validation
    if (!projectId || !address || !apiKey) {
      return jsonResponse({ message: 'Bad request! Please provide projectId, address, and apiKey!' }, 400)
    }

    // authorization
    if (!apiKey || !integrationsApiKey || apiKey !== integrationsApiKey) {
      return jsonResponse({ message: 'Unauthorized!' }, 401)
    }

    const user = await db
      .select()
      .from(userTable)
      .where(eq(userTable.address, address))
      .get()

    const isCommitted = Boolean(user?.json.investmentIntent[projectId])

    const retval = {
      isCommitted,
    }

    return jsonResponse(retval, 200)
  } catch (e) {
    console.error(e)
    return jsonResponse({ message: "Something went wrong..." }, 500)
  }
}
