import { DrizzleD1Database } from "drizzle-orm/d1/driver"
import { and, eq } from "drizzle-orm"

import { EligibilityStatus, Quest, QuestWithCompletion, TierWithCompletion } from "../../shared/eligibilityModel"
import { followerTable, projectTable, tokenBalanceTable, userTable, whitelistTable } from "../../shared/drizzle-schema"
import { getTokenHoldingsMap, isHoldingNftFromCollections } from "../../shared/solana/searchAssets"
import { SnapshotService } from "./snapshotService"
import { ProjectModel } from "../../shared/models"

const BorgTokenMintAddress: string = '3dQTr7ror2QPKQ3GbBCokJUmjErGg8kTJzdnYjNfvi3Z'

/**
 * List of mandatory compliances.
 * Mandatory for each user, regardless if they are whitelisted manually.
 * Return SUM investment.
 * SqlQuery: SELECT SUM(json -> 'investmentIntent' -> 'puffer-finance' -> 'amount') FROM user;
 */
const getCompliances = (project:ProjectModel):Quest[] => {
  const isDraftPick = project.info?.projectType === "draft-pick"
  return [
    {
      type: 'ACCEPT_TERMS_OF_USE',
    },
    {
      type: 'PROVIDE_INVESTMENT_INTENT',
      isOptional: !isDraftPick,
    },
    {
      type: 'PROVIDE_EMAIL',
    }
  ]
}


type GetEligibilityStatusArgs = {
  db: DrizzleD1Database
  address: string
  projectId: string
  rpcUrl: string
}
/**
 * Returns eligibility status for a user/project combo.
 * Main function for eligibility functionality.
 * Optimization: HOLD_TOKEN currently makes one RPC call per quest, which is not needed if that currency was already checked.
 *  Can be optimized by storing the amounts in memory during the check.
 *  Can be further optimized by caching the amounts in the database for some time.
 * @param db
 * @param address
 * @param projectId
 * @param rpcUrl
 */
