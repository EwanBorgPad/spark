import { getSplTokenBalance } from "../../shared/SolanaWeb3"
import { USDC_DEV_ADDRESS } from "../../shared/constants"
import {
  GetWhitelistingResult,
  UserModel,
  UserModelJson,
} from "../../shared/models"

type ENV = {
  DB: D1Database
}
export const onRequestGet: PagesFunction<ENV> = async (ctx) => {
  try {
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

    const balance = await getSplTokenBalance({
      address,
      tokenAddress: USDC_DEV_ADDRESS,
    })

    const user: UserModel = await ctx.env.DB.prepare(
      "SELECT * FROM user WHERE address = ?1",
    )
      .bind(address)
      .first<UserModel>()
    const userJson: UserModelJson = user?.json ? JSON.parse(user.json) : {}

    const result: GetWhitelistingResult = {
      balance,
      isFollowingOnX: userJson.twitter.isFollowingOnX || false,
      isNotUsaResident: userJson.residency.isNotUsaResident || false,
    }

    return new Response(JSON.stringify(result))
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
