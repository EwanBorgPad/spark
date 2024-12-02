import { ProjectModel } from "../models"
import { formatCurrencyAmount } from "../../src/utils/format"

type Props = { projectData: ProjectModel; borgCoinInput: number | null; borgPriceInUSD: number | null }

export const calculateTokens = ({ projectData, borgCoinInput, borgPriceInUSD }: Props) => {
  const tokenPriceInUSD = projectData.info.tge.fixedTokenPriceInUSD //
  const tokenPriceInBORG = !borgPriceInUSD ? null : tokenPriceInUSD / borgPriceInUSD

  const getLpPositions = () => {
    if (!borgCoinInput || !tokenPriceInBORG || !tokenPriceInUSD || !borgPriceInUSD)
      return {
        tokenLp: { formatted: "0", unformatted: null },
        borgLp: { formatted: "0", unformatted: null },
      }

    const tokenLpUnformatted = +borgCoinInput / 2 / tokenPriceInBORG
    const borgLpUnformatted = +borgCoinInput / 2
    return {
      tokenLp: {
        formatted: formatCurrencyAmount(tokenLpUnformatted, false) || "0",
        unformatted: tokenLpUnformatted,
        usd: formatCurrencyAmount(tokenLpUnformatted * tokenPriceInUSD, true),
      },
      borgLp: {
        formatted: formatCurrencyAmount(borgLpUnformatted, false) || "0",
        unformatted: borgLpUnformatted,
        usd: formatCurrencyAmount(borgLpUnformatted * borgPriceInUSD, true),
      },
    }
  }

  const getTokenRewards = () => {
    if (!borgCoinInput || !tokenPriceInBORG || !borgPriceInUSD) return { formatted: "0", unformatted: null }

    // total tokens reserved for reward distribution
    const totalTokensForRewardDistribution = projectData.info.totalTokensForRewardDistribution

    // token pool size value in dollars is equivalent to BORG pool size, which is the raise target
    const tokenPoolSize = projectData.info.tge.raiseTarget

    // 1 dollar invested gives this much reward tokens
    const oneInvestedDollarGives = totalTokensForRewardDistribution / tokenPoolSize

    // 1 BORG invested gives this much reward tokens
    const oneInvestedBorgGives = borgPriceInUSD * oneInvestedDollarGives

    // total invested BORG gives this much reward tokens
    const totalInvestedBorgGives = +borgCoinInput * oneInvestedBorgGives

    return {
      unformatted: totalInvestedBorgGives,
      formatted: formatCurrencyAmount(totalInvestedBorgGives, false) || "0",
      usd: tokenPriceInUSD ? formatCurrencyAmount(totalInvestedBorgGives * tokenPriceInUSD, true) : "0",
    }
  }

  const liquidityPoolValues = getLpPositions()

  const getTotalTokensToBeReceived = () => {
    const totalTokensFromLiquidityPool = liquidityPoolValues.tokenLp?.unformatted || 0
    const totalTokensReceivedInRewardsDistribution = getTokenRewards().unformatted || 0
    const totalTargetToken = formatCurrencyAmount(
      totalTokensReceivedInRewardsDistribution + totalTokensFromLiquidityPool,
      false,
    )
    return totalTargetToken
  }

  const lpPosition = {
    borg: liquidityPoolValues.borgLp.formatted,
    borgInUSD: liquidityPoolValues.borgLp.usd,
    token: liquidityPoolValues.tokenLp.formatted,
    tokenInUSD: liquidityPoolValues.tokenLp.usd,
  }
  const rewardDistribution = {
    token: getTokenRewards().formatted,
    tokenInUSD: getTokenRewards().usd,
  }
  const totalToBeReceived = {
    borg: liquidityPoolValues.borgLp.formatted,
    token: getTotalTokensToBeReceived(),
  }

  return { lpPosition, rewardDistribution, totalToBeReceived }
}
