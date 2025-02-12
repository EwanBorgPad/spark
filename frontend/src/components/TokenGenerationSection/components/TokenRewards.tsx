import { useTranslation } from "react-i18next"

import { useProjectDataContext } from "@/hooks/useProjectData"
import { Icon } from "@/components/Icon/Icon"
import Img from "@/components/Image/Img"
import { calculateTokens } from "../../../../shared/utils/calculateTokens"
import { twMerge } from "tailwind-merge"

type TokenRewardsProps = {
  raisedTokenInput: string
  raisedTokenPriceInUSD: number | null
  tokenPriceInUSD: number | null
  isYourContribution?: boolean
}

const TokenRewards = ({ raisedTokenInput, raisedTokenPriceInUSD, isYourContribution }: TokenRewardsProps) => {
  const { t } = useTranslation()
  const { projectData } = useProjectDataContext()
  const tokenTicker = projectData?.config.launchedTokenData.ticker
  const tokenIcon = projectData?.config.launchedTokenData.iconUrl

  if (!projectData) return <></>

  // TODO return this from the backend (maybe a lot of work to change on frontend, at least create a backend api and prepare)
  const { rewardDistribution } = calculateTokens({
    projectData,
    borgCoinInput: +raisedTokenInput,
    borgPriceInUSD: raisedTokenPriceInUSD,
  })

  const numberOfMonths = projectData.config.rewardsDistributionTimeInMonths
  const remainingMonths = projectData.config.rewardsDistributionTimeInMonths - 1

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
              <span>{t("tge.linearly_paid_out", { numberOfMonths, remainingMonths })}</span>
            </div>
            <span className="text-xs font-medium text-fg-tertiary">🔒 LP position permanently locked </span>
            <span className="text-xs font-medium text-fg-tertiary">🔥 All BORG fees burned</span>
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
