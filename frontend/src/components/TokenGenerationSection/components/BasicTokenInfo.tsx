import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import { formatCurrencyAmount } from "@/utils/format"
import { backendApi } from "@/data/backendApi.ts"
import SimpleLoader from "@/components/Loaders/SimpleLoader"
import { formatDateAndMonth, formatDateForDisplay } from "@/utils/date-helpers"

const BasicTokenInfo = () => {
  const { t } = useTranslation()

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
            {data?.marketCap ? (
              formatCurrencyAmount(data.marketCap)
            ) : (
              <SimpleLoader />
            )}
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
        <div className="flex flex-1 flex-col gap-2">
          <span className="text-sm text-fg-tertiary">TGE</span>
          <span className="font-geist-mono text-base text-fg-primary">
            {formatDateAndMonth(new Date())}
          </span>
        </div>
      </div>
    </section>
  )
}

export default BasicTokenInfo
