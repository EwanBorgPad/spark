import { addDays } from "date-fns/addDays"
import { LockupDetails } from "./projectData"
import { addMonths } from "date-fns"
import { subDays } from "date-fns/subDays"

const currentMoment = new Date()

export type ContributionAndRewardsType = {
  suppliedBorg: {
    total: 1200
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
      lockupDetails: LockupDetails
    }
    rewards: {
      totalTokens: number
      claimedTokens: number
      rewardTypeDescription: string
      payoutSchedule: PayoutScheduleType[]
    }
  }
}

export type PayoutScheduleType = {
  date: Date
  amount: number
  isClaimed: boolean
}

const dummyPayoutScheduleData: PayoutScheduleType[] = [...Array(12).keys()].map(
  (index) => {
    return {
      amount: 100,
      isClaimed: index < 3,
      date: addMonths(subDays(currentMoment, 1), -10 + index),
    }
  },
)

export const contributionAndRewardsData: ContributionAndRewardsType = {
  suppliedBorg: {
    total: 1200,
    pastOrders: [
      {
        borgAmount: 3813.35,
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
        claimed: 1013,
        total: 1200,
      },
      projectTokens: {
        claimed: 1013,
        total: 1200,
      },
      lockupDetails: {
        description: "12 month lockup",
        liquidityPool: {
          name: "Raydium",
          imgUrl: '/images/puffer-finance/raydium.png',
        },
      },
    },
    rewards: {
      claimedTokens: 300,
      totalTokens: 1200,
      rewardTypeDescription: "linearly paid-out through 12 months",
      payoutSchedule: dummyPayoutScheduleData,
    },
  },
}
