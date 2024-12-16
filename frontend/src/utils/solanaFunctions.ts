import { Connection } from "@solana/web3.js"
import { Commitment } from "shared/SolanaWeb3"


export async function signatureSubscribe(connection: Connection, txId: string): Promise<Commitment> {
  const delayTime = 3_000
  const delayLimit = 60_000

  let status = null
  let delayCounter = 0

  while (!status) {
    console.log('Fetching signature status...')
    const res = await connection.getSignatureStatuses([txId])

    // got response
    if (res.value[0]?.confirmationStatus) {
      status = res.value[0].confirmationStatus
      break
    }

    // didn't get response
    await delay(delayTime)
    delayCounter += 3000
    if (delayCounter > delayLimit) {
      throw new Error(`getSignatureStatuses polling timed out! txId=${txId}`)
    }
  }

  console.log('Fetching signature status done.')
  return status
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
