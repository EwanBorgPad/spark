import { jsonResponse, reportError } from "../cfPagesFunctionsUtils"
import { drizzle } from "drizzle-orm/d1"
import { Connection, PublicKey, Keypair, SystemProgram, Transaction, VersionedTransaction } from "@solana/web3.js"
import { 
  DynamicBondingCurveClient, 
  deriveDbcPoolAddress,
  deriveDammV2MigrationMetadataAddress,
  deriveBaseKeyForLocker,
  deriveEscrow
} from "@meteora-ag/dynamic-bonding-curve-sdk"
import { SplGovernance } from "governance-idl-sdk"
import BN from "bn.js"
import bs58 from "bs58"
import { eq, or, isNull } from "drizzle-orm"
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"
import { isApiKeyValid } from "../../services/apiKeyService"

// DAMM V2 Migration Config Addresses from @meteora-ag/dynamic-bonding-curve-sdk README
const DAMM_V2_MIGRATION_FEE_ADDRESS: Record<number, string> = {
  0: "7F6dnUcRuyM2TwR8myT1dYypFXpPSxqwKNSFNkxyNESd", // MigrationFeeOption.FixedBps25 == 0
  1: "2nHK1kju6XjphBLbNxpM5XRGFj7p9U8vvNzyZiha1z6k", // MigrationFeeOption.FixedBps30 == 1
  2: "Hv8Lmzmnju6m7kcokVKvwqz7QPmdX9XfKjJsXz8RXcjp", // MigrationFeeOption.FixedBps100 == 2
  3: "2c4cYd4reUYVRAB9kUUkrq55VPyy2FNQ3FDL4o12JXmq", // MigrationFeeOption.FixedBps200 == 3
  4: "AkmQWebAwFvWk55wBoCr5D62C6VVDTzi84NJuD9H7cFD", // MigrationFeeOption.FixedBps400 == 4
  5: "DbCRBj8McvPYHJG1ukj8RE15h2dCNUdTAESG49XpQ44u", // MigrationFeeOption.FixedBps600 == 5
}

// Jito tip account
const JITO_TIP_ACCOUNT = new PublicKey("96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5")

// Define the tokens table schema
const tokensTable = sqliteTable('tokens', {
  mint: text('mint').notNull().primaryKey(),
  name: text('name').notNull(),
  isGraduated: integer('isGraduated', { mode: 'boolean' }).notNull(),
  imageUrl: text('imageUrl'),
  dao: text('dao').default("")
})

type ENV = {
  DB: D1Database
  RPC_URL: string
  POOL_CONFIG_KEY: string
  PRIVATE_KEY: string
}

