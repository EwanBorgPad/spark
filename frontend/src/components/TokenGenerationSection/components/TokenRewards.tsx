import { Icon } from "@/components/Icon/Icon"
import Img from "@/components/Image/Img"
import { useProjectDataContext } from "@/hooks/useProjectData"
import { formatValue } from "react-currency-input-field"
import { useTranslation } from "react-i18next"

type TokenRewardsProps = {
  borgCoinInput: string
  isWhitelistingEvent: boolean
}

const TokenRewards = ({
  borgCoinInput,
  isWhitelistingEvent,
}: TokenRewardsProps) => {
  const { t } = useTranslation()
  const { projectData } = useProjectDataContext()
  const tgeData = projectData.info.tge

  const getCoinReward = () => {
    if (!borgCoinInput) return 0
    return formatValue({
      value: (
        +borgCoinInput * projectData.info.tge.fixedCoinPriceInBorg
      ).toString(),
    })
  }

  const totalRewards = {
    borg: borgCoinInput,
    targetCoin: getCoinReward(),
  }

  return (
    <div className="border-t-none relative w-full max-w-[400px] items-center gap-2.5 rounded-lg border border-bd-primary bg-tertiary ">
      <div className="relative flex flex-col items-center border-b-[1px] border-b-bd-primary px-3 py-2">
        <div className="flex h-fit w-full flex-wrap items-center gap-2 rounded-full pb-1 text-base font-medium">
          <Icon icon="SvgBorgCoin" />
          <span className="font-geist-mono text-base">
            {isWhitelistingEvent
              ? 1
              : formatValue({ value: borgCoinInput }) || 0}
          </span>
          <span className="font-geist-mono">BORG</span>
          <div className="flex items-center gap-2">
            <Icon
              icon="SvgPlus"
              className="text-base text-fg-disabled opacity-50"
            />
            <Img src={tgeData.projectCoin.iconUrl} size="4" />
            <span className="font-geist-mono text-base">{getCoinReward()}</span>
            <span className="font-geist-mono text-base">
              {tgeData.projectCoin.ticker}
            </span>
          </div>
        </div>
        <div className="absolute -bottom-[10px] bg-tertiary p-[2px]">
          <Icon
            icon="SvgPlus"
            className="text-base text-fg-disabled opacity-50"
          />
        </div>

        <div className="flex h-fit w-full items-center gap-1.5 rounded-full text-xs font-normal text-fg-primary">
          <Icon icon="SvgLock" className="mt-[-1px] text-base opacity-50" />
          <span className="opacity-50">{t("tge.liquidity_pool")}</span>
          <Img src={tgeData.liquidityPool.iconUrl} size="4" />
          <a href={tgeData.liquidityPool.url} className="underline">
            <span className="opacity-50">{tgeData.liquidityPool.name}</span>
          </a>
          <span className="-ml-1.5 opacity-50">
            , {tgeData.liquidityPool.lockingPeriod}
          </span>
        </div>
      </div>
      <div className="border-b-[1px] border-b-bd-primary px-3 py-2">
        <div className="flex h-fit items-center gap-1.5 rounded-full text-xs font-medium text-fg-primary ">
          <Img src={tgeData.projectCoin.iconUrl} size="4" />
          <span className="font-geist-mono text-base">{getCoinReward()}</span>
          <span className="font-geist-mono text-base">
            {tgeData.projectCoin.ticker}
          </span>
        </div>
        <div className="flex h-fit items-center gap-1.5 rounded-full text-xs font-normal text-fg-primary ">
          <Icon icon="SvgChartLine" className="text-base opacity-50" />
          <span className="opacity-50">{t("tge.linearly_paid_out")}</span>
        </div>
      </div>
      <div className="flex gap-2 px-3 py-2 text-xs">
        <span>Total:</span>
        <span className="font-geist-mono">
          {isWhitelistingEvent ? 1 : formatValue({ value: borgCoinInput }) || 0}
        </span>
        <span className="font-geist-mono">{"BORG"}</span>
        <span>{"+"}</span>
        <span className="font-geist-mono">{totalRewards.targetCoin}</span>
        <span className="font-geist-mono">{tgeData.projectCoin.ticker}</span>
      </div>
    </div>
  )
}

export default TokenRewards
