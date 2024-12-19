import { Icon } from "@/components/Icon/Icon"
import Img from "@/components/Image/Img"
import { useProjectDataContext } from "@/hooks/useProjectData"
import { twMerge } from "tailwind-merge"
import { useTranslation } from "react-i18next"
import { useQuery } from "@tanstack/react-query"
import { useWalletContext } from "@/hooks/useWalletContext"
import { backendApi } from "@/data/backendApi"
import { formatCurrencyAmount } from "../../../../shared/utils/format.ts"

const YourContributionAmounts = () => {
  const { t } = useTranslation()
  const { projectData } = useProjectDataContext()
  const tgeData = projectData?.info.tge
  const { address } = useWalletContext()
  const projectId = projectData?.info.id || ""
  const tokenTicker = tgeData?.projectCoin.ticker
  const tokenIcon = tgeData?.projectCoin.iconUrl

  const { data: userPositions } = useQuery({
    queryFn: () => {
      if (!address || !projectId) return
      return backendApi.getMyRewards({ address, projectId })
    },
    queryKey: ["getMyRewards", address, projectId],
    enabled: Boolean(address) && Boolean(projectId),
  })

  if (!projectData || !userPositions?.hasUserInvested) return <></>

  if (projectData.info.lpPositionToBeBurned) {
    return (
      <div className="w-full bg-transparent">
        <div
          className={twMerge(
            "border-t-none relative w-full max-w-[400px] items-center gap-2.5 rounded-lg border border-bd-primary bg-tertiary bg-transparent",
          )}
        >
          {/* TOP SECTION - Distributed Rewards */}
          <div className="item-center relative flex flex-col gap-3 px-3 py-4">
            {/* TOP section token values */}

            <div className="flex h-fit items-start justify-center gap-2 rounded-full text-xs font-medium text-fg-primary">
              <Img src={tokenIcon} size="4" customClass="mt-1" isRounded />
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">{formatCurrencyAmount(userPositions.rewards.totalAmount.uiAmount)}</span>
                  <span className="text-base">{tokenTicker}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div className="flex h-fit items-center justify-center gap-1.5 rounded-full text-xs font-medium text-fg-tertiary ">
                <Icon icon="SvgChartLine" className="text-base text-white" />
                <span>{t("tge.linearly_paid_out")}</span>
              </div>
              <span className="text-xs font-medium text-fg-tertiary">🔒 LP position permanently locked </span>
              <span className="text-xs font-medium text-fg-tertiary">🔥 All LP fees burned</span>
            </div>
          </div>
        </div>
      </div>
    )
  }
  // RETURN IF TOKEN IS NOT GETTING BURNED
  return (
    <div className="w-full bg-transparent">
      <div
        className={twMerge(
          "border-t-none relative w-full max-w-[400px] items-center gap-2.5 rounded-lg border border-bd-primary bg-transparent",
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
                  <span className="text-base">
                    {formatCurrencyAmount(userPositions.lpPosition.raisedTokenAmount.uiAmount, { customDecimals: 2 })}
                  </span>
                  <span>BORG</span>
                </div>
              </div>
            </div>

            <Icon icon="SvgPlus" className="mt-1 text-base text-fg-disabled opacity-50" />

            <div className="flex gap-2">
              <Img src={tokenIcon} size="4" customClass="mt-1" isRounded />
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-2">
                  {/* Liquidity pool $[TOKEN] */}
                  <span className="text-base">
                    {formatCurrencyAmount(userPositions.lpPosition.launchedTokenAmount.uiAmount)}
                  </span>
                  <span className="text-base">{tokenTicker}</span>
                </div>
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
          <div className={twMerge("absolute -bottom-[10px] rounded-full bg-default p-[2px]")}>
            <Icon icon="SvgPlus" className="text-base text-fg-disabled opacity-50" />
          </div>
        </div>

        {/* MID SECTION - Distributed Rewards */}
        <div className="item-start flex flex-col gap-3 border-b-bd-primary p-3">
          {/* mid section token values */}
          <div className="flex h-fit items-start gap-2 rounded-full text-xs font-medium text-fg-primary ">
            <Img src={tokenIcon} size="4" customClass="mt-1" />
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-1.5">
                <span className="text-base">{formatCurrencyAmount(userPositions.rewards.totalAmount.uiAmount)}</span>
                <span className="text-base">{tokenTicker}</span>
              </div>
            </div>
          </div>
          {/* mid section - footer */}
          <div className="flex h-fit items-center gap-1.5 rounded-full text-xs font-normal text-fg-primary ">
            <Icon icon="SvgChartLine" className="text-base opacity-50" />
            <span className="opacity-50">{t("tge.linearly_paid_out")}</span>
          </div>
        </div>

        {/* BOTTOM SECTION - TOTAL TO BE RECEIVED */}
        {/* <div className="flex flex-col gap-2 p-3 text-sm">
          <span>Total</span>
          <div className="flex flex-wrap gap-2 font-medium text-fg-secondary">
            <span>{totalToBeReceived.raisedTokenAmount}</span>
            <span>{"BORG"}</span>
            <span>{"+"}</span>
            <span>{totalToBeReceived.launchedTokenAmount}</span>
            <span>{tokenTicker}</span>
          </div>
        </div> */}
      </div>
    </div>
  )
}

export default YourContributionAmounts
