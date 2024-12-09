import { addMonths } from "date-fns/addMonths"

// TODO @deprecate this whole file

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
  date: string | Date
  amount: number
  isClaimed: boolean
}

export const dummyPayoutScheduleData: PayoutScheduleType[] = [
  ...Array(6).keys(),
].map((index) => {
  // @hardcoded
  const payoutDate = addMonths(new Date('2024-12-20'), index)
  const isClaimed = payoutDate < new Date()
  return {
    amount: 600,
    isClaimed,
    date: payoutDate,
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
