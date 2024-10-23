import { Connection, PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js"
import { USDC_DEV_ADDRESS } from "../../shared/constants"
import { Commitment } from "shared/SolanaWeb3"

/**
 * 
 * @param amount amount of token to send
 * @param wallet users wallet
 * @param LbpWalletKey LBP wallet (receiving wallet) public key address
 * @param connection solana RPC connection
 * @returns signed and serialized transaction
 */
export async function createAndSerializeTransaction(
    amount: number, 
    wallet: any, 
    LbpWalletKey: PublicKey, 
    connection: Connection
) {
    const tokenMintAddress = new PublicKey(USDC_DEV_ADDRESS)  // hardcoded for now on USDC dev address
    const transaction = await createSplTokenTransaction(connection, wallet, LbpWalletKey, tokenMintAddress, amount)
    transaction.feePayer = wallet.publicKey
    transaction.recentBlockhash = ((await connection.getLatestBlockhash()).blockhash)
    // Sign transaction
    const signedTransaction = await wallet.signTransaction(transaction)
    const serializedTx = await signedTransaction.serialize()
    return serializedTx
}
/**
 * 
 * @param fromTokenAccount Associated Token Account for the sender (user)
 * @param toTokenAccount Associated Token Account for the receiver (LBP wallet)
 * @param ownerPublicKey Users wallet public key
 * @param amount Amount of tokens to send
 * @param tokenMintAccount Mint of the token to send
 * @returns Transfer instruction to be used in the transaction
 */
export function createTransferInstruction(
    fromTokenAccount: PublicKey,
    toTokenAccount: PublicKey,
    ownerPublicKey: PublicKey,
    amount: number,
    tokenMintAccount: PublicKey
  ) {
    const amountInLamports = amount * Math.pow(10, 6); // This is hardcoded for now because of USDC dev 6 decimals. Check the used token specs for decimals
  
      const data = Buffer.alloc(9) // 1 byte for instruction type + 8 bytes for amount
      data.writeUInt8(3, 0) // Instruction type for transfer (3 is the code for TRANFSER instruction)
      data.writeBigUInt64LE(BigInt(amountInLamports), 1) // Amount in u64 format
  
    return new TransactionInstruction({
      keys: [
          { pubkey: fromTokenAccount, isSigner: false, isWritable: true },
          { pubkey: toTokenAccount, isSigner: false, isWritable: true },
          { pubkey: ownerPublicKey, isSigner: true, isWritable: false }, // Owner must sign
          { pubkey: tokenMintAccount, isSigner: false, isWritable: false },
      ],
      programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'), // SPL Token Program ID
      data,
  })
  }
  /**
   * 
   * @param connection solana RPC connection
   * @param wallet wallet from the user (phantom/backpack)
   * @param LbpWalletAddres LBP receiving wallet public key
   * @param mintAddress token mint address
   * @param amount amount of token to send
   * @returns transaction with spl token transfer instruction
   */
  async function createSplTokenTransaction(connection: Connection, wallet: any, LbpWalletAddres: PublicKey, mintAddress: PublicKey, amount: number) {
    // Get the associated token accounts
    const fromTokenAccount = await connection.getTokenAccountsByOwner(
        wallet.publicKey,
        { mint: new PublicKey(mintAddress) }
    )
    const toTokenAccount = await connection.getTokenAccountsByOwner(
        LbpWalletAddres,
        { mint: new PublicKey(mintAddress) }
    )
  
    if (fromTokenAccount.value.length === 0) {
        throw new Error('Sender does not have a token account for this mint.')
    }
  
    if (toTokenAccount.value.length === 0) {
        throw new Error('Recipient does not have a token account for this mint.')
    }
    // Extract public keys from ATA accounts
    const fromAccountKey = fromTokenAccount.value[0].pubkey
    const toAccountKey = toTokenAccount.value[0].pubkey
    // Initialize the transaction
    const tx = new Transaction()
    // Create the transfer instruction
    const transferInstruction = createTransferInstruction(
        fromAccountKey,
        toAccountKey,
        wallet.publicKey,
        amount,
        mintAddress
    )
    // Add the instruction to the transaction
    tx.add(transferInstruction)
    return tx
}

export async function signatureSubscribe(connection: Connection, txId: string): Promise<Commitment> {
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
  
export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}