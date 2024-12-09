import { useTranslation } from "react-i18next"

import { ContributionAndRewardsType } from "@/data/contributionAndRewardsData"
import { ExpandedTimelineEventType } from "@/components/Timeline/Timeline"
import { useProjectDataContext } from "@/hooks/useProjectData"
import { formatDateForDisplay } from "@/utils/date-helpers"
import { formatCurrencyAmount } from "shared/utils/format"
import ClaimYourPosition from "./ClaimYourPosition"
import { Icon } from "@/components/Icon/Icon"
import { PastOrders } from "./PastOrders"
import { isBefore } from "date-fns/isBefore"
import Img from "@/components/Image/Img"
import Text from "@/components/Text"
import { useQuery } from "@tanstack/react-query"
import { backendApi } from "@/data/backendApi.ts"
import { useWalletContext } from "@/hooks/useWalletContext.tsx"

type YourContributionProps = {
  contributionInfo: ContributionAndRewardsType
  eventData: ExpandedTimelineEventType
}
const YourContribution = ({ contributionInfo, eventData }: YourContributionProps) => {
  const { t } = useTranslation()

  const { address } = useWalletContext()
  const { projectData, isLoading } = useProjectDataContext()
  const projectId = projectData?.info.id ?? ''

  const { data: getDepositsData } = useQuery({
    queryFn: () => {
      if (!address || !projectId) return
      return backendApi.getDeposits({
        address, projectId,
      })
    },
    queryKey: ["getDeposits", address, projectId],
    enabled: Boolean(address) && Boolean(projectId),
  })

  const { claimPositions: { mainPosition, rewards } } = contributionInfo
  const liquidityPool = projectData?.info.tge.liquidityPool
  const projectCoin = projectData?.info.tge.projectCoin

  const hasDistributionStarted =
    eventData.id === "REWARD_DISTRIBUTION" &&
    liquidityPool?.unlockDate &&
    isBefore(liquidityPool.unlockDate, new Date())

  const alreadyClaimedPercent = +((mainPosition.borg.claimed / mainPosition.borg.total) * 100).toFixed(2)

  const unlockDate = `${t("sale_over.unlocks_on")}
  ${liquidityPool?.unlockDate ? formatDateForDisplay(liquidityPool.unlockDate) : "TBC"}`

  return (
    <>
      <div className="flex items-center gap-2 text-xl font-semibold">
        <Icon icon="SvgBorgCoin" />
        {/* TODO skeleton loader */}
        <span>{formatCurrencyAmount(Number(getDepositsData?.total.uiAmount), false)}</span>
        <span>BORG</span>
      </div>
      <PastOrders label="All Orders" className="w-full" />
      <hr className="mt-4 w-full max-w-[227px] border-bd-primary" />
      <span className="text-base font-semibold">{t("sale_over.total_to_be_received")}</span>

      <div className="border-t-none relative z-10 w-full max-w-[400px] items-center gap-2.5 rounded-lg border border-bd-primary">
        <div className="relative flex flex-col items-center gap-1 border-b-[1px] border-b-bd-primary px-4 pb-4 pt-6">
          <span className="mb-1 text-xs">{t("sale_over.your_main_position")}</span>
          <div className="flex h-fit flex-wrap items-center gap-2 rounded-full text-base font-medium">
            <Icon icon="SvgBorgCoin" />
            <span className=" text-base">{getDepositsData?.total.uiAmount}</span>
            <span>BORG</span>
            <div className="flex items-center gap-2">
              <Icon icon="SvgPlus" className="text-base text-fg-disabled opacity-50" />
              <Img src={projectCoin?.iconUrl} size="4" isFetchingLink={isLoading} isRounded />
              <span className=" text-base">{mainPosition.projectTokens.total}</span>
              <Text text={projectCoin?.ticker} className="text-base" isLoading={isLoading} />
            </div>
          </div>
          <div className="flex h-fit items-center gap-1 rounded-full text-xs text-fg-primary ">
            <Img src={liquidityPool?.iconUrl} size="4" isFetchingLink={isLoading} isRounded />
            <a href={liquidityPool?.url} className="underline">
              <span className="opacity-50">{liquidityPool?.name}</span>
              <span className="opacity-50">{t("liquidity_pool")},</span>
            </a>
            <span className="opacity-50">{liquidityPool?.lockingPeriod}</span>
          </div>
          {hasDistributionStarted ? (
            <ClaimYourPosition alreadyClaimedPercent={alreadyClaimedPercent} mainPosition={mainPosition} />
          ) : (
            <Text text={unlockDate} className="text-xs" isLoading={isLoading} />
          )}

          <div className="absolute -bottom-[10px] bg-default p-[2px]">
            <Icon icon="SvgPlus" className="text-base text-fg-disabled opacity-50" />
          </div>
        </div>

        <div className="flex flex-col items-center gap-1 px-3 pb-6 pt-4">
          <span className="mb-1 text-xs">{t("sale_over.your_reward")}</span>
          <div className="flex h-fit items-center gap-1.5 rounded-full text-xs font-medium text-fg-primary ">
            <Img src={projectCoin?.iconUrl} isFetchingLink={isLoading} isRounded size="4" />
            <span className=" text-base">{rewards.totalTokens}</span>
            <span className=" text-base">{projectCoin?.ticker}</span>
          </div>
          <div className="flex h-fit items-center gap-1.5 rounded-full text-xs text-fg-primary ">
            <Text text={projectData?.rewards?.description} isLoading={isLoading} className="opacity-50" />
          </div>
        </div>
      </div>
    </>
  )
}

export default YourContribution
