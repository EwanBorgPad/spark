import { AnalystService } from "../../services/analystService"
import { jsonResponse, reportError } from "../cfPagesFunctionsUtils"
import { postNewAnalysisSchema } from "../../../shared/schemas/analysis-schema"

import { z } from 'zod'


type ENV = {
  DB: D1Database
  VITE_ENVIRONMENT_TYPE: string
}

/**
 * Post request handler - submits a new analysis'
 * @param ctx
 */
export const onRequestPost: PagesFunction<ENV> = async (ctx) => {
  const db = ctx.env.DB
  try {
    //// validate request
    const requestJson = await ctx.request.json()
    const { error, data } = postNewAnalysisSchema.safeParse(requestJson)

    if (error) {
      return jsonResponse(null, 400)
    }

    /////////////////////////////////////
    // TODO - add jwt token validation //
    /////////////////////////////////////

    const existingAnalyst = await AnalystService.findAnalystByTwitterAccount({ db, twitterId: data.twitterId })
    console.log({ existingAnalyst })

    if (!existingAnalyst) {
      console.log("Analyst not found in db, inserting...")
      return jsonResponse({ message: "Analyst not found" }, 404)
    }
    console.log(`Found an existing Analyst with an id - ${existingAnalyst.id}`);

    await AnalystService.postNewAnalysis({
        db, analysis: data
    })

    return jsonResponse({
        message: "New Analysis Submitted successfully!",
    }, 201)
  } catch (e) {
    await reportError(db, e)
    return jsonResponse({ message: "Something went wrong..." }, 500)
  }
}

/**
 * Get request handler - returns a list of analysis'
 * @param ctx
 */
export const onRequestGet: PagesFunction<ENV> = async (ctx) => {
  const db = ctx.env.DB
  try {
    const { searchParams } = new URL(ctx.request.url)
    const projectId = searchParams.get("projectId")

    if (!projectId) {
      return jsonResponse("projectId missing!", 400)
    }

    const analysisList = await AnalystService.getListOfAnalysisByProjectId({ db, projectId: projectId })
    console.log(analysisList);

    const sumImpressions = analysisList.reduce((accumulator, currentValue) => accumulator + currentValue.analysis.impressions, 0)
    
    const sumLikes = analysisList.reduce((accumulator, currentValue) => accumulator + currentValue.analysis.likes, 0)
    const analystCount = new Set(analysisList.map(item => item.analyst.id)).size;

    return jsonResponse({ analysisList, sumImpressions, sumLikes, analystCount }, 200)
  } catch (e) {
    await reportError(db, e)
    return jsonResponse({ message: "Something went wrong..." }, 500)
  }
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

