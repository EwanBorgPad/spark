import { useTranslation } from "react-i18next"

import { formatCurrencyAmount, getRatioPercentage } from "@/utils/format"
import ProgressBar from "./ProgressBar"

import { useQuery } from "@tanstack/react-query"
import { backendApi } from "@/data/backendApi.ts"
import { useProjectDataContext } from "@/hooks/useProjectData.tsx"

const MarketAndTokensData = () => {
  const { t } = useTranslation()
  const { projectData } = useProjectDataContext()
  const { available, total } = projectData.tokensAvailability

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

  return (
    <section className="flex w-full max-w-[400px] flex-col gap-[25px]">
      <div className="mt-[28px] flex w-full justify-between gap-4">
        <div className="flex flex-1 flex-col gap-2">
          <span className="text-sm text-fg-tertiary">{t("market_cap")}</span>
          <span className="font-geist-mono text-base text-fg-primary">
            {formatCurrencyAmount(data?.marketCap || 0)}
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <span className="text-sm text-fg-tertiary">{t("fdv")}</span>
          <span className="font-geist-mono text-base text-fg-primary">
            {formatCurrencyAmount(data?.fullyDilutedValuation || 0)}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-3 rounded-xl bg-secondary px-4 py-3">
        <div className="flex w-full items-center justify-between gap-4">
          <span className="text-base">{t("tokens_available")}</span>
          <div className="flex flex-col items-end">
            <span className="text-sm text-fg-tertiary">
              {`${getRatioPercentage(available, total)}%`}
            </span>
            <span className="text-base text-fg-primary">
              {`${available}/${total}`}
            </span>
          </div>
        </div>
        <ProgressBar fulfilledAmount={available} totalAmount={total} />
      </div>
    </section>
  )
}

export default MarketAndTokensData
