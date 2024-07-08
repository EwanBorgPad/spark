import { addDays } from "date-fns/addDays"
import { LockupDetails } from "./projectData"
import raydiumImg from "@/assets/raydium.png"

const currentMoment = new Date()

export type ContributionType = {
  suppliedBorg: {
    total: 1200
    pastOrders: {
      borgAmount: number
      date: Date
      // externalLink will be url of the transaction on the block explorer
      externalLink: string
    }[]
  }
  // section Your Contribution and Your Rewards
  claimPositions: {
    mainPosition: {
      borgAmount: number
      tokens: number
      lockupDetails: LockupDetails
    }
    rewards: {
      totalTokens: number
      claimedTokens: number
      rewardPayoutType: string
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
      date: addDays(currentMoment, -4 + index),
    }
  },
)

export const contributionData: ContributionType = {
  suppliedBorg: {
    total: 1200,
    pastOrders: [
      {
        borgAmount: 3813.35,
        date: addDays(currentMoment, -8),
        externalLink: "#",
      },
      {
        borgAmount: 110.1,
        date: addDays(currentMoment, -7),
        externalLink: "#",
      },
      {
        borgAmount: 240.891,
        date: addDays(currentMoment, -6),
        externalLink: "#",
      },
      {
        borgAmount: 440.4,
        date: addDays(currentMoment, -5),
        externalLink: "#",
      },
    ],
  },
  claimPositions: {
    mainPosition: {
      borgAmount: 1200,
      tokens: 1200,
      lockupDetails: {
        description: "12 month lockup",
        liquidityPool: {
          name: "Raydium",
          imgUrl: raydiumImg,
        },
      },
    },
    rewards: {
      claimedTokens: 1200,
      totalTokens: 2000,
      rewardPayoutType: "linearly paid-out through 12 months",
      payoutSchedule: dummyPayoutScheduleData,
    },
  },
}

