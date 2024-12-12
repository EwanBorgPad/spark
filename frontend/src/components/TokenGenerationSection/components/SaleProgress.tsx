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
  const projectId = projectData?.info.id || ""

  const { data: saleData, isLoading: isLoadingSaleResults } = useQuery({
    queryFn: async () => {
      if (!projectId) return null
      return await backendApi.getSaleResults({
        projectId,
      })
    },
    queryKey: ["saleResults", projectId],
    enabled: Boolean(projectId),
  })

  const isLoading = isLoadingProject || isLoadingSaleResults
  const amountRaisedInUsd = formatCurrencyAmount(saleData?.totalAmountRaised.amountInUsd, true, 1)
  const raiseTargetInUsd = formatCurrencyAmount(saleData?.raiseTargetInUsd, true, 0)

  return (
    <div className="flex w-full max-w-[400px] flex-col">
      <div className="flex w-full flex-col gap-3 rounded-xl bg-secondary px-4 py-3">
        <div className="flex w-full items-center justify-between gap-4">
          <span className="text-base">{t("lp_sale_progress")}</span>
          <div className="flex flex-col items-end">
            <Text text={saleData?.sellOutPercentage + "%"} className="text-sm text-fg-tertiary" isLoading={isLoading} />
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
