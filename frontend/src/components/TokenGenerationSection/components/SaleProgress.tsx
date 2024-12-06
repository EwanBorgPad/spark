import { useTranslation } from "react-i18next"

import { useProjectDataContext } from "@/hooks/useProjectData"
import { getRatioPercentage } from "@/utils/format"
import { formatCurrencyAmount } from "shared/utils/format"
import ProgressBar from "./ProgressBar"
import Text from "@/components/Text"

const SaleProgress = () => {
  const { t } = useTranslation()
  const { projectData, isLoading } = useProjectDataContext()
  const saleData = projectData?.saleData
  const info = projectData?.info

  const availableTokensFormatted = formatCurrencyAmount(saleData?.availableTokens ?? 0, false)
  const totalTokensFormatted = formatCurrencyAmount(info?.totalTokensForSale, false, 0)
  const fulfilledPercentage =
    saleData?.availableTokens && info && `${getRatioPercentage(saleData.availableTokens, info?.totalTokensForSale)}%`

  return (
    <div className="flex w-full max-w-[432px] flex-col">
      <div className="flex w-full flex-col gap-3 rounded-xl bg-secondary px-4 py-3">
        <div className="flex w-full items-center justify-between gap-4">
          <span className="text-base">{t("lp_sale_progress")}</span>
          <div className="flex flex-col items-end">
            <Text text={fulfilledPercentage} className="text-sm text-fg-tertiary" isLoading={isLoading} />
            <Text text={`${availableTokensFormatted}/${totalTokensFormatted}`} isLoading={isLoading} />
          </div>
        </div>
        {saleData?.availableTokens && info && (
          <ProgressBar fulfilledAmount={saleData?.availableTokens} totalAmount={info.totalTokensForSale} />
        )}
      </div>
    </div>
  )
}

export default SaleProgress
