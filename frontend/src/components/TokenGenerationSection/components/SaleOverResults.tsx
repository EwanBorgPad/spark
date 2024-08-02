import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import { useProjectDataContext } from "@/hooks/useProjectData.tsx"
import SimpleLoader from "@/components/Loaders/SimpleLoader"
import { formatCurrencyAmount } from "@/utils/format"
import { backendApi } from "@/data/backendApi.ts"

const SaleOverResults = () => {
  const { t } = useTranslation()
  const {
    projectData: { saleData },
  } = useProjectDataContext()

  const baseCurrency = "swissborg"
  const targetCurrency = "usd"
  const { data: exchangeData } = useQuery({
    queryFn: () =>
      backendApi.getExchange({
        baseCurrency,
        targetCurrency,
      }),
    queryKey: ["getExchange", baseCurrency, targetCurrency],
  })

  return (
    <div className="flex w-full max-w-[760px] flex-wrap gap-x-4 gap-y-5 rounded-lg border-[1px] border-bd-primary bg-secondary px-4 py-4 lg:px-5">
      <div className="flex min-w-[167px] flex-1 basis-[26%] flex-col gap-1">
        <span className="w-fit text-sm text-fg-tertiary">
          {t("sale_over.total_amount_raised")}
        </span>
        <span className="w-fit font-geist-mono text-base leading-7 text-fg-primary">
          {saleData?.totalAmountRaised ? (
            formatCurrencyAmount(saleData.totalAmountRaised)
          ) : (
            <SimpleLoader />
          )}
        </span>
      </div>
      <div className="flex min-w-[167px] flex-1 basis-[26%] flex-col gap-1">
        <span className="text-sm text-fg-tertiary">
          {t("sale_over.sell_out_percentage")}
        </span>
        <span className="font-geist-mono text-base leading-7 text-fg-primary">
          {saleData?.sellOutPercentage ? (
            `${saleData.sellOutPercentage}%`
          ) : (
            <SimpleLoader />
          )}
        </span>
      </div>
      <div className="flex min-w-[167px] flex-1 basis-[26%] flex-col gap-1">
        <span className="text-sm text-fg-tertiary">
          {t("sale_over.participants")}
        </span>
        <span className="font-geist-mono text-base leading-7 text-fg-primary">
          {saleData?.participantCount ? (
            saleData.participantCount
          ) : (
            <SimpleLoader />
          )}
        </span>
      </div>
      <div className="flex min-w-[167px] flex-1 basis-[26%] flex-col gap-1">
        <span className="text-sm text-fg-tertiary">
          {t("sale_over.average_invested_amount")}
        </span>
        <span className="font-geist-mono text-base leading-7 text-fg-primary">
          {saleData?.averageInvestedAmount ? (
            formatCurrencyAmount(saleData?.averageInvestedAmount)
          ) : (
            <SimpleLoader />
          )}
        </span>
      </div>
      <div className="flex min-w-[167px] flex-1 basis-[26%] flex-col gap-1">
        <span className="text-sm text-fg-tertiary">{t("market_cap")}</span>
        <span className="font-geist-mono text-base leading-7 text-fg-primary">
          {exchangeData?.marketCap
            ? formatCurrencyAmount(exchangeData.marketCap)
            : "unavailable"}
        </span>
      </div>
      <div className="flex min-w-[167px] flex-1 basis-[26%] flex-col gap-1">
        <span className="text-sm text-fg-tertiary">{t("fdv")}</span>
        <span className="font-geist-mono text-base leading-7 text-fg-primary">
          {exchangeData?.fullyDilutedValuation
            ? formatCurrencyAmount(exchangeData.fullyDilutedValuation)
            : "unavailable"}
        </span>
      </div>
    </div>
  )
}

export default SaleOverResults
