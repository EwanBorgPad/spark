import { Connection, PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js"
import { SOLANA_PUBLIC_RPC_URL, USDC_DEV_ADDRESS } from "../../shared/constants"
import { Commitment, getSplTokenBalance } from "../../shared/SolanaWeb3"
import { toast } from "react-toastify"
import { Provider } from "@/hooks/useWalletContext"
export type Wallet = {
  publicKey: PublicKey,
  isConnected: boolean,
  signTransaction: (transaction: Transaction) => Transaction
}
/**
 * Function to get serialized and signed transaction from the user
 * @param tokenAmount amount of tokens to send
 * @param walletProvider wallet provider from the user (Phantom, Backpack or Solflare)
 * @param rpcUrl url of the RPC we will be using
 * @param tokenMintAddress mint of the token to be transfered
 * @returns serialized transaction in base64 string format
 */
export async function getTransactionToSend(
  tokenAmount: number,
  walletProvider: Provider,
  rpcUrl: string,
  tokenMintAddress: PublicKey
) {
  const LbpWalletKey = new PublicKey(import.meta.env.VITE_LBP_WALLET_ADDRESS)
  
  const transaction = await createAndSerializeTransaction(tokenAmount, walletProvider, LbpWalletKey, rpcUrl, tokenMintAddress)
  // convert serialized tx to base64 string for sending it to backend
  const uint8tx = new Uint8Array(transaction)
  const txToSend = uint8ArrayToBase64(uint8tx)
  return txToSend
}
/**
 * Function to create and serialize SPL token transfer transaction
 * @param amount amount of token to send
 * @param wallet users wallet
 * @param LbpWalletKey LBP wallet (receiving wallet) public key address
 * @param rpcUrl rpcUrl we use for connection
 * @param tokenMintAddress mint of the token to be transfered
 * @returns signed and serialized transaction
 */
async function createAndSerializeTransaction(
    amount: number,
    walletProvider: Provider, 
    LbpWalletKey: PublicKey, 
    rpcUrl: string,
    tokenMintAddress: PublicKey
) {
    const connection = new Connection(rpcUrl)
    const transaction = await createSplTokenTransaction(connection, walletProvider, LbpWalletKey, tokenMintAddress, amount, rpcUrl)
    transaction.feePayer = walletProvider.publicKey
    transaction.recentBlockhash = ((await connection.getLatestBlockhash()).blockhash)
    // Sign transaction
    const signedTransaction = await walletProvider.signTransaction(transaction)
    const serializedTx = await signedTransaction.serialize()
    return serializedTx
}
/**
 * Function to create transfer instruction for SPL tokens
 * @param fromTokenAccount Associated Token Account for the sender (user)
 * @param toTokenAccount Associated Token Account for the receiver (LBP wallet)
 * @param ownerPublicKey Users wallet public key
 * @param amount Amount of tokens to send
 * @param tokenMintAccount Mint of the token to send
 * @returns Transfer instruction to be used in the transaction
 */
function createTransferInstruction(
    fromTokenAccount: PublicKey,
    toTokenAccount: PublicKey,
    ownerPublicKey: PublicKey,
    amount: number,
    tokenMintAccount: PublicKey,
    decimals: number
  ) {
    const amountInLamports = amount * Math.pow(10, decimals)
  
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
 * Function to create SPL token transfer transactions
 * @param walletProvider wallet provider from the user (phantom/backpack/solflare)
 * @param LbpWalletAddres LBP receiving wallet public key
 * @param mintAddress token mint address
 * @param amount amount of token to send
 * @param rpcUrl url of the rpc used
 * @returns transaction with spl token transfer instruction
 */
async function createSplTokenTransaction(connection: Connection, walletProvider: Provider, LbpWalletAddres: PublicKey, mintAddress: PublicKey, amount: number, rpcUrl: string) {
    // get decimal number from mint account
    const mintAccountInfo = await connection.getParsedAccountInfo(mintAddress)
    if (!mintAccountInfo.value) throw new Error ("Mint address not existent")
    // @ts-expect-error
    const decimals: number = mintAccountInfo.value.data.parsed.info.decimals
    // Get the associated token accounts
    const fromTokenAccount = await connection.getTokenAccountsByOwner(
        walletProvider.publicKey,
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
    const userBalance = await getSplTokenBalance({rpcUrl , address: walletProvider.publicKey.toBase58(), tokenAddress: mintAddress.toBase58()})
    if (userBalance) {
      const convertedUserBalanced = parseFloat(userBalance.amount) * Math.pow(0.1, decimals)
      if (convertedUserBalanced < amount) {
        toast("You don't have enough tokens, check your wallet again.")
        throw new Error("Not enough funds!")
      }
    } else {
      toast("You don't have enough tokens, check your wallet again.")
      throw new Error("Not enough funds!")
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
        walletProvider.publicKey,
        amount,
        mintAddress,
        decimals
    )
    // Add the instruction to the transaction
    tx.add(transferInstruction)
    // TODO: Create nft minting instruction and add it to the transaction
    return tx
}

// Function to convert Uint8Array to Base64
function uint8ArrayToBase64(uint8Array: Uint8Array) {
  const binaryString = String.fromCharCode(...uint8Array);
  return btoa(binaryString)
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