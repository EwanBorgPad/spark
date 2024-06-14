import { getSplTokenBalance } from "../../shared/SolanaWeb3"
import { USDC_DEV_ADDRESS } from "../../shared/constants"


interface Env {}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const method = context.request.method
  const url = context.request.url
  const { address } = context.params

  if (typeof address !== 'string') {
    // TODO error
    return new Response(JSON.stringify({
      message: 'Please provide address as query param!'
    }), {
      status: 400,
    })
  }

  console.log({ contextParams: context.params })

  const balance = await getSplTokenBalance({ address, tokenAddress: USDC_DEV_ADDRESS })

  console.log({ url, method, balance })

  return new Response(JSON.stringify({
    balance
  }))
}
