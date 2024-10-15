import { AnchorProvider, BN, Idl, Program } from "@coral-xyz/anchor"
import {
  Commitment,
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
} from "@solana/web3.js"
import { COMMITMENT_LEVEL, SOLANA_RPC_URL } from "./constants"

import idl from './program/borgpad.json'
import { Borgpad as BorgpadIdl } from "./program/borgpad"

//// browser code
import { Buffer } from "buffer"
globalThis.Buffer = Buffer

type address = string

type InitializeLbpInput = {
  args: InitializeLpbArgs
  adminSecretKey: number[]
}
type InitializeLpbArgs = {
  uid: number
  projectOwner: address
  projectTokenMint: address
  projectTokenLpDistribution: number // Example percentage
  projectMaxCap: number
  userTokenMint: address
  userMinCap: number
  userMaxCap: number
  fundCollectionPhaseStartTime: Date
  fundCollectionPhaseEndTime: Date
  lpLockedPhaseLockingTime: Date
  lpLockedPhaseVestingTime: Date
  bump: number
}
type InitializeLpbResult = {
  transactionId: string
}
export const initializeLpb = async ({ args, adminSecretKey }: InitializeLbpInput): Promise<InitializeLpbResult> => {
  const connection = new Connection(SOLANA_RPC_URL, COMMITMENT_LEVEL)

  const adminKeypair = Keypair.fromSecretKey(new Uint8Array(adminSecretKey))

  const provider = new AnchorProvider(connection, adminKeypair, {
    commitment: COMMITMENT_LEVEL,
    preflightCommitment: COMMITMENT_LEVEL,
  })

  const program = new Program(idl as Idl, provider) as Program<BorgpadIdl>

  const usdcTokenAddress = 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr'

  // Send the transaction
  const tx = await program.methods
    .initializeLbp({
      uid: new BN(args.uid),
      project: new PublicKey(args.projectOwner),

      cliffDuration: new BN(1734184258),
      vestingDuration: new BN(1734184258 + 100_000),

      launchedTokenMint: new PublicKey(usdcTokenAddress),
      launchedTokenCap: new BN(100_000),
      launchedTokenLpDistribution: 80,

      raisedTokenMint: new PublicKey(usdcTokenAddress),
      raisedTokenMaxCap: new BN(100_000),
    })
    .accounts({
      adminAuthority: adminKeypair.publicKey,
      tokenProgram: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',

      raisedTokenMint: new PublicKey(usdcTokenAddress),
      launchedTokenMint: new PublicKey(usdcTokenAddress),
    })
    .transaction()

  // @deprecated - migrate to versioned transactions
  const txId = await connection.sendTransaction(tx, [adminKeypair],{
    //// transaction options
    // skipPreflight: true,
    // preflightCommitment: COMMITMENT_LEVEL,
  })

  console.log('Signature status subscribing...')
  const status = await signatureSubscribe(connection, txId)
  console.log(`Signature status finished: ${status}.`)

  const explorerLink = `https://explorer.solana.com/tx/${txId}?cluster=devnet`
  console.log(explorerLink)

  return {
    transactionId: txId,
  }
}

/**
 * Currently doesn't work in Cloudflare Worker environment for some reason, so I've created a similar function using polling.
 * @param connection
 * @param txId
 */
// function signatureSubscribe(connection: Connection, txId: string): Promise<Commitment> {
//   return new Promise((resolve, reject) => {
//     // Timeout promise
//     // setTimeout(() => {
//     //   reject(new Error("Signature subscription timed out"));
//     // }, 30_000);
//
//     // signature promise
//     connection.onSignature(txId, result => {
//       const err = result.err
//       if (err) reject(err)
//       else resolve(COMMITMENT_LEVEL)
//     }, COMMITMENT_LEVEL)
//   })
// }

async function signatureSubscribe(connection: Connection, txId: string): Promise<Commitment> {
  const delayTime = 3_000
  const delayLimit = 20_000

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
      throw new Error('getSignatureStatuses polling timed out!')
    }
  }

  console.log('Fetching signature status done.')
  return status
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
