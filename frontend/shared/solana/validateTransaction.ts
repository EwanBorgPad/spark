import { Connection, PublicKey } from "@solana/web3.js"
import bs58 from "bs58"

// Use a public RPC endpoint
const RPC_ENDPOINT = "https://solana-mainnet.g.alchemy.com/v2/demo"

/**
 * Validates a transaction by checking if the message and sender match the expected values
 * @param message The expected message
 * @param publicKey The expected sender's public key
 * @param signature The transaction signature
 * @returns The transaction signature if valid, throws an error otherwise
 */
export async function validateTransaction(
  message: string,
  publicKey: string,
  signature: Uint8Array
): Promise<boolean> {
  const signatureBase58 = bs58.encode(signature)

  try {
    const connection = new Connection(RPC_ENDPOINT)
    const transaction = await waitForTransaction(connection, signatureBase58)

    if (!transaction || !transaction.meta || !transaction.meta.logMessages) {
      console.log("❌ Transaction not found or invalid")
      throw new Error("Transaction not found or invalid")
    }

    const logMessages = transaction.meta.logMessages
    const memoLog = logMessages.find(log => log.includes('Program log: Memo'))
    let extractedMessage: string | null = null

    if (memoLog) {
      const matches = memoLog.match(/"([^"]*)"/)
      if (matches && matches[1]) {
        extractedMessage = matches[1]
      }
    }

    const firstAccount = transaction.transaction.message.accountKeys[0]
    const senderPublicKey = firstAccount.pubkey.toString()

    console.log("Message extrait de la transaction:", extractedMessage)
    console.log("Message attendu:", message)
    console.log("Adresse de l'expéditeur (string):", senderPublicKey)
    console.log("Adresse attendue:", publicKey)

    const isVerified = extractedMessage === message && senderPublicKey === publicKey

    if (!isVerified) {
      throw new Error("Transaction validation failed")
    }

    return isVerified
  } catch (err) {
    console.error("❌ Error during transaction verification:", err)
    throw err
  }
}

async function waitForTransaction(connection: Connection, signatureBase58: string, timeout = 30000) {
  const startTime = Date.now()
  while (Date.now() - startTime < timeout) {
    const transaction = await connection.getParsedTransaction(signatureBase58, { commitment: "confirmed" })
    if (transaction) {
      return transaction
    }
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
  throw new Error("Timeout: Transaction not found")
}
