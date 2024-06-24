import { formatCurrencyAmount } from "@/utils/format"
import { Icon } from "@/components/Icon/Icon"
import { PastOrders } from "./PastOrders"

import { ContributionType } from "@/data/contributionData"

type YourContributionProps = {
  contributionInfo: ContributionType
}
const YourContribution = ({ contributionInfo }: YourContributionProps) => {
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
      <div className="border-t-none relative w-full max-w-[400px] items-center gap-2.5 rounded-lg border border-bd-primary bg-tertiary ">
        <div className="border-b-[1px] border-b-bd-primary px-3 py-2">
          <div className="flex h-fit flex-wrap items-center gap-2 rounded-full pb-1 text-base font-medium">
            <Icon icon="SvgBorgCoin" />
            <span className="font-geist-mono text-base">
              {contributionInfo.suppliedBorg.total}
            </span>
            <span className="font-geist-mono">BORG</span>
            <div className="flex items-center gap-2">
              <span className="font-normal opacity-50">+</span>
              <img
                src={""}
                // src={tgeData.projectCoin.iconUrl}
                className="h-4 w-4 object-cover"
              />
              <span className="font-geist-mono text-base">
                {contributionInfo.reward.mainPosition.tokens}
              </span>
              <span className="font-geist-mono text-base">
                {/* {tgeData.projectCoin.ticker} */}
              </span>
            </div>
          </div>

          <div className="flex h-fit items-center gap-1.5 rounded-full text-xs font-medium text-fg-primary ">
            <Icon icon="SvgLock" className="mt-[-1px] text-base opacity-50" />
            <span className="opacity-50">Liquidity Pool</span>
            <img
              //   src={tgeData.lockupDetails.liquidityPool.imgUrl}
              className="h-4 w-4 object-cover"
            />
            <span className="opacity-50">Raydium,</span>
            <span className="opacity-50">
              {/* {tgeData.lockupDetails.description} */}
            </span>
          </div>
        </div>
        <div className="px-3 py-2">
          <div className="flex h-fit items-center gap-1.5 rounded-full text-xs font-medium text-fg-primary ">
            <img
              //   src={tgeData.projectCoin.iconUrl}
              className="h-4 w-4 object-cover"
            />
            <span className="font-geist-mono text-base">
              {contributionInfo.reward.yourReward.tokens}
            </span>
            <span className="font-geist-mono text-base">
              {/* {tgeData.projectCoin.ticker} */}
            </span>
          </div>
          <div className="flex h-fit items-center gap-1.5 rounded-full text-xs font-medium text-fg-primary ">
            <Icon icon="SvgChartLine" className="text-base opacity-50" />
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
