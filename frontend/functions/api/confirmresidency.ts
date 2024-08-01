import { UserModel, UserModelJson } from "../../shared/models"
import { jsonResponse, reportError } from "./cfPagesFunctionsUtils"

type ENV = {
  DB: D1Database
}
export const onRequestPost: PagesFunction<ENV> = async (ctx) => {
  const db = ctx.env.DB
  try {
    // TODO @authorization - check if the user is really the owner of the address
    const { searchParams } = new URL(ctx.request.url)
    const address = searchParams.get("address")

    if (!isAddressInCorrectFormat(address)) {
      return new Response(
        JSON.stringify({
          message: "Please provide address as query param!",
        }),
        { status: 400 },
      )
    }

    // check if the user is stored in the db
    const existingUser = await db
      .prepare("SELECT * FROM user WHERE address = ?1")
      .bind(address)
      .first<UserModel>()

    console.log({ existingUser })

    if (!existingUser) {
      console.log("User not found in db, inserting...")
      const json: UserModelJson = {
        residency: {
          isNotUsaResident: true,
          isNotUsaResidentConfirmationTimestamp: new Date().toISOString(),
        }
      }
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
      json.residency = {
        isNotUsaResident: true,
        isNotUsaResidentConfirmationTimestamp: new Date().toISOString(),
      }
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

function isAddressInCorrectFormat(address: unknown): boolean {
  return typeof address === "string" && address.length === 44
}