export const onRequestPost: PagesFunction<ENV> = async (ctx) => {
  const db = drizzle(ctx.env.DB, { logger: true })
  const rawDb = ctx.env.DB
  try {
    // authorize request
    if (!await isApiKeyValid({ ctx, permissions: ['write'] })) {
      return jsonResponse(null, 401)
    }

    // Get tokens that don't have DAOs (dao field is empty or null)
    const tokensWithoutDao = await db
      .select()
      .from(tokensTable)
      .where(or(eq(tokensTable.dao, ""), isNull(tokensTable.dao)))
      .all()

    console.log(`Found ${tokensWithoutDao.length} tokens without DAOs`)

    const results = []
    const connection = new Connection(ctx.env.RPC_URL, "confirmed")
    const dbcClient = new DynamicBondingCurveClient(connection, "confirmed")

    // Initialize wallet for DAO creation
    const privateKeyString = ctx.env.PRIVATE_KEY
    if (!privateKeyString || typeof privateKeyString !== 'string') {
      throw new Error('Invalid private key format')
    }
    const privateKeyUint8Array = bs58.decode(privateKeyString)
    const wallet = Keypair.fromSecretKey(privateKeyUint8Array)

    // SOL mint address (quote token for most pools)
    const SOL_MINT = new PublicKey("So11111111111111111111111111111111111111112")
    const CONFIG_KEY = new PublicKey(ctx.env.POOL_CONFIG_KEY)

    for (const token of tokensWithoutDao) {
      try {
        // Use the SDK's helper function to derive pool address
        const poolAddress = deriveDbcPoolAddress(
          SOL_MINT, // quoteMint (SOL)
          new PublicKey(token.mint), // baseMint (token)
          CONFIG_KEY // config
        )

        console.log(`Checking pool ${poolAddress.toBase58()} for token ${token.mint}`)

        // Check pool curve progress
        const curveProgress = await dbcClient.state.getPoolCurveProgress(poolAddress)

        console.log(`Token ${token.mint} has curve progress: ${curveProgress}`)

        if (curveProgress >= 1) {
          console.log(`Token ${token.mint} has graduated! Creating DAO...`)

          // Create DAO for graduated token
          const daoAddress = await createDaoForToken({
            tokenName: token.name,
            tokenMint: token.mint,
            wallet,
            connection
          })

          // Migrate to DAMM V2 using correct config addresses
          let migrationSignature: string | null = null
          try {
            console.log(`Migrating token ${token.mint} to DAMM V2...`)
            migrationSignature = await migrateToDammV2({
              tokenMint: token.mint,
              wallet,
              connection,
              poolConfigKey: ctx.env.POOL_CONFIG_KEY
            })
          } catch (migrationError) {
            console.error(`Migration to DAMM V2 failed for token ${token.mint}:`, migrationError)
            // Don't fail the entire process if migration fails
            migrationSignature = "migration_failed"
          }

          // Update token record with DAO address
          await rawDb
            .prepare("UPDATE tokens SET dao = ?1 WHERE mint = ?2")
            .bind(daoAddress, token.mint)
            .run()

          results.push({
            tokenMint: token.mint,
            tokenName: token.name,
            poolAddress: poolAddress.toBase58(),
            curveProgress,
            graduated: true,
            daoCreated: true,
            daoAddress,
            migratedToDammV2: migrationSignature !== "migration_failed" && migrationSignature !== "already_migrated" && migrationSignature !== "migration_disabled" && migrationSignature !== "fee_claimer_mismatch",
            migrationSignature: migrationSignature || undefined
          })
        } else {
          results.push({
            tokenMint: token.mint,
            tokenName: token.name,
            poolAddress: poolAddress.toBase58(),
            curveProgress,
            graduated: false,
            daoCreated: false
          })
        }

      } catch (error) {
        console.error(`Error processing token ${token.mint}:`, error)
        results.push({
          tokenMint: token.mint,
          tokenName: token.name,
          error: error instanceof Error ? error.message : 'Unknown error',
          graduated: false,
          daoCreated: false
        })
      }
    }

    return jsonResponse({
      message: "Token graduation check completed",
      processedTokens: results.length,
      graduatedTokens: results.filter(r => r.graduated).length,
      daosCreated: results.filter(r => r.daoCreated).length,
      migratedToDammV2: results.filter(r => r.migratedToDammV2).length,
      results
    }, 200)

  } catch (e) {
    await reportError(ctx.env.DB, e)
    return jsonResponse({ message: "Something went wrong..." }, 500)
  }
}



