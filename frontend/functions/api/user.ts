import { CreateUsernameRequestSchema } from "../../shared/models";
import { jsonResponse, reportError } from "./cfPagesFunctionsUtils";

type ENV = {
  DB: D1Database
  VITE_ENVIRONMENT_TYPE: string
}

export const onRequestOptions: PagesFunction<ENV> = async (ctx) => {
  try {
    if (ctx.env.VITE_ENVIRONMENT_TYPE !== "develop") return
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': 'http://localhost:5173', // Adjusted this for frontend origin
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (error) {
    return jsonResponse({ message: error }, 500)
  }
}



export const onRequestPost: PagesFunction<ENV> = async (ctx) => {
  const db = ctx.env.DB
  try {
    const requestJson = await ctx.request.json()
    const { error, data } = CreateUsernameRequestSchema.safeParse(requestJson)

    if (error) {
      return jsonResponse(null, 400)
    }

    ///// authorization
    const { publicKey, email, username } = data

    // const existingUser = await db
    //   .prepare("SELECT * FROM user WHERE address = ?")
    //   .bind(publicKey)
    //   .run()

    // console.log({ existingUser })

    const existingUser = false

    if (!existingUser) {
      console.log("User not found in db, inserting...")
      await db
        .prepare("INSERT INTO user (address, email, username) VALUES (?1, ?2, ?3)")
        .bind(publicKey, email, username)
        .run()
      console.log("User inserted into db.")
    } else {
      console.log("User found in db, updating...")

      await db
        .prepare("UPDATE user SET email = ?2, username = ?3 WHERE address = ?1")
        .bind(publicKey, email, username)
        .run()
      console.log("User updated")
    }

    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "http://localhost:5173",
        "Access-Control-Allow-Methods": "OPTIONS, GET, POST, PUT",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });
  } catch (e) {
    await reportError(db, e)
    return jsonResponse({ message: "Something went wrong..." }, 500)
  }
}