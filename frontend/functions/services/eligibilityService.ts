import { DrizzleD1Database } from "drizzle-orm/d1/driver"
import { and, eq } from "drizzle-orm"

import { EligibilityStatus, Quest, QuestWithCompletion, TierWithCompletion } from "../../shared/eligibilityModel"
import { followerTable, projectTable, userTable, whitelistTable } from "../../shared/drizzle-schema"
import { getTokenHoldingsMap, isHoldingNftFromCollections } from "../../shared/solana/searchAssets"

/**
 * List of mandatory compliances.
 * Mandatory for each user, regardless if they are whitelisted manually.
 * Return SUM investment.
 * SqlQuery: SELECT SUM(json -> 'investmentIntent' -> 'puffer-finance' -> 'amount') FROM user;
 */
const COMPLIANCES: Quest[] = [
  {
    type: 'ACCEPT_TERMS_OF_USE',
  },
  {
    type: 'PROVIDE_INVESTMENT_INTENT',
  },
  // {
  //   type: 'REFERRAL',
  //   isOptional: true,
  // },
]


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
  for (const quest of COMPLIANCES) {
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
    } else {
      throw new Error(`Unknown compliance type (${quest.type})!`)
    }
  }

  const collections: string[] = project.json.info.tiers
    .map(tier => tier.quests)
    .flat()
    .filter(quest => quest.type === 'HOLD_TOKEN')
    .map(quest => quest.tokenMintAddress)

  const collectionMap = await isHoldingNftFromCollections({
    rpcUrl,
    ownerAddress: address,
    collections,
  })

  const fungibles = await getTokenHoldingsMap({
    rpcUrl,
    ownerAddress: address,
  })

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
          holdTokenType,
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

    whitelistTierId,
    whitelistedTier,

    isCompliant,

    isEligible,
    eligibilityTier,
    compliances: compliancesWithCompletion,
    tiers: tiersWithCompletion
  }
}

export const EligibilityService = {
  getEligibilityStatus,
}
