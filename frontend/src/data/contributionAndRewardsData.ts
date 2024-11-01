import { addDays } from "date-fns/addDays"
import { addMonths } from "date-fns/addMonths"

const currentMoment = new Date()

export type ContributionAndRewardsType = {
  suppliedBorg: {
    total: number
    pastOrders: {
      borgAmount: number
      date: Date
      transactionUrl: string // block explorer transaction url
    }[]
  }
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
  suppliedBorg: {
    total: 3600,
    pastOrders: [
      {
        borgAmount: 2113.35,
        date: addDays(currentMoment, -8),
        transactionUrl: "#",
      },
      {
        borgAmount: 110.1,
        date: addDays(currentMoment, -7),
        transactionUrl: "#",
      },
      {
        borgAmount: 240.891,
        date: addDays(currentMoment, -6),
        transactionUrl: "#",
      },
      {
        borgAmount: 440.4,
        date: addDays(currentMoment, -5),
        transactionUrl: "#",
      },
    ],
  },
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
