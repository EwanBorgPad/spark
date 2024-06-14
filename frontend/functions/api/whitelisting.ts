import { getSplTokenBalance } from "../../shared/SolanaWeb3"
import { USDC_DEV_ADDRESS } from "../../shared/constants"


interface Env {}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const method = context.request.method
  const url = context.request.url

  const { searchParams } = new URL(context.request.url)
  const address = searchParams.get('address')

  if (!address) {
    // TODO error
    return new Response(JSON.stringify({
      message: 'Please provide address as query param!'
    }), {
      status: 400,
    })
  }

  const balance = await getSplTokenBalance({ address, tokenAddress: USDC_DEV_ADDRESS })

  console.log({ url, method, balance })

  return new Response(JSON.stringify({
    balance
  }))
}
