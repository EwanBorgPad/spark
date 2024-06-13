import { Icon } from "@/components/Icon/Icon"
import { ProjectData } from "@/data/data"
import { formatValue } from "react-currency-input-field"
import { useTranslation } from "react-i18next"

type TokenRewardsProps = {
  borgCoinInput: string
  isWhitelistingEvent: boolean
  tgeData: ProjectData["tge"]
}

const TokenRewards = ({
  borgCoinInput,
  isWhitelistingEvent,
  tgeData,
}: TokenRewardsProps) => {
  const { t } = useTranslation()

  const getRewardQuantity = () => {
    if (!borgCoinInput) return 0
    return formatValue({
      value: borgCoinInput,
    })
  }

  return (
    <div className="border-t-none relative w-full max-w-[400px] items-center gap-2.5 rounded-lg border border-bd-primary bg-tertiary ">
      <div className="border-b-[1px] border-b-bd-primary px-3 py-2">
        <div className="flex h-fit flex-wrap items-center gap-2 rounded-full pb-1 text-base font-medium">
          <Icon icon="SvgBorgCoin" />
          <span className="font-geist-mono text-base">
            {isWhitelistingEvent
              ? 1
              : formatValue({ value: borgCoinInput }) || 0}
          </span>
          <span className="font-geist-mono">BORG</span>
          <div className="flex items-center gap-2">
            <span className="font-normal opacity-50">+</span>
            <img
              src={tgeData.projectCoin.iconUrl}
              className="h-4 w-4 object-cover"
            />
            <span className="font-geist-mono text-base">
              {getRewardQuantity()}
            </span>
            <span className="font-geist-mono text-base">
              {tgeData.projectCoin.ticker}
            </span>
          </div>
        </div>

        <div className="flex h-fit items-center gap-1.5 rounded-full text-xs font-medium text-fg-primary ">
          <Icon icon="SvgLock" className="mt-[-1px] text-base opacity-50" />
          <span className="opacity-50">{t("tge.liquidity_pool")}</span>
          <img
            src={tgeData.liquidityPoolDetails.defiProtocol.imgUrl}
            className="h-4 w-4 object-cover"
          />
          <span className="opacity-50">Raydium,</span>
          <span className="opacity-50">12-{t("tge.month_lockup")}</span>
        </div>
      </div>
      <div className="px-3 py-2">
        <div className="flex h-fit items-center gap-1.5 rounded-full text-xs font-medium text-fg-primary ">
          <img
            src={tgeData.projectCoin.iconUrl}
            className="h-4 w-4 object-cover"
          />
          <span className="font-geist-mono text-base">
            {getRewardQuantity()}
          </span>
          <span className="font-geist-mono text-base">
            {tgeData.projectCoin.ticker}
          </span>
        </div>
        <div className="flex h-fit items-center gap-1.5 rounded-full text-xs font-medium text-fg-primary ">
          <Icon icon="SvgChartLine" className="text-base opacity-50" />
          <span className="opacity-50">{t("tge.linearly_paid_out")}</span>
        </div>
      </div>
    </div>
  )
}

export default TokenRewards
