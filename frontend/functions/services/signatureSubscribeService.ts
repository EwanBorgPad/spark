import { Connection } from "@solana/web3.js"
import { Commitment } from "../../shared/SolanaWeb3"

type SignatureSubscribeResult = {
  status: 'ok'
  txId: string

  confirmationStatus?: Commitment
  err?: {} | null

  confirmations: number | null
  slot: number
} | {
  status: 'error'
  txId: string

  errorCode: 'SIGNATURE_STATUS_TIMEOUT'
}

/**
 * getSignatureStatuses API https://solana.com/docs/rpc/http/getsignaturestatuses
 * Configuring state commitment https://solana.com/docs/rpc#configuring-state-commitment
 * @param connection
 * @param txId
 */
export async function signatureSubscribe(connection: Connection, txId: string): Promise<SignatureSubscribeResult> {
  const delayTime = 3_000    //   3 seconds
  // after 3 minutes we dismiss the transaction and return error
  const delayLimit = 180_000 // 180 seconds = 3 minutes

  let delayCounter = 0

  while (true) {
    console.log('Fetching signature status...')
    const res = await connection.getSignatureStatuses([txId])

    const signatureStatus = res.value[0]

    // got response
    if (signatureStatus && (
      signatureStatus.err
      || signatureStatus.confirmationStatus === 'confirmed'
      || signatureStatus.confirmationStatus === 'finalized')) {

      console.log('Fetching signature status done.')
      return { status: 'ok', txId, ...signatureStatus }
    }

    // didn't get response
    await delay(delayTime)
    delayCounter += delayTime
    if (delayCounter > delayLimit) {
      console.log('Fetching signature status timed out.')
      return { status: 'error', txId, errorCode: 'SIGNATURE_STATUS_TIMEOUT' }
    }
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
