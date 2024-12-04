import { useTranslation } from "react-i18next"

import { useProjectDataContext } from "@/hooks/useProjectData"
import { Icon } from "@/components/Icon/Icon"
import Img from "@/components/Image/Img"
import { formatCurrencyAmount } from "@/utils/format"

type TokenRewardsProps = {
  borgCoinInput: string
  tokenPriceInBORG: number | null
  borgPriceInUSD: number | null
  tokenPriceInUSD: number | null
}

const TokenRewards = ({ borgCoinInput, borgPriceInUSD, tokenPriceInBORG, tokenPriceInUSD }: TokenRewardsProps) => {
  const { t } = useTranslation()
  const { projectData } = useProjectDataContext()
  const tgeData = projectData?.info.tge
  const tokenTicker = tgeData?.projectCoin.ticker
  const tokenIcon = tgeData?.projectCoin.iconUrl

  const getLiquidityPoolValues = () => {
    if (!borgCoinInput || !tokenPriceInBORG || !tokenPriceInUSD || !borgPriceInUSD)
      return {
        tokenLp: { formatted: "0", unformatted: null },
        borgLp: { formatted: "0", unformatted: null },
      }

    // const totalTokensForLpPosition = projectData.info.totalTokensForSale

    // // token pool size value in dollars is equivalent to BORG pool size, which is the raise target
    // const tokenPoolSize = projectData.info.tge.raiseTarget

    // // 1 dollar invested gives this much tokens in LP
    // const oneInvestedDollarGives = totalTokensForLpPosition / tokenPoolSize

    // // 1 BORG invested gives this much reward tokens
    // const oneInvestedBorgGives = borgPriceInUSD * oneInvestedDollarGives

    // // total invested $BORG gives this much tokens in LP
    // const totalInvestedBorgGivesThisMuchLPTokens = +borgCoinInput * oneInvestedBorgGives

    // input is divided equally amongst token and borg lp values
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

  const getTokenReward = () => {
    if (!borgCoinInput || !tokenPriceInBORG || !borgPriceInUSD || !projectData)
      return { formatted: "0", unformatted: null }

    // new calculation
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

  const liquidityPoolValues = getLiquidityPoolValues()

  const getTotalTokensToBeReceived = () => {
    const totalTokensFromLiquidityPool = liquidityPoolValues.tokenLp?.unformatted || 0
    const totalTokensReceivedInRewardsDistribution = getTokenReward().unformatted || 0
    const totalTargetToken = formatCurrencyAmount(
      totalTokensReceivedInRewardsDistribution + totalTokensFromLiquidityPool,
      false,
    )
    return totalTargetToken
  }

  const totalLpPosition = {
    borg: liquidityPoolValues.borgLp.formatted,
    borgInUSD: liquidityPoolValues.borgLp.usd,
    token: liquidityPoolValues.tokenLp.formatted,
    tokenInUSD: liquidityPoolValues.tokenLp.usd,
  }
  const rewardDistribution = {
    token: getTokenReward().formatted,
    tokenInUSD: getTokenReward().usd,
  }
  const totalAssetsToBeReceived = {
    borg: liquidityPoolValues.borgLp.formatted,
    token: getTotalTokensToBeReceived(),
  }

  if (!projectData) return <></>

  if (projectData.info.lpPositionToBeBurned) {
    return (
      <div className="w-full bg-transparent">
        <div className="border-t-none relative w-full max-w-[400px] items-center gap-2.5 rounded-lg border border-bd-primary bg-tertiary ">
          {/* TOP SECTION - Distributed Rewards */}
          <div className="item-center relative flex flex-col gap-3 border-b-[1px] border-b-bd-primary px-3 py-4">
            {/* TOP section token values */}
            <span className="w-full text-center text-sm font-normal">Liquidity Provision Rewards</span>
            <div className="flex h-fit items-start justify-center gap-2 rounded-full text-xs font-medium text-fg-primary">
              <Img src={tokenIcon} size="4" customClass="mt-1" isRounded />
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">{rewardDistribution.token}</span>
                  <span className="text-base">{tokenTicker}</span>
                </div>

                {/* total reward distr. tokens value in USD */}
                <span className="text-sm font-normal text-fg-secondary">{rewardDistribution.tokenInUSD}</span>
              </div>
            </div>
            {/* TOP section - footer */}
            <div className="flex h-fit items-center justify-center gap-1.5 rounded-full text-xs font-normal text-fg-primary ">
              <Icon icon="SvgChartLine" className="text-base opacity-50" />
              <span className="opacity-50">{t("tge.linearly_paid_out")}</span>
            </div>

            {/* PLUS icon between sections */}
            <div className="absolute -bottom-[10px] left-[47%] bg-tertiary p-[2px]">
              <Icon icon="SvgPlus" className="text-base text-fg-disabled opacity-50" />
            </div>
          </div>

          {/* BOTTOM SECTION - Liquidity Pool */}
          <div className="flex flex-col items-center gap-3 px-3 py-4">
            <span className="text-sm font-normal text-fg-tertiary">LP Position - 100% Burned 🔥 </span>
            <div className="flex h-fit w-full flex-wrap items-start justify-center gap-4 rounded-full pb-1 text-base font-medium">
              {/* Liquidity pool $BORG */}
              <div className="flex gap-2">
                <Icon icon="SvgBorgCoin" className="mt-1 opacity-50" />
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-2 text-fg-tertiary">
                    <span className="text-base">{totalLpPosition.borg}</span>
                    <span>BORG</span>
                  </div>
                </div>
              </div>

              <Icon icon="SvgPlus" className="mt-1 text-base text-fg-tertiary opacity-50" />

              <div className="flex gap-2 text-fg-tertiary">
                <Img src={tokenIcon} size="4" customClass="mt-1 opacity-50" isRounded />
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-2">
                    {/* Liquidity pool $[TOKEN] */}
                    <span className="text-base">{totalLpPosition.token}</span>
                    <span className="text-base">{tokenTicker}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* label below container */}
        <span className="mt-[9px] block w-full text-center text-xs font-medium text-fg-primary opacity-50">
          $ values for {tokenTicker} are shown at TGE valuation price
        </span>
      </div>
    )
  }
  // RETURN IF TOKEN IS NOT GETTING BURNED
  return (
    <div className="w-full bg-transparent">
      <div className="border-t-none relative w-full max-w-[400px] items-center gap-2.5 rounded-lg border border-bd-primary bg-tertiary ">
        {/* TOP SECTION - Liquidity Pool */}
        <div className="relative flex flex-col items-center gap-3 border-b-[1px] border-b-bd-primary p-3">
          {/* top section */}
          <div className="flex h-fit w-full flex-wrap items-start gap-4 rounded-full pb-1 text-base font-medium">
            {/* Liquidity pool $BORG */}
            <div className="flex gap-2">
              <Icon icon="SvgBorgCoin" className="mt-1" />
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-2">
                  <span className="text-base">{totalLpPosition.borg}</span>
                  <span>BORG</span>
                </div>
                <span className="text-sm font-normal text-fg-tertiary">{totalLpPosition.borgInUSD}</span>
              </div>
            </div>

            <Icon icon="SvgPlus" className="mt-1 text-base text-fg-disabled opacity-50" />

            <div className="flex gap-2">
              <Img src={tokenIcon} size="4" customClass="mt-1" isRounded />
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-2">
                  {/* Liquidity pool $[TOKEN] */}
                  <span className="text-base">{totalLpPosition.token}</span>
                  <span className="text-base">{tokenTicker}</span>
                </div>
                <span className="text-sm font-normal text-fg-tertiary">{totalLpPosition.tokenInUSD}</span>
              </div>
            </div>
          </div>

          {/* top section footer */}
          <div className="flex h-fit w-full items-center gap-1.5 rounded-full text-xs font-normal text-fg-primary">
            <Icon icon="SvgLock" className="mt-[-1px] text-base opacity-50" />
            <span className="opacity-50">{t("tge.liquidity_pool")}</span>
            <Img src={tokenIcon} size="4" isRounded />
            <a href={tgeData?.liquidityPool.url} className="underline">
              <span className="opacity-50">{tgeData?.liquidityPool.name}</span>
            </a>
            <span className="-ml-1.5 opacity-50">, {tgeData?.liquidityPool.lockingPeriod}</span>
          </div>

          {/* Plus icon between top and mid sections */}
          <div className="absolute -bottom-[10px] bg-tertiary p-[2px]">
            <Icon icon="SvgPlus" className="text-base text-fg-disabled opacity-50" />
          </div>
        </div>

        {/* MID SECTION - Distributed Rewards */}
        <div className="item-start flex flex-col gap-3 border-b-[1px] border-b-bd-primary p-3">
          {/* mid section token values */}
          <div className="flex h-fit items-start gap-2 rounded-full text-xs font-medium text-fg-primary ">
            <Img src={tokenIcon} size="4" customClass="mt-1" />
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-1.5">
                <span className="text-base">{rewardDistribution.token}</span>
                <span className="text-base">{tokenTicker}</span>
              </div>
              <span className="text-sm font-normal text-fg-tertiary">{rewardDistribution.tokenInUSD}</span>
            </div>
          </div>
          {/* mid section - footer */}
          <div className="flex h-fit items-center gap-1.5 rounded-full text-xs font-normal text-fg-primary ">
            <Icon icon="SvgChartLine" className="text-base opacity-50" />
            <span className="opacity-50">{t("tge.linearly_paid_out")}</span>
          </div>
        </div>

        {/* BOTTOM SECTION - TOTAL TO BE RECEIVED */}
        <div className="flex flex-col gap-2 p-3 text-sm">
          <span>Total Rewards</span>
          <div className="flex flex-wrap gap-2 font-medium text-fg-secondary">
            <span>{totalAssetsToBeReceived.borg}</span>
            <span>{"BORG"}</span>
            <span>{"+"}</span>
            <span>{totalAssetsToBeReceived.token}</span>
            <span>{tokenTicker}</span>
          </div>
        </div>
      </div>

      {/* label below container */}
      <span className="mt-[9px] block w-full text-center text-xs font-medium text-fg-primary opacity-50">
        $ values for {tokenTicker} are shown at TGE valuation price
      </span>
    </div>
  )
}

export default TokenRewards
