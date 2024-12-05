import { addDays } from "date-fns/addDays"
import { addMonths } from "date-fns/addMonths"

const currentMoment = new Date()

export type ContributionAndRewardsType = {
  // sections: Your Contribution and Your Rewards
  claimPositions: {
    mainPosition: {
      borg: {
        claimed: number
        total: number
      }
      projectTokens: {
        claimed: number
        total: number
      }
    }
    rewards: {
      totalTokens: number
      claimedTokens: number
      payoutSchedule: PayoutScheduleType[]
    }
  }
}

export type PayoutScheduleType = {
  date: Date
  amount: number
  isClaimed: boolean
}

export const dummyPayoutScheduleData: PayoutScheduleType[] = [
  ...Array(12).keys(),
].map((index) => {
  return {
    amount: 100,
    isClaimed: index < 3,
    date: addMonths(addDays(currentMoment, -1), -10 + index),
  }
})

export const contributionAndRewardsData: ContributionAndRewardsType = {
  claimPositions: {
    mainPosition: {
      borg: {
        claimed: 2904.741,
        total: 3600,
      },
      projectTokens: {
        claimed: 2904.741,
        total: 3600,
      },
    },
    rewards: {
      claimedTokens: 300,
      totalTokens: 3600,
      payoutSchedule: dummyPayoutScheduleData,
    },
  },
}
