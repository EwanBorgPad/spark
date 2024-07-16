import { UserModel, UserModelJson } from "../../shared/models"

type ENV = {
  DB: D1Database
}
export const onRequestPost: PagesFunction<ENV> = async (ctx) => {
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
    const existingUser = await ctx.env.DB.prepare(
      "SELECT * FROM user WHERE wallet_address = ?1",
    )
      .bind(address)
      .first<UserModel>()

    console.log({ existingUser })

    if (!existingUser) {
      console.log("User not found in db, inserting...")
      const json: UserModelJson = {
        isNotUsaResident: true,
        isNotUsaResidentConfirmationTimestamp: (new Date()).toISOString(),
      }
      await ctx.env.DB.prepare(
        "INSERT INTO user (wallet_address, json) VALUES (?1, ?2)",
      )
        .bind(address, JSON.stringify(json))
        .run()
      console.log("User inserted into db.")
    } else {
      console.log("User found in db, updating...")
      const json: UserModelJson = existingUser.json ? JSON.parse(existingUser.json) : {}
      json.isNotUsaResident = true
      json.isNotUsaResidentConfirmationTimestamp = (new Date()).toISOString()
      await ctx.env.DB.prepare(
        "UPDATE user SET json = ?2 WHERE wallet_address = ?1",
      )
        .bind(address, JSON.stringify(json))
        .run()
      console.log("User updated")
    }

    return new Response(null, { status: 204 })
  } catch (e) {
    console.error(e)
    return new Response(
      JSON.stringify({
        message: "Something went wrong...",
      }),
      { status: 500 },
    )
  }
}

function isAddressInCorrectFormat(address: unknown): boolean {
  return typeof address === "string" && address.length === 44
}
