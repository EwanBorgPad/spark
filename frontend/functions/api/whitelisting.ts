import { getSplTokenBalance } from "../../shared/SolanaWeb3"
import { USDC_DEV_ADDRESS } from "../../shared/constants"

interface Env {}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { searchParams } = new URL(context.request.url)
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

    console.log({ balance })

    return new Response(
      JSON.stringify({
        balance,
      }),
    )
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