// Function to create DAO for a graduated token
async function createDaoForToken({
  tokenName,
  tokenMint,
  wallet,
  connection
}: {
  tokenName: string
  tokenMint: string
  wallet: Keypair
  connection: Connection
}): Promise<string> {

  const governanceProgramId = new PublicKey("GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw")
  const splGovernance = new SplGovernance(connection, governanceProgramId)

  // DAO creation parameters
  const communityTokenMintPubKey = new PublicKey(tokenMint)
  const payerPubKey = wallet.publicKey
  const minCommunityWeightToCreateGovernance = 10000000000

  // Prepare the MintMaxVoteWeightSource
  const communityMintMaxVoterWeightSource = {
    type: "supplyFraction" as const,
    amount: new BN(10000000000)
  }

  // Create realm instruction
  const createRealmInstruction = await splGovernance.createRealmInstruction(
    `${tokenName} DAO`, // DAO name
    communityTokenMintPubKey,
    minCommunityWeightToCreateGovernance,
    payerPubKey,
    communityMintMaxVoterWeightSource,
    undefined, // no council token
    "liquid",
    "dormant"
  )

  const realmPubKey = createRealmInstruction.keys[0].pubkey // This is the DAO address

  // Create governance instruction
  const createGovernanceInstruction = await splGovernance.createGovernanceInstruction(
    {
      communityVoteThreshold: { yesVotePercentage: [50] },
      minCommunityWeightToCreateProposal: minCommunityWeightToCreateGovernance,
      minTransactionHoldUpTime: 0,
      votingBaseTime: 216000,
      communityVoteTipping: { disabled: {} },
      councilVoteThreshold: { disabled: {} },
      councilVetoVoteThreshold: { disabled: {} },
      minCouncilWeightToCreateProposal: 1,
      councilVoteTipping: { strict: {} },
      communityVetoVoteThreshold: { disabled: {} },
      votingCoolOffTime: 43200,
      depositExemptProposalCount: 10,
    },
    realmPubKey,
    payerPubKey,
    undefined,
    payerPubKey
  )

  const governancePubKey = createGovernanceInstruction.keys[1].pubkey

  // Create native treasury instruction
  const createNativeTreasuryInstruction = await splGovernance.createNativeTreasuryInstruction(
    governancePubKey,
    payerPubKey
  )

  // Build and send transaction
  const { Transaction } = await import('@solana/web3.js')
  const transaction = new Transaction().add(
    createRealmInstruction,
    createGovernanceInstruction,
    createNativeTreasuryInstruction
  )

  const { blockhash } = await connection.getLatestBlockhash()
  transaction.recentBlockhash = blockhash
  transaction.feePayer = payerPubKey

  // Sign and send transaction
  transaction.sign(wallet)
  const signature = await connection.sendRawTransaction(transaction.serialize(), {
    skipPreflight: false,
    preflightCommitment: 'confirmed'
  })

  // Wait for confirmation with extended timeout for devnet
  try {
    // Use a more robust confirmation approach with timeout handling
    const confirmation = await Promise.race([
      connection.confirmTransaction(signature, 'confirmed'),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Confirmation timeout')), 60000)
      )
    ])
    console.log(`DAO created for token ${tokenMint} with signature: ${signature}`)
  } catch (timeoutError) {
    // If timeout, check if transaction actually succeeded
    console.log(`Confirmation timeout for ${tokenMint}, checking transaction status...`)
    
    try {
      const transactionStatus = await connection.getSignatureStatus(signature)
      if (transactionStatus.value?.confirmationStatus === 'confirmed' || 
          transactionStatus.value?.confirmationStatus === 'finalized') {
        console.log(`DAO creation confirmed via status check for token ${tokenMint}`)
      } else {
        console.log(`Transaction status for ${tokenMint}:`, transactionStatus.value)
        // Re-throw if transaction actually failed
        if (transactionStatus.value?.err) {
          throw new Error(`Transaction failed: ${JSON.stringify(transactionStatus.value.err)}`)
        }
        // If still processing, log but don't fail
        console.log(`Transaction for ${tokenMint} may still be processing`)
      }
    } catch (statusError) {
      console.error(`Error checking transaction status for ${tokenMint}:`, statusError)
      // Don't fail the whole process, just log the issue
    }
  }
  
  console.log(`DAO address for token ${tokenMint}: ${realmPubKey.toBase58()}`)
  return realmPubKey.toBase58() // Return DAO address instead of transaction signature
}

