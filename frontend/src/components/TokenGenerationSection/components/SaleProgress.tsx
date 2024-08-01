import { useProjectDataContext } from "@/hooks/useProjectData"
import { getRatioPercentage } from "@/utils/format"
import React from "react"
import { useTranslation } from "react-i18next"
import ProgressBar from "./ProgressBar"

const SaleProgress = () => {
  const { t } = useTranslation()
  const { projectData } = useProjectDataContext()
  const { available, total } = projectData.tokensAvailability

  return (
    <div className="flex w-full max-w-[432px] flex-col px-4">
      <div className="flex w-full flex-col gap-3 rounded-xl bg-secondary px-4 py-3">
        <div className="flex w-full items-center justify-between gap-4">
          <span className="text-base">{t("lp_sale_progress")}</span>
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
    </div>
  )
}

export default SaleProgress
