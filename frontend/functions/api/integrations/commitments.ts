import { drizzle } from "drizzle-orm/d1"
import { eq } from "drizzle-orm"

import { jsonResponse, reportError } from "../cfPagesFunctionsUtils"
import { userTable } from "../../../shared/drizzle-schema"
import { isApiKeyValid } from '../../services/apiKeyService'

type ENV = {
  DB: D1Database
}
export const onRequestGet: PagesFunction<ENV> = async (ctx) => {
  const db = drizzle(ctx.env.DB, { logger: true })

  try {
    // authorize request 01 - api key permissions
    if (!await isApiKeyValid({ ctx, permissions: ['commitments'] })) {
      return jsonResponse(null, 401)
    }

    // request parsing
    const { searchParams } = new URL(ctx.request.url)
    const projectId = searchParams.get('projectId')
    const address = searchParams.get('address')
    const apiKey = ctx.request.headers.get('authorization') ?? ''

    // request validation
    if (!projectId || !address) {
      return jsonResponse({ message: 'Bad request! Please provide projectId and address as query params!' }, 400)
    }

    // authorize request 02 - resource access
    // if projectId is present in api key, resource access is granted
    const normalizedProjectId = projectId.replaceAll('-', '_')
    const isResourceAccessGranted = apiKey.startsWith('sk_' + normalizedProjectId + '_')
    if (!isResourceAccessGranted) {
      console.error('Unauthorized! Resource access denied!')
      return jsonResponse(null, 401)
    }

    const user = await db
      .select()
      .from(userTable)
      .where(eq(userTable.address, address))
      .get()

    const investmentIntentData = user?.json.investmentIntent?.[projectId]
    const isCommitted = Boolean(investmentIntentData)

    const retval = {
      isCommitted,
      amount: investmentIntentData ? investmentIntentData.amount : null,
    }

    return jsonResponse(retval, 200)
  } catch (e) {
    await reportError(ctx.env.DB, e)
    return jsonResponse({ message: "Something went wrong..." }, 500)
  }
}
