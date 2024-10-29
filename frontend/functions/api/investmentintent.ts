import { InvestmentIntentRequestSchema, UserModelJson } from "../../shared/models"
import { jsonResponse, reportError } from "./cfPagesFunctionsUtils"
import { PublicKey } from "@solana/web3.js"
import nacl from "tweetnacl"
import { decodeUTF8 } from "tweetnacl-util"
import { UserService } from "../services/userService"


type ENV = {
  DB: D1Database
}
export const onRequestPost: PagesFunction<ENV> = async (ctx) => {
  const db = ctx.env.DB
  try {
    //// validate request
    const requestJson = await ctx.request.json()
    const { error, data } = InvestmentIntentRequestSchema.safeParse(requestJson)

    if (error) {
      return jsonResponse(null, 400)
    }

    ///// authorization
    const { publicKey, projectId, amount, message, signature } = data

    const isVerified = nacl.sign.detached.verify(
      decodeUTF8(message),
      new Uint8Array(signature),
      new PublicKey(publicKey).toBytes(),
    );
    if (!isVerified) {
      return jsonResponse(null, 401)
    }

    //// business logic
    // check if the user is stored in the db
    const existingUser = await UserService.findUserByAddress({ db, address: publicKey })

    console.log({ existingUser })

    const investmentIntent = { amount, message, signature }

    if (!existingUser) {
      console.log("User not found in db, inserting...")
      const json: UserModelJson = {
        investmentIntent: {
          [projectId]: investmentIntent,
        }
      }
      await db
        .prepare("INSERT INTO user (address, json) VALUES (?1, ?2)")
        .bind(publicKey, JSON.stringify(json))
        .run()
      console.log("User inserted into db.")
    } else {
      console.log("User found in db, updating...")

      const json: UserModelJson = existingUser.json ?? {}
      if (!json.investmentIntent) json.investmentIntent = {}
      json.investmentIntent[projectId] = investmentIntent

      await db
        .prepare("UPDATE user SET json = ?2 WHERE address = ?1")
        .bind(publicKey, JSON.stringify(json))
        .run()
      console.log("User updated")
    }

    return jsonResponse(null, 204)
  } catch (e) {
    await reportError(db, e)
    return jsonResponse({ message: "Something went wrong..." }, 500)
  }
}
