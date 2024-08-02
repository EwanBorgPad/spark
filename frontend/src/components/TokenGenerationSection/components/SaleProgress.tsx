import { useTranslation } from "react-i18next"

import { useProjectDataContext } from "@/hooks/useProjectData"
import { getRatioPercentage } from "@/utils/format"
import ProgressBar from "./ProgressBar"

const SaleProgress = () => {
  const { t } = useTranslation()
  const {
    projectData: { info, saleData },
  } = useProjectDataContext()

  return (
    <div className="flex w-full max-w-[432px] flex-col px-4">
      <div className="flex w-full flex-col gap-3 rounded-xl bg-secondary px-4 py-3">
        <div className="flex w-full items-center justify-between gap-4">
          <span className="text-base">{t("lp_sale_progress")}</span>
          <div className="flex flex-col items-end">
            <span className="text-sm text-fg-tertiary">
              {saleData?.availableTokens &&
                `${getRatioPercentage(saleData.availableTokens, info.totalTokensForSale)}%`}
            </span>
            <span className="text-base text-fg-primary">
              {`${saleData?.availableTokens}/${info.totalTokensForSale}`}
            </span>
          </div>
        </div>
        {saleData?.availableTokens && (
          <ProgressBar
            fulfilledAmount={saleData?.availableTokens}
            totalAmount={info.totalTokensForSale}
          />
        )}
      </div>
    </div>
  )
}

export default SaleProgress
