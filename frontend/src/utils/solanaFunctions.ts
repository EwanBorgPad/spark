import { Connection, Keypair, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY, Transaction, TransactionInstruction } from "@solana/web3.js"
import { ASSOCIATED_TOKEN_PROGRAM_ADDRESS, METADATA_PROGRAM_ADDRESS, TOKEN_PROGRAM } from "../../shared/constants"
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
    decimals: number,
    lbpWalletAddress: PublicKey
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
          { pubkey: lbpWalletAddress, isSigner: false, isWritable: false}
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
async function createSplTokenTransaction(connection: Connection, walletProvider: Provider, lbpWalletAddress: PublicKey, mintAddress: PublicKey, amount: number, rpcUrl: string) {
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
      lbpWalletAddress,
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
        toast.error("You don't have enough tokens, check your wallet again.")
        throw new Error("NOT_ENOUGH_FUNDS")
      }
    } else {
      toast.error("You don't have enough tokens, check your wallet again.")
      throw new Error("NOT_ENOUGH_FUNDS")
    }

    // Extract public keys from ATA accounts
    const fromAccountKey = fromTokenAccount.value[0].pubkey
    const toAccountKey = toTokenAccount.value[0].pubkey
    // Initialize the transaction
    const tx = new Transaction()
    // Create the transfer funds instruction
    const transferInstruction = createTransferInstruction(
        fromAccountKey,
        toAccountKey,
        walletProvider.publicKey,
        amount,
        mintAddress,
        decimals,
        lbpWalletAddress
    )
    // Add transfer funds instruction to the transaction
    tx.add(transferInstruction)

    tx.feePayer = walletProvider.publicKey
    tx.recentBlockhash = ((await connection.getLatestBlockhash()).blockhash)
    // Create nft mint account instructions and add them to the transaction
    const { listOfInstructions, mintAccountKeypair } = await createMintAccountInstructions(connection, walletProvider.publicKey, walletProvider.publicKey, null)
    listOfInstructions.forEach(instruction => tx.add(instruction))
    // TODO: Create metadata for nft instruction and add it to the transaction
    // const metadataInstruction = await createMetadataInstructionForNft('ipfs://QmRAuxeMnsjPsbwW8LkKtk6Nh6MoqTvyKwP3zwuwJnB2yP', mintAccountKeypair.publicKey, walletProvider.publicKey, walletProvider.publicKey)
    // tx.add(metadataInstruction)
    // Create nft mintTo instructions and add them to the transaction
    const mintInstructions = await createMintNftToUserInstructions(walletProvider.publicKey, walletProvider.publicKey, walletProvider.publicKey, mintAccountKeypair.publicKey)
    mintInstructions.forEach(instruction => tx.add(instruction))
    // Sign the transaction with mintAccount
    tx.sign(mintAccountKeypair)
    return tx
}

// Function to convert Uint8Array to Base64
function uint8ArrayToBase64(uint8Array: Uint8Array) {
  const binaryString = String.fromCharCode(...uint8Array);
  return btoa(binaryString)
}