const getEligibilityStatus = async ({ db, address, projectId, rpcUrl }: GetEligibilityStatusArgs): Promise<EligibilityStatus> => {
  const snapshot = await SnapshotService.getSnapshot({ db, address, projectId })
  if (snapshot) return snapshot

  let user = await db
    .select()
    .from(userTable)
    .where(eq(userTable.address, address))
    .get()

  if (!user) user = {
    address,
    json: {}
  }

  const userTwitterId = user.json.twitter?.twitterId ?? null
  const isTwitterAccountConnected = Boolean(userTwitterId)

  const project = await db
    .select()
    .from(projectTable)
    .where(eq(projectTable.id, projectId))
    .get()

  const compliancesWithCompletion: QuestWithCompletion[] = []
  const listOfCompliances = getCompliances(project.json)
  console.log(listOfCompliances);
  for (const quest of listOfCompliances) {
    if (quest.type === 'ACCEPT_TERMS_OF_USE') {
      const hasAcceptedTermsOfUse = Boolean(user.json.termsOfUse?.acceptedAt)
      compliancesWithCompletion.push({
        ...quest,
        isCompleted: hasAcceptedTermsOfUse,
      })
    } else if (quest.type === 'PROVIDE_INVESTMENT_INTENT') {
      const providedInvestmentIntentForProject = Boolean(user.json.investmentIntent?.[projectId])
      compliancesWithCompletion.push({
        ...quest,
        isCompleted: providedInvestmentIntentForProject,
      })
    } else if (quest.type === 'REFERRAL') {
      const providedReferralForProject = Boolean(user.json.referral?.[projectId])
      compliancesWithCompletion.push({
        ...quest,
        isCompleted: providedReferralForProject,
      })
    } else if (quest.type === 'PROVIDE_EMAIL') {
      const providedEmailForProject = Boolean(user.json.emailData?.providedAt)
      compliancesWithCompletion.push({
        ...quest,
        isCompleted: providedEmailForProject,
      })  
    } else {
      throw new Error(`Unknown compliance type (${quest.type})!`)
    }
  }
  console.log(compliancesWithCompletion);


  const collections: string[] = project.json.info.tiers
    .map(tier => tier.quests)
    .flat()
    .filter(quest => quest.type === 'HOLD_TOKEN')
    .map(quest => quest.tokenMintAddress)

  // optimization method -- skip nft check if there's no nft quests in the project
  const isNftCheckNeeded = project.json.info.tiers
    .some(tier => tier.quests
      // since we don't have separate types for fungible/non-fungible tokens, for now we consider any quest with tokenAmount=1 to be an nft quest
      .some(quest => quest.type === 'HOLD_TOKEN' && quest.tokenAmount === "1")
    )

  const collectionMap = isNftCheckNeeded
    ? await isHoldingNftFromCollections({
      rpcUrl,
      ownerAddress: address,
      collections,
    })
    : {}

  //// <option1 retrieve fungible token holdings from Helius RPC using SearchAssets DAO API
  // const fungibles = await getTokenHoldingsMap({
  //   rpcUrl,
  //   ownerAddress: address,
  // })
  //// <option2 retrieve borg token balance (currently only one that matters) from the database token balances
  const balance = await getTokenBalance({
    db,
    ownerAddress: address,
    tokenMintAddress: BorgTokenMintAddress,
  })
  const fungibles = { [BorgTokenMintAddress]: balance }
  // //// />

  const tiersWithCompletion: TierWithCompletion[] = []
  if (!project) throw new Error(`EligibilityService: Project (id=?) not found!`)
  for (const tier of project.json.info.tiers) {
    const tierQuestsWithCompletion: QuestWithCompletion[] = []

    for (const quest of tier.quests) {
      if (quest.type === 'FOLLOW_ON_TWITTER') {
        // TODO @twitterAcc
        const isFollower = isTwitterAccountConnected
          ? Boolean(
            await db
              .select()
              .from(followerTable)
              .where(eq(followerTable.id, userTwitterId))
              .get()
          )
          : false

        // const twitterHandle = quest.twitterHandle
        // const isFollowingProjectOnTwitter = Boolean(user.json.twitter?.follows?.[twitterHandle])

        tierQuestsWithCompletion.push({
          ...quest,
          isCompleted: isFollower,
        })
      } else if (quest.type === 'HOLD_TOKEN') {
        const holdTokenType = collectionMap[quest.tokenMintAddress]
          ? 'collection'
          : fungibles[quest.tokenMintAddress]
            ? 'fungible'
            : 'unknown'
        const isOwner = collectionMap[quest.tokenMintAddress] // >= Number(quest.tokenAmount)
          || (fungibles[quest.tokenMintAddress]?.uiAmount ?? 0) >= Number(quest.tokenAmount)

        tierQuestsWithCompletion.push({
          ...quest,
          // @ts-expect-error TS2353: Object literal may only specify known properties, and 'holdTokenType' does not exist in type
          holdTokenType,
          quotedAt: fungibles[quest.tokenMintAddress]?.quotedAt ?? null,
          holdingAmount: fungibles[quest.tokenMintAddress]?.uiAmount ?? 0,
          isCompleted: isOwner,
        })
      } else if (quest.type === 'WHITELIST') {
        // only way to complete this is to be explicitly whitelisted
        tierQuestsWithCompletion.push({
          ...quest,
          isCompleted: false,
        })
      } else {
        throw new Error(`Unknown tier quest type (${quest.type})!`)
      }
    }

    const questsOperator = tier.questsOperator || 'AND'
    const method = questsOperator === 'OR' ? 'some' : 'every'

    const isTierCompleted = tierQuestsWithCompletion[method](quest => quest.isCompleted)
    tiersWithCompletion.push({
      ...tier,
      quests: tierQuestsWithCompletion,
      isCompleted: isTierCompleted,
    })
  }

  const whitelist = await db
    .select()
    .from(whitelistTable)
    .where(
      and(
        eq(whitelistTable.address, address),
        eq(whitelistTable.projectId, projectId),
      )
    )
    .get()
  const whitelistTierId = whitelist?.tierId ?? null
  const whitelistedTier = whitelistTierId
    ? project.json.info.tiers.find(tier => tier.id === whitelistTierId)
    // silently fail if tier is not found
    : null

  // mark whitelisted tier and all its quests as completed
  for (const tier of tiersWithCompletion) {
    if (whitelistTierId === tier.id) {
      tier.isCompleted = true
      tier.quests.forEach(quest => quest.isCompleted = true)
    }
  }

  const isCompliant = compliancesWithCompletion
    .filter(quest => !quest.isOptional)
    .every(quest => quest.isCompleted)

  // user must be compliant in order to be eligible
  const eligibilityTier = isCompliant
    // find the best completed tier
    ? (tiersWithCompletion.find(tier => tier.isCompleted) ?? null)
    : null
  const isEligible = Boolean(eligibilityTier)

  return {
    address,

    isTwitterAccountConnected,
    isNftCheckNeeded,
    isCompliant,
    isEligible,
    whitelistTierId,
    
    whitelistedTier,
    eligibilityTier,
    compliances: compliancesWithCompletion,
    tiers: tiersWithCompletion,
  }
}

type GetTokenBalanceArgs = {
  db: DrizzleD1Database
  ownerAddress: string
  tokenMintAddress: string
}
/**
 * Retrieves token balance from the database
 */
const getTokenBalance = async ({ db, ownerAddress, tokenMintAddress }: GetTokenBalanceArgs): Promise<{ uiAmount: number, quotedAt?: string }> => {
  const balance = await db
    .select()
    .from(tokenBalanceTable)
    .where(
      and(
        eq(tokenBalanceTable.ownerAddress, ownerAddress),
        eq(tokenBalanceTable.tokenMintAddress, tokenMintAddress),
      )
    )
    .get()

  return balance 
    ? { uiAmount: Number(balance.uiAmount), quotedAt: balance.quotedAt }
    : { uiAmount: 0 }
}

export const EligibilityService = {
  getEligibilityStatus,
}
