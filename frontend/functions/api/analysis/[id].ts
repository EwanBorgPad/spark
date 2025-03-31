import {
  jsonResponse,
  reportError,
} from "../cfPagesFunctionsUtils"
import { analysisTable, analystTable } from "../../../shared/drizzle-schema"
import { and, eq } from "drizzle-orm"
import { drizzle } from "drizzle-orm/d1"
import { updateOrRemoveAnalysisSchema, UpdateOrRemoveAnalysisSchemaRequest } from "../../../shared/schemas/analysis-schema"
import { AnalystService } from "../../services/analystService"
import { checkAdminAuthorization, isAdminReturnValue } from "../../services/authService"

type ENV = {
  DB: D1Database
  ADMIN_ADDRESSES: string
  VITE_ENVIRONMENT_TYPE: string
}
/**
 * Get request handler - returns a analysis by id
 * @param ctx
 */
export const onRequestPost: PagesFunction<ENV> = async (ctx) => {
  const db = drizzle(ctx.env.DB, { logger: true })
  try {
    // validate request
    const requestJson = await ctx.request.json()
    const { success, data, error } = updateOrRemoveAnalysisSchema.safeParse(requestJson)
    if (!success) return jsonResponse({ message: "Invalid request!", error }, 400)

    // check if user is admin
    const authResult: isAdminReturnValue = checkAdminAuthorization({ctx, auth: data.auth as AdminAuthFields })
    if (!authResult.isAdmin) {
      const { error: authError } = authResult as { error: { code: number; message: string }, isAdmin: false }
      await reportError(db, new Error(authError.message))
      return jsonResponse(null, authError.code)
    }
    
    // check if analysisId is present
    const url = ctx.request.url
    const analysisId = extractAnalysisId(url)
    if (!analysisId) {
      return jsonResponse({ message: "Please provide id query param" }, 400)
    }

    // check if analysis exists
    const existingAnalysis = await db
      .select()
      .from(analysisTable)
      .where(eq(analysisTable.id, analysisId))
      .get()
    if (!existingAnalysis) return jsonResponse({ message: 'Analysis not found!' }, 404)

    const isAnalysisApproved = data.isApproved

    if (isAnalysisApproved) {
        await AnalystService.approveAnalysis({db, analysisId})
        return jsonResponse(null, 204)
    } else {
        await AnalystService.declineAnalysis({db, analysisId})
        return jsonResponse(null, 204)
    }
  } catch (e) {
    await reportError(db, e)
    return jsonResponse({ message: "Something went wrong..." }, 500)
  }
}

export const extractAnalysisId = (url: string) => {
    const parsedUrl = new URL(url)
    const pathSegments = parsedUrl.pathname.split("/")
  
    const analysisIndex = pathSegments.indexOf("analysis")
    const id = analysisIndex !== -1 ? pathSegments[analysisIndex + 1] : null
  
    return id
}

type AdminAuthFields = {
    address: string,
    message: string,
    signature: number[]
}

export const onRequestOptions: PagesFunction<ENV> = async (ctx) => {
  try {
    if (ctx.env.VITE_ENVIRONMENT_TYPE !== "develop") return
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': 'http://localhost:5173', // Adjusted this for frontend origin
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (error) {
    return jsonResponse({ message: error }, 500)
  }
}

