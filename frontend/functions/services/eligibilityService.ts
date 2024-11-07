import { DrizzleD1Database } from "drizzle-orm/d1/driver"
import { and, eq } from "drizzle-orm"

import { EligibilityStatus, Quest, QuestWithCompletion, TierWithCompletion } from "../../shared/eligibilityModel"
import { followerTable, nftIndexTable, projectTable, userTable, whitelistTable } from "../../shared/drizzle-schema"

/**
 * List of mandatory compliances.
 * Mandatory for each user, regardless if they are whitelisted manually.
 * Return SUM investment.
 * SqlQuery: SELECT SUM(json -> 'investmentIntent' -> 'puffer-finance' -> 'amount') FROM user;
 */
const MANDATORY_COMPLIANCES: Quest[] = [
  {
    type: 'ACCEPT_TERMS_OF_USE',
  },
  {
    type: 'PROVIDE_INVESTMENT_INTENT',
  }
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
const getEligibilityStatus = async ({ db, address, projectId, rpcUrl }: GetEligibilityStatusArgs): EligibilityStatus => {
  let user = await db
    .select()
    .from(userTable)
    .where(eq(userTable.address, address))
    .get()

  if (!user) user = {
    wallet_address: address,
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
  for (const quest of MANDATORY_COMPLIANCES) {
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
    } else {
      throw new Error(`Unknown compliance type (${quest.type})!`)
    }
  }

  const tiersWithCompletion: TierWithCompletion[] = []
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
        // TODO @productionPush commented this out for now as it does not work for NFTs for some reason, and currently we have only NFTs
        // const balance = await getSplTokenBalance({
        //   address,
        //   tokenAddress: quest.tokenMintAddress,
        //   rpcUrl,
        // })
        // if (balance) {
        //   const balanceAmount = Number(balance.amount) / (10 ** balance.decimals)
        //   const neededAmount = Number(quest.tokenAmount)
        //
        //   const holdsEnoughToken = balanceAmount >= neededAmount
        //   tierQuestsWithCompletion.push({
        //     ...quest,
        //     holds: balanceAmount,
        //     needs: neededAmount,
        //     isCompleted: holdsEnoughToken,
        //   })
        // } else {
        //   tierQuestsWithCompletion.push({
        //     ...quest,
        //     isCompleted: false,
        //   })
        // }
        const nft = await db
          .select()
          .from(nftIndexTable)
          .where(
            and(
              eq(nftIndexTable.collectionAddress, quest.tokenMintAddress),
              eq(nftIndexTable.ownerAddress, address)
            )
          )
          .get()

        // const owner = await getAssetOwner({
        //   tokenAddress: quest.tokenMintAddress,
        //   rpcUrl,
        // })
        const isOwner = Boolean(nft)
        tierQuestsWithCompletion.push({
          ...quest,
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

    const isTierCompleted = tierQuestsWithCompletion.every(quest => quest.isCompleted)
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

  const isCompliant = compliancesWithCompletion.every(quest => quest.isCompleted)
  // user must be compliant to be eligible
  const eligibilityTier = isCompliant
    // if user is manually whitelisted
    ? Boolean(whitelistedTier)
      // load the whitelisted tier
      ? whitelistedTier
      // else, check if they have tiered by completing quests
      : (tiersWithCompletion.findLast(tier => tier.isCompleted) ?? null)
    : null
  const isEligible = Boolean(eligibilityTier)

  return {
    address,

    isTwitterAccountConnected,

    whitelistTierId,
    whitelistedTier,

    isEligible,
    eligibilityTier,
    compliances: compliancesWithCompletion,
    tiers: tiersWithCompletion
  }
}

export const EligibilityService = {
  getEligibilityStatus,
}
