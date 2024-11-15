import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import { useProjectDataContext } from "@/hooks/useProjectData.tsx"
import { formatCurrencyAmount } from "@/utils/format"
import { backendApi } from "@/data/backendApi.ts"
import Text from "@/components/Text"

const SaleOverResults = () => {
  const { t } = useTranslation()
  const {
    projectData: { saleData, info },
    isLoading,
  } = useProjectDataContext()

  const baseCurrency = "swissborg"
  const targetCurrency = "usd"
  const { data: exchangeData, isLoading: isExchangeLoading } = useQuery({
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
        <span className="w-fit text-sm text-fg-tertiary">{t("sale_over.total_amount_raised")}</span>
        <Text
          text={formatCurrencyAmount(saleData?.totalAmountRaised)}
          isLoading={isExchangeLoading}
          className="w-fit text-base leading-7 text-fg-primary"
        />
      </div>
      <div className="flex min-w-[167px] flex-1 basis-[26%] flex-col gap-1">
        <span className="text-sm text-fg-tertiary">{t("sale_over.sell_out_percentage")}</span>
        <span className="text-base leading-7 text-fg-primary"></span>
        <Text
          text={saleData?.sellOutPercentage ? `${saleData.sellOutPercentage}%` : ""}
          className="text-base leading-7 text-fg-primary"
          isLoading={isExchangeLoading}
        />
      </div>
      <div className="flex min-w-[167px] flex-1 basis-[26%] flex-col gap-1">
        <span className="text-sm text-fg-tertiary">{t("sale_over.participants")}</span>
        <Text
          text={saleData?.participantCount}
          isLoading={isExchangeLoading}
          className="text-base leading-7 text-fg-primary"
        />
      </div>
      <div className="flex min-w-[167px] flex-1 basis-[26%] flex-col gap-1">
        <span className="text-sm text-fg-tertiary">{t("sale_over.average_invested_amount")}</span>
        <Text
          text={formatCurrencyAmount(saleData?.averageInvestedAmount)}
          className="text-base leading-7 text-fg-primary"
          isLoading={isExchangeLoading}
        />
      </div>
      <div className="flex min-w-[167px] flex-1 basis-[26%] flex-col gap-1">
        <span className="text-sm text-fg-tertiary">{t("market_cap")}</span>
        <Text
          text={formatCurrencyAmount(exchangeData?.marketCap)}
          className="text-base leading-7 text-fg-primary"
          isLoading={isExchangeLoading}
        />
      </div>
      <div className="flex min-w-[167px] flex-1 basis-[26%] flex-col gap-1">
        <span className="text-sm text-fg-tertiary">{t("fdv")}</span>

        {/* @TODO - Check: FDV (fully diluted value) is fixed from the beginning. Check if this is in every project */}
        <Text
          text={formatCurrencyAmount(info.tge.fdv)}
          isLoading={isLoading}
          className="text-base leading-7 text-fg-primary"
        />
      </div>
    </div>
  )
}

export default SaleOverResults
