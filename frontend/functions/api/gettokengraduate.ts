import { jsonResponse, reportError } from "./cfPagesFunctionsUtils"
import { drizzle } from "drizzle-orm/d1"
import { Connection, PublicKey, Keypair } from "@solana/web3.js"
import { DynamicBondingCurveClient, deriveDbcPoolAddress } from "@meteora-ag/dynamic-bonding-curve-sdk"
import { SplGovernance } from "governance-idl-sdk"
import BN from "bn.js"
import bs58 from "bs58"
import { eq, or, isNull } from "drizzle-orm"
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"

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
          const daoSignature = await createDaoForToken({
            tokenName: token.name,
            tokenMint: token.mint,
            wallet,
            connection
          })

          // Update token record with DAO signature
          await rawDb
            .prepare("UPDATE tokens SET dao = ?1 WHERE mint = ?2")
            .bind(daoSignature, token.mint)
            .run()

          results.push({
            tokenMint: token.mint,
            tokenName: token.name,
            poolAddress: poolAddress.toBase58(),
            curveProgress,
            graduated: true,
            daoCreated: true,
            daoSignature
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

  const realmPubKey = createRealmInstruction.keys[0].pubkey

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

  // Wait for confirmation
  await connection.confirmTransaction(signature, 'confirmed')

  console.log(`DAO created for token ${tokenMint} with signature: ${signature}`)
  return signature
}
