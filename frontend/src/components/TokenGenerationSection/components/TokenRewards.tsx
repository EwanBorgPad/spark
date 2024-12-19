import { useTranslation } from "react-i18next"

import { useProjectDataContext } from "@/hooks/useProjectData"
import { Icon } from "@/components/Icon/Icon"
import Img from "@/components/Image/Img"
import { calculateTokens } from "../../../../shared/utils/calculateTokens"
import { twMerge } from "tailwind-merge"

type TokenRewardsProps = {
  borgCoinInput: string
  tokenPriceInBORG: number | null
  borgPriceInUSD: number | null
  tokenPriceInUSD: number | null
  isYourContribution?: boolean
}

const TokenRewards = ({ borgCoinInput, borgPriceInUSD, isYourContribution }: TokenRewardsProps) => {
  const { t } = useTranslation()
  const { projectData } = useProjectDataContext()
  const tgeData = projectData?.info.tge
  const tokenTicker = tgeData?.projectCoin.ticker
  const tokenIcon = tgeData?.projectCoin.iconUrl

  if (!projectData) return <></>

  // TODO return this from the backend (maybe a lot of work to change on frontend, at least create a backend api and prepare)
  const { lpPosition, rewardDistribution, totalToBeReceived } = calculateTokens({
    projectData,
    borgCoinInput: +borgCoinInput,
    borgPriceInUSD,
  })

  if (projectData.info.lpPositionToBeBurned) {
    return (
      <div className="w-full bg-transparent">
        <div
          className={twMerge(
            "border-t-none relative w-full max-w-[400px] items-center gap-2.5 rounded-lg border border-bd-primary bg-tertiary ",
            isYourContribution && "bg-transparent",
          )}
        >
          <div className="item-center relative flex flex-col gap-3 px-3 py-4">
            <div className="flex h-fit items-start justify-center gap-2 rounded-full text-xs font-medium text-fg-primary">
              <Img src={tokenIcon} size="4" customClass="mt-1" isRounded />
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">{rewardDistribution.token}</span>
                  <span className="text-base">{tokenTicker}</span>
                </div>
                {!isYourContribution && (
                  <span className="text-sm font-normal text-fg-secondary">{rewardDistribution.tokenInUSD}</span>
                )}
              </div>
            </div>

            <div className="flex flex-col items-center gap-1.5">
              <div className="flex h-fit items-center justify-center gap-1.5 rounded-full text-xs font-medium text-fg-tertiary ">
                <Icon icon="SvgChartLine" className="text-base" />
                <span>{t("tge.linearly_paid_out")}</span>
              </div>
              <span className="text-xs font-medium text-fg-tertiary">🔒 LP position permanently locked </span>
              <span className="text-xs font-medium text-fg-tertiary">🔥 All LP fees burned</span>
            </div>
          </div>
        </div>

        {/* label below container */}
        {!isYourContribution && (
          <span className="mt-[9px] block w-full text-center text-xs font-medium text-fg-primary opacity-50">
            $ values for {tokenTicker} are shown at TGE valuation price
          </span>
        )}
      </div>
    )
  }
  // RETURN IF TOKEN IS NOT GETTING BURNED
  return (
    <div className="w-full bg-transparent">
      <div
        className={twMerge(
          "border-t-none relative w-full max-w-[400px] items-center gap-2.5 rounded-lg border border-bd-primary bg-tertiary ",
          isYourContribution && "bg-transparent",
        )}
      >
        {/* TOP SECTION - Liquidity Pool */}
        <div className="relative flex flex-col items-center gap-3 border-b-[1px] border-b-bd-primary p-3">
          {/* top section */}
          <div className="flex h-fit w-full flex-wrap items-start gap-4 rounded-full pb-1 text-base font-medium">
            {/* Liquidity pool $BORG */}
            <div className="flex gap-2">
              <Icon icon="SvgBorgCoin" className="mt-1" />
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-2">
                  <span className="text-base">{lpPosition.borg}</span>
                  <span>BORG</span>
                </div>
                <span className="text-sm font-normal text-fg-tertiary">{lpPosition.borgInUSD}</span>
              </div>
            </div>

            <Icon icon="SvgPlus" className="mt-1 text-base text-fg-disabled opacity-50" />

            <div className="flex gap-2">
              <Img src={tokenIcon} size="4" customClass="mt-1" isRounded />
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-2">
                  {/* Liquidity pool $[TOKEN] */}
                  <span className="text-base">{lpPosition.token}</span>
                  <span className="text-base">{tokenTicker}</span>
                </div>
                <span className="text-sm font-normal text-fg-tertiary">{lpPosition.tokenInUSD}</span>
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
          <div
            className={twMerge(
              "absolute -bottom-[10px] rounded-full bg-tertiary p-[2px]",
              isYourContribution && "bg-default",
            )}
          >
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
            <span>{totalToBeReceived.borg}</span>
            <span>{"BORG"}</span>
            <span>{"+"}</span>
            <span>{totalToBeReceived.token}</span>
            <span>{tokenTicker}</span>
          </div>
        </div>
      </div>

      {/* label below container */}
      {!isYourContribution && (
        <span className="mt-[9px] block w-full text-center text-xs font-medium text-fg-primary opacity-50">
          $ values for {tokenTicker} are shown at TGE valuation price
        </span>
      )}
    </div>
  )
}

export default TokenRewards
