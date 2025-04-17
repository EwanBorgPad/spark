import { useTranslation } from "react-i18next"

import { useProjectDataContext } from "@/hooks/useProjectData"

import { formatCurrencyAmount } from "shared/utils/format"
import ProgressBar from "./ProgressBar"
import Text from "@/components/Text"
import { useQuery } from "@tanstack/react-query"
import { backendApi } from "@/data/backendApi"

const SaleProgress = () => {
  const { t } = useTranslation()
  const { projectData, isLoading: isLoadingProject } = useProjectDataContext()
  const projectId = projectData?.id || ""

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

  const isLoading = isLoadingProject || isLoadingSaleResults
  const amountRaisedInUsd = formatCurrencyAmount(saleData?.totalAmountRaised.amountInUsd, {
    withDollarSign: true,
    customDecimals: 0,
  })
  const raiseTargetInUsd = formatCurrencyAmount(saleData?.raiseTargetInUsd, { withDollarSign: true, customDecimals: 0 })
  const selloutPercentage = saleData?.sellOutPercentage ? `${Number(saleData.sellOutPercentage).toFixed(1)}%` : ""

  return (
    <div className="flex w-full max-w-[432px] flex-col">
      <div className="flex w-full flex-col gap-3 rounded-xl bg-secondary px-4 py-3">
        <PreSaleMessage />

        <div className="flex w-full items-end justify-between gap-4">
          <span className="text-base">{t("lp_sale_progress")}</span>
          <div className="flex flex-col items-end">
            <Text text={selloutPercentage || "0%"} className="text-sm text-fg-tertiary" isLoading={isLoading} />
            <Text text={`${amountRaisedInUsd}/${raiseTargetInUsd}`} isLoading={isLoading} />
          </div>
        </div>
        {saleData && (
          <ProgressBar
            fulfilledAmount={+saleData.totalAmountRaised.amountInUsd}
            totalAmount={+saleData.raiseTargetInUsd}
          />
        )}
      </div>
    </div>
  )
}

export default SaleProgress

const PreSaleMessage = () => {
  const { projectData, isLoading } = useProjectDataContext()

  const preRaised = projectData?.info.preRaised

  if (!preRaised) return null
  return (
    <div className="flex w-full justify-between gap-2">
      <Text text={preRaised?.label} className="text-sm text-fg-tertiary" isLoading={isLoading} />
      <Text
        text={formatCurrencyAmount(preRaised?.amount, {
          withDollarSign: true,
          customDecimals: 0,
        })}
        className="text-sm text-fg-tertiary"
        isLoading={isLoading}
      />
    </div>
  )
}