// Function to migrate a graduated token to DAMM V2
async function migrateToDammV2({
  tokenMint,
  wallet,
  connection,
  poolConfigKey
}: {
  tokenMint: string
  wallet: Keypair
  connection: Connection
  poolConfigKey: string
}): Promise<string> {
  console.log(`Starting DAMM V2 migration for token ${tokenMint}`)
  
  // Use the specific Meteora Dynamic Bonding Curve Program ID for migration
  const client = new DynamicBondingCurveClient(connection, "confirmed")
  // Note: Using the specific program ID dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN for Meteora DBC
  const baseMint = new PublicKey(tokenMint)
  
  // Get pool by deriving the address (same as in main function)
  const solMint = new PublicKey('So11111111111111111111111111111111111111112') // SOL
  const poolConfig = new PublicKey(poolConfigKey)
  const derivedPoolAddress = deriveDbcPoolAddress(solMint, baseMint, poolConfig)
  
  const virtualPoolState = await client.state.getPool(derivedPoolAddress)
  if (!virtualPoolState) {
    throw new Error(`Pool not found for address: ${derivedPoolAddress.toString()}`)
  }

  const configKey = virtualPoolState.config
  if (!configKey) {
    throw new Error("Pool config is undefined")
  }

  const poolConfigState = await client.state.getPoolConfig(configKey)
  console.log("Pool config state:", poolConfigState)

  const quoteMintKey = new PublicKey(poolConfigState.quoteMint)
  const migrationFeeOption = poolConfigState.migrationFeeOption
  const dammConfigAddress = new PublicKey(DAMM_V2_MIGRATION_FEE_ADDRESS[migrationFeeOption])
  
  // Check if fee claimer is the same as our wallet
  const feeClaimer = poolConfigState.feeClaimer
  const leftoverReceiver = poolConfigState.leftoverReceiver
  console.log("Fee claimer:", feeClaimer.toString())
  console.log("Leftover receiver:", leftoverReceiver.toString())
  console.log("Our wallet:", wallet.publicKey.toString())
  
  const isFeeClaimerOurWallet = feeClaimer.toString() === wallet.publicKey.toString()
  const isLeftoverReceiverOurWallet = leftoverReceiver.toString() === wallet.publicKey.toString()
  
  console.log("Is fee claimer our wallet:", isFeeClaimerOurWallet)
  console.log("Is leftover receiver our wallet:", isLeftoverReceiverOurWallet)
  
  if (!isFeeClaimerOurWallet || !isLeftoverReceiverOurWallet) {
    console.error("Migration requires fee claimer and leftover receiver to be the same as migration wallet")
    console.error(`Expected wallet: ${wallet.publicKey.toString()}`)
    console.error(`Fee claimer: ${feeClaimer.toString()}`)
    console.error(`Leftover receiver: ${leftoverReceiver.toString()}`)
    return "fee_claimer_mismatch"
  }
  
  console.log("✅ Wallet verification passed - proceeding with migration")

  const migrationPoolAddress = deriveDbcPoolAddress(quoteMintKey, baseMint, configKey)
  console.log("Pool address for migration:", migrationPoolAddress.toString())
  console.log("DAMM config address:", dammConfigAddress.toString())
  console.log("Migration fee option:", migrationFeeOption)

  // Check if DAMM config exists
  const dammConfigAccount = await connection.getAccountInfo(dammConfigAddress)
  if (!dammConfigAccount) {
    console.error(`DAMM config account does not exist: ${dammConfigAddress.toString()}`)
    console.log("Skipping migration - DAMM V2 config not deployed yet")
    return "config_not_found"
  }
  console.log("DAMM config account owner:", dammConfigAccount.owner.toString())
  
  // Verify the config is owned by the DAMM V2 program
  const expectedDammV2ProgramId = "cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG"
  if (dammConfigAccount.owner.toString() !== expectedDammV2ProgramId) {
    console.error(`DAMM config owned by wrong program. Expected: ${expectedDammV2ProgramId}, Got: ${dammConfigAccount.owner.toString()}`)
    return "wrong_program_owner"
  }

  // Check if already migrated
  if (virtualPoolState.isMigrated !== 0) {
    console.log("Pool already migrated to DAMM V2")
    return "already_migrated"
  }

  // Check if migration metadata exists
  console.log("Checking if migration metadata exists...")
  const migrationMetadata = deriveDammV2MigrationMetadataAddress(migrationPoolAddress)
  console.log("Migration metadata address:", migrationMetadata.toString())

  const metadataAccount = await connection.getAccountInfo(migrationMetadata)
  let metadataTx: Transaction | null = null
  if (!metadataAccount) {
    console.log("Creating migration metadata...")
    metadataTx = await client.migration.createDammV2MigrationMetadata({
      payer: wallet.publicKey,
      virtualPool: migrationPoolAddress,
      config: configKey,
    })
  } else {
    console.log("Migration metadata already exists")
  }

  // Create locker if needed
  let lockerTx: Transaction | null = null
  if (poolConfigState.lockedVestingConfig.amountPerPeriod.gt(new BN(0))) {
    const base = deriveBaseKeyForLocker(migrationPoolAddress)
    const escrow = deriveEscrow(base)
    const escrowAccount = await connection.getAccountInfo(escrow)

    if (!escrowAccount) {
      console.log("Locker not found, creating locker...")
      lockerTx = await client.migration.createLocker({
        virtualPool: migrationPoolAddress,
        payer: wallet.publicKey,
      })
    } else {
      console.log("Locker already exists, skipping creation")
    }
  } else {
    console.log("No locked vesting found, skipping locker creation")
  }

  // Create migration transaction
  console.log("Creating DAMM V2 migration transaction...")
  const migrateTx = await client.migration.migrateToDammV2({
    payer: wallet.publicKey,
    virtualPool: migrationPoolAddress,
    dammConfig: dammConfigAddress,
  })

  console.log("Migration transaction details:")
  console.log("- Transaction signatures before signing:", migrateTx.transaction.signatures.map(sig => ({
    publicKey: sig.publicKey?.toString(),
    signature: sig.signature ? "present" : "missing"
  })))
  console.log("- First position NFT keypair:", migrateTx.firstPositionNftKeypair?.publicKey.toString())
  console.log("- Second position NFT keypair:", migrateTx.secondPositionNftKeypair?.publicKey.toString())
  console.log("- Transaction instructions count:", migrateTx.transaction.instructions.length)
  console.log("- Transaction accounts:", migrateTx.transaction.instructions.map(ix => 
    ix.keys.map(key => ({
      pubkey: key.pubkey.toString(),
      isSigner: key.isSigner,
      isWritable: key.isWritable
    }))
  ))

  // Create tip transaction
  const tipTx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: JITO_TIP_ACCOUNT,
      lamports: 3_000_000, // 0.003 SOL tip
    })
  )

  // Helper function to prepare and sign a transaction with fresh blockhash
  const prepareTransaction = async (tx: Transaction, signers: Keypair[]) => {
    const { blockhash } = await connection.getLatestBlockhash("confirmed")
    tx.recentBlockhash = blockhash
    tx.feePayer = wallet.publicKey
    tx.sign(...signers)
    return tx
  }

  // Prepare metadata transaction if needed
  if (metadataTx) {
    await prepareTransaction(metadataTx, [wallet])
  }
  
  // Prepare locker transaction if needed
  if (lockerTx) {
    await prepareTransaction(lockerTx, [wallet])
  }
  
  // Prepare migration transaction - include all NFT keypairs as signers
  const requiredSigners = [wallet] // Always include the fee payer
  
  // Check which accounts in the transaction are marked as signers
  const signerAccounts = migrateTx.transaction.instructions.flatMap(ix => 
    ix.keys.filter(key => key.isSigner).map(key => key.pubkey.toString())
  )
  
  console.log("Transaction requires signers:", signerAccounts)
  console.log("Available NFT keypairs:", {
    first: migrateTx.firstPositionNftKeypair?.publicKey.toString(),
    second: migrateTx.secondPositionNftKeypair?.publicKey.toString()
  })
  
  // Always add NFT keypairs when they exist - the SDK may not mark them as signers in the transaction structure
  // but they are required for the migration to work properly
  if (migrateTx.firstPositionNftKeypair) {
    requiredSigners.push(migrateTx.firstPositionNftKeypair)
    console.log("Added first NFT keypair as signer")
  }
  if (migrateTx.secondPositionNftKeypair) {
    requiredSigners.push(migrateTx.secondPositionNftKeypair)
    console.log("Added second NFT keypair as signer")
  }
  
  console.log("Signing with keypairs:", requiredSigners.map(signer => signer.publicKey.toString()))
  await prepareTransaction(migrateTx.transaction, requiredSigners)
  
  // Prepare tip transaction (will get fresh blockhash when needed)
  // Don't prepare it yet - we'll do it right before sending

  // Helper function to confirm transaction with timeout handling
  const confirmTransactionWithTimeout = async (signature: string, description: string) => {
    try {
      await Promise.race([
        connection.confirmTransaction(signature, 'confirmed'),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Confirmation timeout')), 60000)
        )
      ])
      console.log(`${description} transaction confirmed:`, signature)
    } catch (timeoutError) {
      console.log(`Confirmation timeout for ${description}, checking transaction status...`)
      
      try {
        const transactionStatus = await connection.getSignatureStatus(signature)
        if (transactionStatus.value?.confirmationStatus === 'confirmed' || 
            transactionStatus.value?.confirmationStatus === 'finalized') {
          console.log(`${description} confirmed via status check`)
        } else {
          console.log(`Transaction status for ${description}:`, transactionStatus.value)
          if (transactionStatus.value?.err) {
            throw new Error(`Transaction failed: ${JSON.stringify(transactionStatus.value.err)}`)
          }
          console.log(`Transaction for ${description} may still be processing`)
        }
      } catch (statusError) {
        console.error(`Error checking transaction status for ${description}:`, statusError)
      }
    }
  }

  // For Cloudflare Workers, we'll send transactions sequentially instead of using Jito bundles
  // as Jito SDK might not be available in the Workers environment
  try {
    const signatures: string[] = []
    
    // Send metadata transaction first if needed
    if (metadataTx) {
      console.log("Sending migration metadata transaction...")
      const metadataSignature = await connection.sendRawTransaction(metadataTx.serialize(), {
        skipPreflight: false,
        maxRetries: 3,
      })
      await confirmTransactionWithTimeout(metadataSignature, "Metadata")
      signatures.push(metadataSignature)
    }

    // Send locker transaction if needed
    if (lockerTx) {
      console.log("Sending locker transaction...")
      const lockerSignature = await connection.sendRawTransaction(lockerTx.serialize(), {
        skipPreflight: false,
        maxRetries: 3,
      })
      await confirmTransactionWithTimeout(lockerSignature, "Locker")
      signatures.push(lockerSignature)
    }

    // Send migration transaction
    console.log("Sending migration transaction...")
    const migrationSignature = await connection.sendRawTransaction(migrateTx.transaction.serialize(), {
      skipPreflight: false,
      maxRetries: 3,
    })
    await confirmTransactionWithTimeout(migrationSignature, "Migration")
    signatures.push(migrationSignature)

    // Send tip transaction with fresh blockhash
    console.log("Sending tip transaction...")
    await prepareTransaction(tipTx, [wallet])
    const tipSignature = await connection.sendRawTransaction(tipTx.serialize(), {
      skipPreflight: false,
      maxRetries: 3,
    })
    await confirmTransactionWithTimeout(tipSignature, "Tip")
    signatures.push(tipSignature)

    console.log(`DAMM V2 migration completed for token ${tokenMint}!`)
    return migrationSignature

  } catch (error) {
    console.error(`Failed to migrate token ${tokenMint} to DAMM V2:`, error)
    throw error
  }
}
