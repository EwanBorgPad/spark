import { formatCurrencyAmount } from "@/utils/format"
import { Icon } from "@/components/Icon/Icon"
import { PastOrders } from "./PastOrders"

import { ContributionType } from "@/data/contributionData"
import { useProjectDataContext } from "@/hooks/useProjectData"
import { ExpandedTimelineEventType } from "@/components/Timeline/Timeline"
import { formatDateForDisplay } from "@/utils/date-helpers"

type YourContributionProps = {
  contributionInfo: ContributionType
  eventData: ExpandedTimelineEventType
}
const YourContribution = ({
  contributionInfo,
  eventData,
}: YourContributionProps) => {
  const { projectData } = useProjectDataContext()

  return (
    <div className="flex w-full max-w-[400px] flex-col items-center gap-6">
      <div className="flex items-center gap-2 text-xl font-semibold">
        <Icon icon="SvgBorgCoin" />
        <span className="font-geist-mono">
          {formatCurrencyAmount(contributionInfo.suppliedBorg.total, false, 6)}
        </span>
        <span>BORG</span>
      </div>
      <PastOrders label="All Orders" className="w-full" />
      <hr className="mt-4 w-full max-w-[227px] border-bd-primary" />
      <span className="text-base font-semibold">Total to be received</span>

      <div className="border-t-none relative w-full max-w-[400px] items-center gap-2.5 rounded-lg border border-bd-primary">
        <div className="relative flex flex-col items-center gap-1 border-b-[1px] border-b-bd-primary px-3 pb-4 pt-6">
          <span className="mb-1 text-xs">Your Main Position</span>
          <div className="flex h-fit flex-wrap items-center gap-2 rounded-full text-base font-medium">
            <Icon icon="SvgBorgCoin" />
            <span className="font-geist-mono text-base">
              {contributionInfo.suppliedBorg.total}
            </span>
            <span className="font-geist-mono">BORG</span>
            <div className="flex items-center gap-2">
              <Icon
                icon="SvgPlus"
                className="text-base text-fg-disabled opacity-50"
              />
              <img
                src={projectData.tge.projectCoin.iconUrl}
                className="h-4 w-4 object-cover"
              />
              <span className="font-geist-mono text-base">
                {contributionInfo.reward.mainPosition.tokens}
              </span>
              <span className="font-geist-mono text-base">
                {projectData.tge.projectCoin.ticker}
              </span>
            </div>
          </div>
          <div className="flex h-fit items-center gap-1.5 rounded-full text-xs text-fg-primary ">
            <img
              src={projectData.tge.lockupDetails.liquidityPool.imgUrl}
              className="h-4 w-4 object-cover"
            />
            <span className="opacity-50">
              {projectData.tge.lockupDetails.liquidityPool.name}
            </span>
            <span className="opacity-50">Liquidity Pool,</span>
            <span className="opacity-50">
              {projectData.tge.lockupDetails.description}
            </span>
          </div>
          <span className="text-xs">
            Unlocks on {formatDateForDisplay(eventData.nextEventDate)}
          </span>

          <div className="absolute -bottom-[10px] bg-default p-[2px]">
            <Icon
              icon="SvgPlus"
              className="text-base text-fg-disabled opacity-50"
            />
          </div>
        </div>

        <div className="flex flex-col items-center gap-1 px-3 pb-6 pt-4">
          <span className="mb-1 text-xs">Your Reward</span>

          <div className="flex h-fit items-center gap-1.5 rounded-full text-xs font-medium text-fg-primary ">
            <img
              src={projectData.tge.projectCoin.iconUrl}
              className="h-4 w-4 object-cover"
            />
            <span className="font-geist-mono text-base">
              {contributionInfo.reward.yourReward.tokens}
            </span>
            <span className="font-geist-mono text-base">
              {projectData.tge.projectCoin.ticker}
            </span>
          </div>
          <div className="flex h-fit items-center gap-1.5 rounded-full text-xs text-fg-primary ">
            <span className="opacity-50">
              {contributionInfo.reward.yourReward.rewardPayoutType}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default YourContribution
