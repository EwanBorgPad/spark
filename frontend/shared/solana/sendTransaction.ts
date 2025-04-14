import { Transaction, SystemProgram, PublicKey, Connection, TransactionInstruction } from "@solana/web3.js"
import { Buffer } from "buffer"

// Use a public RPC endpoint
const RPC_ENDPOINT = "https://solana-mainnet.g.alchemy.com/v2/demo"

/**
 * Creates and sends a transaction with a memo instruction containing the message
 * @param message The message to include in the transaction
 * @param address The wallet address
 * @param signTransaction Function to sign the transaction
 * @param walletProvider The wallet provider (PHANTOM, BACKPACK, SOLFLARE)
 * @returns The transaction signature
 */
export async function sendTransaction(
  message: string,
  address: string,
  signTransaction: (transaction: Transaction, walletType: "PHANTOM" | "BACKPACK" | "SOLFLARE") => Promise<Transaction | null>,
  walletProvider: "PHANTOM" | "BACKPACK" | "SOLFLARE"
): Promise<Uint8Array> {
  const connection = new Connection(RPC_ENDPOINT)
  const recentBlockhash = await connection.getLatestBlockhash()

  const transaction = new Transaction()

  // Add a zero-lamport transfer to the same address (required for some wallets)
  transaction.add(
    SystemProgram.transfer({
      fromPubkey: new PublicKey(address),
      toPubkey: new PublicKey(address),
      lamports: 0,
    })
  )

  // Add the message as a memo instruction
  transaction.add(
    new TransactionInstruction({
      keys: [],
      programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
      data: Buffer.from(message),
    })
  )

  transaction.recentBlockhash = recentBlockhash.blockhash
  transaction.feePayer = new PublicKey(address)

  // Sign the transaction
  const signedTx = await signTransaction(transaction, walletProvider)
  if (!signedTx) throw new Error("Failed to sign transaction")

  // Send the transaction
  const txId = await connection.sendRawTransaction(signedTx.serialize(), {
    skipPreflight: false,
    preflightCommitment: "confirmed",
  })

  // Return the signature
  return signedTx.signatures[0].signature!
}