export async function signatureSubscribe(connection: Connection, txId: string): Promise<Commitment> {
    const delayTime = 3_000
    const delayLimit = 45_000

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

async function createMintAccountInstructions (
  connection: Connection,
  payer: PublicKey,
  mintAuthority: PublicKey,
  freezeAuthority: PublicKey | null,
) {
  // Create a new Keypair for the mint account
  const mintAccountKeypair = Keypair.generate()

  // Calculate the rent exemption balance for the mint account
  const lamports = await connection.getMinimumBalanceForRentExemption(82) // 82 bytes for mint account data

  // Create transaction to fund and allocate space for the mint account
  const createAccountInstruction = SystemProgram.createAccount({
      fromPubkey: payer,
      newAccountPubkey: mintAccountKeypair.publicKey,
      lamports,
      space: 82,
      programId: new PublicKey(TOKEN_PROGRAM),
  })

  // Prepare data for initializing the mint account
  const data = Buffer.alloc(67)
  data.writeUInt8(0, 0)                      // InitializeMint instruction (0)
  data.writeUInt8(0, 1)                      // Number of decimals (0 for NFTs)
  data.set(mintAuthority.toBuffer(), 2)      // Mint authority (32 bytes)
  if (freezeAuthority) {
      data.set(freezeAuthority.toBuffer(), 34) // Freeze authority if provided (32 bytes)
  } else {
      data.fill(0, 34, 66) // Fill with zeros if no freeze authority
  }

  // Add InitializeMint instruction
  const initializeAccountDataInstruction = new TransactionInstruction({
      keys: [
        { pubkey: mintAccountKeypair.publicKey, isSigner: false, isWritable: true },
        { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false }
      ],
      programId: new PublicKey(TOKEN_PROGRAM),
      data,
  })

  const listOfInstructions = [
    createAccountInstruction,
    initializeAccountDataInstruction,
  ]

  // Since we need mintAccount to sign the transaction we will return its keypair with the instructions as well
  return {
    listOfInstructions,
    mintAccountKeypair
  }
}

async function createMintNftToUserInstructions (
  payerPublicKey: PublicKey,
  userWalletPublicKey: PublicKey,
  mintAuthorityPublicKey: PublicKey,
  mintPublicKey: PublicKey
) {
  // Create/find the associated token account for the user's wallet
  const [associatedTokenAccountPublicKey] = await PublicKey.findProgramAddress(
    [
        userWalletPublicKey.toBuffer(),
        new PublicKey(TOKEN_PROGRAM).toBuffer(),
        mintPublicKey.toBuffer(),
    ],
    new PublicKey(ASSOCIATED_TOKEN_PROGRAM_ADDRESS)
);
  // Create instruction to create the associated token account
  const createAssociatedAccountInstruction = new TransactionInstruction({
      programId: new PublicKey(ASSOCIATED_TOKEN_PROGRAM_ADDRESS),
      keys: [
          { pubkey: payerPublicKey, isSigner: true, isWritable: true },
          { pubkey: associatedTokenAccountPublicKey, isSigner: false, isWritable: true },
          { pubkey: userWalletPublicKey, isSigner: false, isWritable: false },
          { pubkey: mintPublicKey, isSigner: false, isWritable: false },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
          { pubkey: new PublicKey(TOKEN_PROGRAM), isSigner: false, isWritable: false },
      ],
      data: Buffer.alloc(0),
  })

  // Create MintTo instruction to mint the NFT to the user's associated token account
  const mintToInstructionData = Buffer.alloc(9)
  mintToInstructionData.writeUInt8(7, 0) // 7 is the MintTo instruction code
  mintToInstructionData.writeBigUInt64LE(BigInt(1), 1) // Mint 1 token (NFT)

  const mintToInstruction = new TransactionInstruction({
    programId: new PublicKey(TOKEN_PROGRAM),
    keys: [
        { pubkey: mintPublicKey, isSigner: false, isWritable: true },
        { pubkey: associatedTokenAccountPublicKey, isSigner: false, isWritable: true },
        { pubkey: mintAuthorityPublicKey, isSigner: true, isWritable: false },
    ],
    data: mintToInstructionData,
  })

  const listOfInstructions = [
    createAssociatedAccountInstruction,
    mintToInstruction
  ]

  return listOfInstructions
}

// TODO: finish implementing this instruction to create Metadata for NFT (still need to figure out how)
// async function createMetadataInstructionForNft (
//   metadataUri: string,
//   mintPublicKey: PublicKey,
//   payerPublicKey: PublicKey,
//   ownerPublicKey: PublicKey
// ) {
//   const [metadataPDA] = await getMetadataPDA(mintPublicKey)

//   // Initialize metadata for NFT, for now hardcoded data TODO: ask team how we handle this
//   const name = 'StrajoNft'
//   const symbol = 'SNFT'
//   const sellerFeeBasisPoints = '0'

  // TODO: figure out how to do this without errors on instruction
  // const metadataData = Buffer.alloc(100)
  // metadataData.writeUInt8(0, 0);  // Version
  // metadataData.writeUInt8(0, 1);  // Type (metadata)
  // metadataData.write(Buffer.from(mintPublicKey.toBase58(), 'utf-8'), 2);  // Mint Address
  // metadataData.write(mintAuthority.toBuffer(), 34);  // Mint Authority
  // metadataData.write(freezeAuthority ? freezeAuthority.toBuffer() : Buffer.alloc(32), 66);  // Freeze Authority or 0
  // metadataData.writeUInt16LE(sellerFeeBasisPoints, 98);  // Seller Fee
  // metadataData.write(uri, 102);  // Metadata URI
  // metadataData.write(name, 134);  // Name
  // metadataData.write(symbol, 166);  // Symbol

  // return new TransactionInstruction({
  //   keys: [
  //     { pubkey: metadataPDA, isSigner: false, isWritable: true },
  //     { pubkey: mintPublicKey, isSigner: false, isWritable: false },
  //     { pubkey: payerPublicKey, isSigner: true, isWritable: true },
  //     { pubkey: ownerPublicKey, isSigner: true, isWritable: false },
  //     { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
  //   ],
  //   programId: new PublicKey(METADATA_PROGRAM_ADDRESS),
  //   data: metadataData,
  // })
// }

// function used in creating metadata for nft
async function getMetadataPDA(mint: PublicKey) {
  return PublicKey.findProgramAddress(
    [
      Buffer.from('metadata'),
      new PublicKey(METADATA_PROGRAM_ADDRESS).toBuffer(),
      mint.toBuffer(),
    ],
    new PublicKey(METADATA_PROGRAM_ADDRESS)
  )
}
