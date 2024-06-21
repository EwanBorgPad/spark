import { LiquidityPoolDetails } from "./data"

export type ContributionType = {
  borgAmount: number
  totalToBeReceived: {
    mainPosition: {
      borgAmount: number
      tokens: number
      liquidityPoolDetails: LiquidityPoolDetails
    }
    yourReward: {
      tokens: number
      rewardPayoutType: string
    }
  }
}

export const contributionData = {}
