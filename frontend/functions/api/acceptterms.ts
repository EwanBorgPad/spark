import { AcceptTermsRequestSchema, UserModel, UserModelJson } from "../../shared/models"
import { jsonResponse, reportError } from "./cfPagesFunctionsUtils"
import { PublicKey } from "@solana/web3.js"
import nacl from "tweetnacl"
import { decodeUTF8 } from "tweetnacl-util"

/**
 * Countries that are not allowed to participate.
 * Countries in this list will be denied access.
 * Countries are listed as ISO 3166 A2 country codes (two-letter country codes)
 * List of codes: https://en.wikipedia.org/wiki/List_of_ISO_3166_country_codes
 * TODO currently unused, implement the necessary checks when we specify how?
 */
const COUNTRIES_BLACKLIST: string[] = ['US']


type ENV = {
  DB: D1Database
}
export const onRequestPost: PagesFunction<ENV> = async (ctx) => {
  const db = ctx.env.DB
  try {
    //// validate request
    const requestJson = await ctx.request.json()
    const { error, data } = AcceptTermsRequestSchema.safeParse(requestJson)

    if (error) {
      return jsonResponse(null, 400)
    }

    ///// authorization
    const { publicKey, message, signature } = data
    const address = publicKey

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
    const existingUser = await db
      .prepare("SELECT * FROM user WHERE address = ?1")
      .bind(address)
      .first<UserModel>()

    const countryOfOrigin = ctx.request.cf.country

    console.log({ existingUser })

    const termsOfUse = {
      acceptedAt: new Date(),
      acceptedTextSigned: message,
      countryOfOrigin,
    }

    if (!existingUser) {
      console.log("User not found in db, inserting...")
      const json: UserModelJson = { termsOfUse }
      await db
        .prepare("INSERT INTO user (address, json) VALUES (?1, ?2)")
        .bind(address, JSON.stringify(json))
        .run()
      console.log("User inserted into db.")
    } else {
      console.log("User found in db, updating...")
      const json: UserModelJson = existingUser.json
        ? JSON.parse(existingUser.json)
        : {}
      json.termsOfUse = termsOfUse
      await db
        .prepare("UPDATE user SET json = ?2 WHERE address = ?1")
        .bind(address, JSON.stringify(json))
        .run()
      console.log("User updated")
    }

    return jsonResponse(null, 204)
  } catch (e) {
    await reportError(db, e)
    return jsonResponse({ message: "Something went wrong..." }, 500)
  }
}
