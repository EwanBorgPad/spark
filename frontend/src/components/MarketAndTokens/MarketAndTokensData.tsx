import { useTranslation } from "react-i18next"

import { formatCurrencyAmount, getRatioPercentage } from "@/utils/format"
import { ProjectData } from "@/data/data"
import ProgressBar from "./ProgressBar"

const MarketAndTokensData = ({ projectData }: { projectData: ProjectData }) => {
  const { t } = useTranslation()

  return (
    <section className="flex w-full max-w-[400px] flex-col gap-[25px]">
      <div className="mt-[28px] flex w-full justify-between gap-4">
        <div className="flex flex-1 flex-col gap-2">
          <span className="text-sm text-fg-tertiary">{t("marketcap")}</span>
          <span className="font-geist-mono text-base text-fg-primary">
            {formatCurrencyAmount(projectData.marketcap)}
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <span className="text-sm text-fg-tertiary">{t("fdv")}</span>
          <span className="font-geist-mono text-base text-fg-primary">
            {formatCurrencyAmount(projectData.fdv)}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-3 rounded-xl bg-secondary px-4 py-3">
        <div className="flex w-full items-center justify-between gap-4">
          <span className="text-base">{t("tokens_available")}</span>
          <div className="flex flex-col items-end">
            <span className="text-sm text-fg-tertiary">
              {`${getRatioPercentage(
                projectData.tokens.available,
                projectData.tokens.total,
              )}%`}
            </span>
            <span className="text-base text-fg-primary">
              {`${projectData.tokens.available}/${projectData.tokens.total}`}
            </span>
          </div>
        </div>
        <ProgressBar tokens={projectData.tokens} />
      </div>
    </section>
  )
}

export default MarketAndTokensData
