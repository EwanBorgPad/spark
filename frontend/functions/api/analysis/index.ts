import { AnalystService } from "../../services/analystService"
import { jsonResponse, reportError } from "../cfPagesFunctionsUtils"
import { AnalysisSortBy, AnalysisSortDirection, postNewAnalysisSchema } from "../../../shared/schemas/analysis-schema"
import jwt from "@tsndr/cloudflare-worker-jwt"

type ENV = {
  DB: D1Database
  VITE_ENVIRONMENT_TYPE: string
  TWEET_SCOUT_API_KEY: string
  JWT_SECRET: string
}

type JwtPayloadType = {
  sub: string,
  name: string,
  exp: number
}

/**
 * Post request handler - submits a new analysis
 * @param ctx
 */
export const onRequestPost: PagesFunction<ENV> = async (ctx) => {
  const db = ctx.env.DB
  try {

    ///////////////////////////
    //// validate request /////
    ///////////////////////////

    const requestJson = await ctx.request.json()
    const { error, data } = postNewAnalysisSchema.safeParse(requestJson)
    if (error) return jsonResponse(null, 400)

    /////////////////////////////////////
    /////// jwt token validation ////////
    /////////////////////////////////////

    const jwtToken = ctx.request.headers.get("Authorization")
    if (!jwtToken) return jsonResponse({message: "Unauthorized!"},401)
    const verifiedToken = await jwt.verify(jwtToken, ctx.env.JWT_SECRET)

    // Abort if token isn't valid
    if (!verifiedToken) return jsonResponse({ message: "Unauthorized!" },401)

    // Access token payload
    const { payload } = verifiedToken as { payload: JwtPayloadType }
    if (payload.sub !== data.analystId) return jsonResponse({ message: "Unauthorized!" },401)
      
    ///////////////////////////
    //// validate analyst /////
    ///////////////////////////

    const existingAnalyst = await AnalystService.findAnalystByTwitterAccount({ db, twitterId: data.twitterId })
    console.log("existingAnalyst: ", existingAnalyst.id)

    if (!existingAnalyst) {
      console.log("Analyst not found in db!")
      return jsonResponse({ message: "Analyst not found" }, 404)
    }
    console.log(`Found an existing Analyst with an id - ${existingAnalyst.id}`);


    /////////////////////////////
    //////// happy flow /////////
    /////////////////////////////

    const tweetMetrics = await AnalystService.fetchTweetMetrics({ ctx, articleUrl: data.articleUrl })
    console.log("🚀 ~ tweetMetrics:", tweetMetrics)

    await AnalystService.postNewAnalysis({
        db, analysis: {...data, ...tweetMetrics}
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
    const isApproved = searchParams.get("isApproved")
    const sortBy = searchParams.get("sortBy") as AnalysisSortBy
    const sortDirection = searchParams.get("sortDirection") as AnalysisSortDirection

    const analysisList = await AnalystService.getListOfAnalysis({ db, projectId: projectId, isApproved, sortDirection, sortBy })
    console.log("number of found analyses: ", analysisList.length);

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

