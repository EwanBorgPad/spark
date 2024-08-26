import { AnchorProvider, BN, Idl, Program } from "@coral-xyz/anchor"
import {
  Commitment,
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
} from "@solana/web3.js"
import { COMMITMENT_LEVEL, SOLANA_RPC_URL } from "./constants"
import idl from './idl.json'

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
/**
 * TOOD check if this file should be split in two: one for frontend one for backend
 */
export const initializeLpb = async ({ args, adminSecretKey }: InitializeLbpInput): Promise<InitializeLpbResult> => {
  const connection = new Connection(SOLANA_RPC_URL, COMMITMENT_LEVEL)

  // extract programId from IDL file to avoid adding specific configuration for it
  const programId = idl
    .instructions.find(i => i.name === 'initialize')
    ?.accounts.find(a => a.name === 'program')
    ?.address

  if (!programId)
    throw new Error('Cannot extract programId from IDL!')

  // the lib expects this
  idl.address = programId

  //// Set up your provider - Server Code
  // const provider = AnchorProvider.env();
  // setProvider(provider);

  //// Set up your provider - Browser code Code
  // Initialize the wallet provider (e.g., Phantom wallet)
  // const wallet = window.solana; // For Phantom wallet
  //
  // if (!wallet) {
  //   throw new Error('Wallet not connected');
  // }

  const adminKeypair = Keypair.fromSecretKey(new Uint8Array(adminSecretKey))

  // Create the AnchorProvider
  const provider = new AnchorProvider(connection, adminKeypair, {
    commitment: COMMITMENT_LEVEL,
    preflightCommitment: COMMITMENT_LEVEL,
  })

  // Load the IDL (Interface Description Language) for your program
  // Create the Program instance
  const program = new Program(idl as Idl, provider)

  // Derive PDAs
  const [configPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('config'),
    ],
    program.programId,
  )

  const uid = args.uid

  const [lbpPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('lbp'),
      Buffer.from(new Uint8Array(new BN(uid).toArray('le', 8))),
    ],
    program.programId,
  )

  // Send the transaction
  const tx = await program.methods
    .initializeLbp({
      uid: new BN(args.uid),
      projectOwner: new PublicKey(args.projectOwner),
      projectTokenMint: new PublicKey(args.projectTokenMint),
      projectTokenLpDistribution: new PublicKey(args.projectTokenLpDistribution), // Example percentage
      projectMaxCap: new BN(args.projectMaxCap),
      userTokenMint: new PublicKey(args.userTokenMint),
      userMinCap: new BN(args.userMinCap),
      userMaxCap: new BN(args.userMaxCap),
      fundCollectionPhaseStartTime: new BN(args.fundCollectionPhaseStartTime.getTime() / 1000),
      fundCollectionPhaseEndTime: new BN(args.fundCollectionPhaseEndTime.getTime() / 1000),
      lpLockedPhaseLockingTime: new BN(args.lpLockedPhaseLockingTime.getTime() / 1000),
      lpLockedPhaseVestingTime: new BN(args.lpLockedPhaseVestingTime.getTime() / 1000),
      bump: 1,
    })
    .accounts({
      config: configPda,
      lbp: lbpPda,
      admin: adminKeypair.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .signers([adminKeypair])
    .transaction()

  tx.feePayer = adminKeypair.publicKey

  const txId = await connection.sendTransaction(tx, [adminKeypair], {
    //// transaction options
    // skipPreflight: true,
    // preflightCommitment: COMMITMENT_LEVEL
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
//     // }, 60_000);
//
//     // signature promise
//     connection.onSignature(txId, result => {
//       console.log('testttttttt')
//       console.log('testttttttt')
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
    if (res?.value[0] && res.value[0]?.confirmationStatus) {
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
