import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import { formatCurrencyAmount } from "@/utils/format"
import { backendApi } from "@/data/backendApi.ts"
import SimpleLoader from "@/components/Loaders/SimpleLoader"
import { formatDateAndMonth } from "@/utils/date-helpers"
import { useProjectDataContext } from "@/hooks/useProjectData"

const BasicTokenInfo = () => {
  const { t } = useTranslation()
  const {
    projectData: {
      info: { timeline },
    },
  } = useProjectDataContext()

  // TODO @hardcoded switch to projectCoin instead of hardcoded BORG
  const baseCurrency = "swissborg"
  const targetCurrency = "usd"
  const { data } = useQuery({
    queryFn: () =>
      backendApi.getExchange({
        baseCurrency,
        targetCurrency,
      }),
    queryKey: ["getExchange", baseCurrency, targetCurrency],
  })

  const rewardDistributionStartDate = timeline.find(
    (event) => event.id === "REWARD_DISTRIBUTION",
  )?.date

  return (
    <section className="max-w-screen flex w-full flex-col gap-[25px] px-4 lg:max-w-[792px]">
      <div className="mt-[28px] flex w-full flex-wrap justify-between gap-6">
        <div className="flex flex-1 flex-col gap-2">
          <span className="text-sm text-fg-tertiary">{t("market_cap")}</span>
          <span className="font-geist-mono text-base text-fg-primary">
            {data?.marketCap ? (
              formatCurrencyAmount(data.marketCap)
            ) : (
              <SimpleLoader />
            )}
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <span className="text-sm text-fg-tertiary">TGE</span>
          <span className="text-nowrap font-geist-mono text-base text-fg-primary">
            {rewardDistributionStartDate &&
              formatDateAndMonth(rewardDistributionStartDate)}
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <span className="text-sm text-fg-tertiary">{t("fdv")}</span>
          <span className="font-geist-mono text-base text-fg-primary">
            {data?.fullyDilutedValuation ? (
              formatCurrencyAmount(data?.fullyDilutedValuation)
            ) : (
              <SimpleLoader />
            )}
          </span>
        </div>
      </div>
    </section>
  )
}

export default BasicTokenInfo
