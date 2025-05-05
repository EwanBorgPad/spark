import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import { useProjectDataContext } from "@/hooks/useProjectData.tsx"
import { formatCurrencyAmount } from "shared/utils/format"
import { backendApi } from "@/data/backendApi.ts"
import Text from "@/components/Text"
import { SaleResultsResponse } from "shared/models"

const SaleOverResults = () => {
  const { t } = useTranslation()
  const { projectData, isLoading: isLoadingProject } = useProjectDataContext()
  const projectId = projectData?.id

  const { data: saleData, isLoading: isLoadingSaleResults } = useQuery({
    queryFn: async () => {
      if (!projectId) return null
      return await backendApi.getSaleResults({
        projectId,
      })
    },
    queryKey: ["saleResults", projectId],
    enabled: Boolean(projectId),
    staleTime: 30 * 1000,
  })

  const getSelloutPercentage = (saleData: SaleResultsResponse | null | undefined, projectId: string | undefined) => {
    if (!saleData || !projectId) return ""
    if (projectId === "moemate") return "Sold Out"
    return Number(saleData?.sellOutPercentage).toFixed(0) + "%"
  }

  const isLoading = isLoadingProject || isLoadingSaleResults
  const selloutPercentage = getSelloutPercentage(saleData, projectId)

  return (
    <div className="flex w-full max-w-[792px] flex-wrap gap-x-4 gap-y-5 rounded-lg border-[1px] border-bd-primary bg-secondary px-4 py-4 lg:px-5">
      <div className="flex min-w-[167px] flex-1 basis-[26%] flex-col gap-1">
        <span className="w-fit text-sm text-fg-tertiary">{t("sale_over.total_amount_raised")}</span>
        <Text
          text={formatCurrencyAmount(Number(saleData?.totalAmountRaised.amountInUsd), { withDollarSign: true })}
          isLoading={isLoading}
          className="w-fit text-base leading-7 text-fg-primary"
        />
      </div>
      <div className="flex min-w-[167px] flex-1 basis-[26%] flex-col gap-1">
        <span className="text-sm text-fg-tertiary">{t("sale_over.sell_out_percentage")}</span>
        <span className="text-base leading-7 text-fg-primary"></span>
        <Text text={selloutPercentage} className="text-base leading-7 text-fg-primary" isLoading={isLoading} />
      </div>
      <div className="flex min-w-[167px] flex-1 basis-[26%] flex-col gap-1">
        <span className="text-sm text-fg-tertiary">{t("sale_over.participants")}</span>
        <Text
          text={saleData?.participantsCount}
          isLoading={isLoading}
          className="text-base leading-7 text-fg-primary"
        />
      </div>
      <div className="flex min-w-[167px] flex-1 basis-[26%] flex-col gap-1">
        <span className="text-sm text-fg-tertiary">{t("sale_over.average_invested_amount")}</span>
        <Text
          text={formatCurrencyAmount(Number(saleData?.averageDepositAmount.amountInUsd), {
            withDollarSign: true,
            customDecimals: 2,
          })}
          className="text-base leading-7 text-fg-primary"
          isLoading={isLoading}
        />
      </div>
      <div className="flex min-w-[167px] flex-1 basis-[26%] flex-col gap-1">
        <span className="text-sm text-fg-tertiary">{t("market_cap")}</span>
        <Text
          text={formatCurrencyAmount(Number(saleData?.marketCap), { withDollarSign: true, customDecimals: 0 })}
          className="text-base leading-7 text-fg-primary"
          isLoading={isLoading}
        />
      </div>
      <div className="flex min-w-[167px] flex-1 basis-[26%] flex-col gap-1">
        <span className="text-sm text-fg-tertiary">{t("fdv")}</span>
        <Text
          text={formatCurrencyAmount(projectData?.config.fdv, { withDollarSign: true, customDecimals: 0 })}
          isLoading={isLoading}
          className="text-base leading-7 text-fg-primary"
        />
      </div>
    </div>
  )
}

export default SaleOverResults

