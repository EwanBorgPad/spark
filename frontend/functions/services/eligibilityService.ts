import { EligibilityStatus, Quest, QuestWithCompletion, TierWithCompletion } from "../../shared/eligibilityModel"
import { UserService } from "./userService"
import { ProjectService } from "./projectService"
import { getSplTokenBalance } from "../../shared/SolanaWeb3"

/**
 * List of mandatory compliances.
 * Mandatory for each user, regardless if they are whitelisted manually.
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
  db: D1Database
  address: string
  projectId: string
}
const getEligibilityStatus = async ({ db, address, projectId }: GetEligibilityStatusArgs): EligibilityStatus => {
  let user = await UserService.findUserByAddress({ db, address })
  if (!user) user = {
    wallet_address: address,
    json: {}
  }

  const project = await ProjectService.findProjectByIdOrFail({ db, id: projectId })

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
  for (const tier of project.info.tiers) {
    const tierQuestsWithCompletion: QuestWithCompletion[] = []

    for (const quest of tier.quests) {
      if (quest.type === 'FOLLOW_ON_TWITTER') {
        const twitterHandle = quest.twitterHandle
        const isFollowingProjectOnTwitter = Boolean(user.json.twitter?.follows[twitterHandle])
        tierQuestsWithCompletion.push({
          ...quest,
          isCompleted: isFollowingProjectOnTwitter,
        })
      } else if (quest.type === 'HOLD_TOKEN') {
        const balance = await getSplTokenBalance({
          address,
          tokenAddress: quest.tokenMintAddress,
        })

        if (balance) {
          const balanceAmount = Number(balance.amount) / (10 ** balance.decimals)
          const neededAmount = Number(quest.tokenAmount)

          const holdsEnoughToken = balanceAmount >= neededAmount
          tierQuestsWithCompletion.push({
            ...quest,
            holds: balanceAmount,
            needs: neededAmount,
            isCompleted: holdsEnoughToken,
          })
        } else {
          tierQuestsWithCompletion.push({
            ...quest,
            isCompleted: false,
          })
        }
      } else {
        throw new Error(`Unknown tier quest type (${quest.type})!`)
      }
    }

    const isTierCompleted = tierQuestsWithCompletion.every(quest => quest.isCompleted)
    tiersWithCompletion.push({
      ...tier,
      quests: tierQuestsWithCompletion,
      isTierCompleted: isTierCompleted,
    })
  }

  // TODO @manualWhitelist also account for those users
  const isCompliant = compliancesWithCompletion.every(quest => quest.isCompleted)
  const eligibilityTier = isCompliant
    ? (tiersWithCompletion.findLast(tier => tier.isCompleted) ?? null)
    : null
  const isEligible = Boolean(eligibilityTier)

  return {
    isEligible,
    eligibilityTier,
    compliances: compliancesWithCompletion,
    tiers: tiersWithCompletion
  }
}

export const EligibilityService = {
  getEligibilityStatus,
}
