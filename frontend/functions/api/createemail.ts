import { CreateEmailRequestSchema, UserModelJson } from "../../shared/models";
import { jsonResponse, reportError } from "./cfPagesFunctionsUtils";
import { PublicKey } from "@solana/web3.js";
import nacl from "tweetnacl";
import { decodeUTF8 } from "tweetnacl-util";
import { UserService } from "../services/userService"


type ENV = {
  DB: D1Database
}

// Add this handler for OPTIONS requests
export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "http://localhost:5173",
      "Access-Control-Allow-Methods": "OPTIONS, GET, PUT, POST, DELETE, HEAD",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  })
}

export const onRequestPost: PagesFunction<ENV> = async (ctx) => {
  const db = ctx.env.DB
  try {
    const requestJson = await ctx.request.json()
    const { error, data } = CreateEmailRequestSchema.safeParse(requestJson)

    if (error) {
      return jsonResponse(null, 400)
    }

    ///// authorization
    const { publicKey, email, message, signature } = data

    const isVerified = nacl.sign.detached.verify(
      decodeUTF8(message),
      new Uint8Array(signature),
      new PublicKey(publicKey).toBytes(),
    );
    if (!isVerified) {
      await reportError(db, new Error(`Invalid signature (createemail)! publicKey: ${publicKey}, message: ${message}, signature: ${signature}`))
      return jsonResponse(null, 401)
    }

    /// business logic
    // check if the user is stored in the db
    const existingUser = await UserService.findUserByAddress({ db, address: publicKey })

    console.log({ existingUser })

    const emailData = { email, providedAt: new Date(), acceptedTextSigned: message }

    if (!existingUser) {
      console.log("User not found in db, inserting...")
      const json: UserModelJson = {
        emailData: emailData,
      }
      await db
        .prepare("INSERT INTO user (address, json) VALUES (?1, ?2)")
        .bind(publicKey, JSON.stringify(json))
        .run()
      console.log("User inserted into db.")
    } else {
      console.log("User found in db, updating...")

      const json: UserModelJson = existingUser.json ?? {}
      json.emailData = emailData

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
