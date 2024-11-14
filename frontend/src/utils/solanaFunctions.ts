import { Connection, Keypair, PublicKey, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js"
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

// async function getNftInstructions (
//   authorityPublicKey: PublicKey,
//   connection: Connection,
//   freezeAuthority: boolean,
//   metadataUri: string // URI pointing to metadata of the NFT (e.g., IPFS link)
// ) {
  // create new keypair for mint account
  // const mintAccount = Keypair.generate()

  // generate instruction for creating mint account
  // const lamports = await connection.getMinimumBalanceForRentExemption(82)
  // const createMintAccountInstruction = SystemProgram.createAccount({
  //   fromPubkey: authorityPublicKey,
  //   newAccountPubkey: mintAccount.publicKey,
  //   lamports,
  //   space: 82,
  //   programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
  // })

  // prepare data for initializing mint account
//   const data = Buffer.alloc(67)
//   data.writeUint8(0,0) // Initialize mint instruction is number 0 on first byte
//   data.writeUInt8(0,1)  // Number of decimals goes to second byte, we put 0 as NFT does not have decimals
//   data.write(authorityPublicKey.toBase58(), 2) // Mint authority at third byte
//   if (freezeAuthority) {
//     data.write(authorityPublicKey.toBuffer().toString(), 34) // Freeze authority at offset 34 if provided
// } else {
//     data.write(Buffer.alloc(32).toString(), 34)      // Write 32 bytes of 0 if no freeze authority
// }
//   const initializeMintAccountInstruction = new TransactionInstruction({
//     keys: [{ pubkey: mintAccount.publicKey, isSigner: false, isWritable: true }],
//     programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
//     data,
//   })

  // get associated token account for minting 
  // const associatedTokenAccountPublicKey = await PublicKey.findProgramAddress(
  //   [
  //     authorityPublicKey.toBuffer(),
  //     new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA').toBuffer(),
  //     mintAccount.publicKey.toBuffer()
  //   ],
  //   new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')
  // )

  // Instruction to create associated token account if it doesnt exist
  // const newAssociatedAccountInstruction = new TransactionInstruction({
  //   programId: new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'),
  //   keys: [
  //       { pubkey: authorityPublicKey, isSigner: true, isWritable: true },
  //       { pubkey: associatedTokenAccountPublicKey[0], isSigner: false, isWritable: true },
  //       { pubkey: authorityPublicKey, isSigner: false, isWritable: false },
  //       { pubkey: mintAccount.publicKey, isSigner: false, isWritable: false },
  //       { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
  //       { pubkey: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'), isSigner: false, isWritable: false },
  //   ],
  //   data: Buffer.alloc(0), // No additional data required
  // })

  //   // creating metadata for NFT
    // const metadata = {
    //   name: "NFT_TEST",
    //   symbol: "NFTT",
    //   uri: metadataUri, // Metadata URI (IPFS link or similar)
    // }
  
    // creating instruction for metadata adding to NFT
    // const metadataData = Buffer.from(JSON.stringify(metadata)); // Convert metadata to buffer
    // const metadataInstruction = new TransactionInstruction({
    //   keys: [
    //     { pubkey: mintAccount.publicKey, isSigner: false, isWritable: true }, // Mint address
    //     { pubkey: authorityPublicKey, isSigner: true, isWritable: false }, // Owner signing
    //   ],
    //   programId: new PublicKey('99hNSg9acmyg5hWTjw76GoA8k3LG5NvdPXih7sotdmZ7'),
    //   data: metadataData, // Send the metadata as part of the instruction
    // })

  // // prepare data for minting instruction
  // const mintInstructionData = Buffer.alloc(9) // Buffer for mint instruction
  // data.writeUInt8(1, 0) // Minting instruction is number 1 on first byte
  // data.writeBigUInt64LE(BigInt(1), 1) // Minting 1 token (second byte is minted amount)

  // const mintInstruction = new TransactionInstruction({
  //   keys: [
  //     { pubkey: mintAccount.publicKey, isSigner: false, isWritable: true },
  //     { pubkey: associatedTokenAccountPublicKey[0], isSigner: false, isWritable: true },
  //     { pubkey: authorityPublicKey, isSigner: true, isWritable: false }, // Owner must sign
  //   ],
  //   programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
  //   data: mintInstructionData,
  // })

  // const listOfInstructions : TransactionInstruction[] = [
  //   createMintAccountInstruction,
  //   initializeMintAccountInstruction,
    // newAssociatedAccountInstruction,
    // metadataInstruction,
    // mintInstruction
  ]

  // we return list of instructions and mintAccount because we need its signature
//   return {
//     listOfInstructions,
//     mintAccount
//   }
// }

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
    // creating instructions for initializing mint account for nft 
    // const { listOfInstructions, mintAccount }  = await getNftInstructions(walletProvider.publicKey, connection, true, 'ipfs://QmTy8w65yBXgyfG2ZBg5TrfB2hPjrDQH3RCQFJGkARStJb')
    // listOfInstructions.forEach(instruction => tx.add(instruction))
    // tx.feePayer = walletProvider.publicKey
    // tx.recentBlockhash = ((await connection.getLatestBlockhash()).blockhash)
    // tx.sign(mintAccount)
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