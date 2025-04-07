import { Analyst } from "../../../shared/drizzle-schema"
import { AnalystSchemaType, manuallyAddNewAnalysis } from "../../../shared/schemas/analysis-schema"
import { AnalystService } from "../../services/analystService"
import { jsonResponse,reportError } from "../cfPagesFunctionsUtils"
import { checkAdminAuthorization, isAdminReturnValue } from "../../services/authService"
import { z } from "zod"



type ENV = {
  DB: D1Database
  VITE_ENVIRONMENT_TYPE: string
  TWEET_SCOUT_API_KEY: string
  ADMIN_ADDRESSES: string
}

type AdminAuthFields = {
  address: string,
  message: string,
  signature: number[]
}

export const onRequestPost: PagesFunction<ENV> = async (ctx) => {
  const db = ctx.env.DB
  try {
    //// validate request
    const requestJson = await ctx.request.json()
    const { error, data } = manuallyAddNewAnalysis.safeParse(requestJson)

    if (error) {
      return jsonResponse(null, 400)
    }
    
    // check if user is admin
    const authResult: isAdminReturnValue = checkAdminAuthorization({ctx, auth: data.auth as AdminAuthFields })
    if (!authResult.isAdmin) {
      const { error: authError } = authResult as { error: { code: number; message: string }, isAdmin: false }
      await reportError(db, new Error(authError.message))
      return jsonResponse({message: "Unauthorized!"}, authError.code)
  }

    /////////////////////////////////////
    // TODO - add jwt token validation //
    /////////////////////////////////////

    const tweetInfo = await AnalystService.fetchTweetInfo({ ctx, articleUrl: data.articleUrl })
    console.log("🚀 ~ tweetInfo:", tweetInfo)
    if (!tweetInfo) {
      return jsonResponse({message: "Failed to fetch articled info from X. Please try again."}, 400)
    }
    const twitterId = tweetInfo.user.id_str
    const existingAnalyst = await AnalystService.findAnalystByTwitterAccount({ db, twitterId })

    let analyst: AnalystSchemaType;

    if (!existingAnalyst) {
      console.log("Analyst not found in db, inserting...")
      const body = {
        id: twitterId,
        name: tweetInfo.user.name,
        username: tweetInfo.user.screen_name,
        profile_image_url: tweetInfo.user.avatar
      }
      analyst = await AnalystService.createNewAnalyst({db, ...body })
      console.log("Analyst inserted into db.")

    } else {
      console.log("Analyst found in db, updating twitter id...")

      analyst = await AnalystService.updateAnalyst({
        db, 
        analyst: existingAnalyst, 
        updates: {
          twitterId,
          twitterName:tweetInfo.user.name,
          twitterAvatar: tweetInfo.user.avatar,
          twitterUsername: tweetInfo.user.screen_name
        }
      })

      console.log("✅ Analyst's twitter id updated, returning updated version of analyst.")
    }

    await AnalystService.postNewAnalysis({
      db, analysis: {
        impressions: tweetInfo.impressions,
        likes: tweetInfo.likes,
        analystId: analyst.id,
        twitterId: analyst.twitterId,
        articleUrl: data.articleUrl,
        projectId: data.projectId,
        analystRole: data.analystRole,
        isApproved: true
      }
    })

    // const existingAnalyst
    return jsonResponse({
        message: "New Analysis Submitted successfully!",
    }, 201)
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

