import { getSplTokenBalance } from "../../shared/SolanaWeb3"
import { USDC_DEV_ADDRESS } from "../../shared/constants"
import {
  GetWhitelistingResult,
  UserModel,
  UserModelJson,
} from "../../shared/models"
import { jsonResponse } from "./cfPagesFunctionsUtils"

type ENV = {
  DB: D1Database
}
export const onRequestGet: PagesFunction<ENV> = async (ctx) => {
  try {
    const { searchParams } = new URL(ctx.request.url)
    const address = searchParams.get("address")

    if (!isAddressInCorrectFormat(address)) {
      return jsonResponse({
        message: "Please provide address as query param!",
      }, 400)
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
      isFollowingOnX: userJson?.twitter?.isFollowingOnX || false,
      isNotUsaResident: userJson?.residency?.isNotUsaResident || false,
    }

    return jsonResponse(result)
  } catch (e) {
    console.error(e)
    return jsonResponse({
      message: "Something went wrong...",
    }, 500)
  }
}

function isAddressInCorrectFormat(address: unknown): boolean {
  return typeof address === "string" && address.length === 44
}
