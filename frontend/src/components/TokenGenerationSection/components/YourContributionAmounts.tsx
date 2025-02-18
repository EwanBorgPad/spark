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
  const { address } = useWalletContext()
  const projectId = projectData?.id || ""

  const tokenTicker = projectData?.config.launchedTokenData.ticker
  const tokenIcon = projectData?.config.launchedTokenData.iconUrl

  const { data: userPositions } = useQuery({
    queryFn: () => {
      if (!address || !projectId) return
      return backendApi.getMyRewards({ address, projectId })
    },
    queryKey: ["getMyRewards", address, projectId],
    enabled: Boolean(address) && Boolean(projectId),
  })

  if (!projectData || !userPositions?.hasUserInvested) return <></>


  const numberOfMonths = projectData.config.rewardsDistributionTimeInMonths
  const remainingMonths = projectData.config.rewardsDistributionTimeInMonths - 1

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
              <span>{t("tge.linearly_paid_out", { numberOfMonths, remainingMonths })}</span>
            </div>
            <span className="text-xs font-medium text-fg-tertiary">🔒 LP position permanently locked </span>
            <span className="text-xs font-medium text-fg-tertiary">🔥 All LP fees burned</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default YourContributionAmounts
