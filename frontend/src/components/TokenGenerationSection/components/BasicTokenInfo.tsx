import { useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useQuery } from "@tanstack/react-query"

import { backendApi } from "@/data/backendApi.ts"
import { formatCurrencyAmount } from "@/utils/format"
import SimpleLoader from "@/components/Loaders/SimpleLoader"
import { useProjectDataContext } from "@/hooks/useProjectData"
import Text from "@/components/Text"

const BasicTokenInfo = () => {
  const { t } = useTranslation()
  const { projectData, isLoading } = useProjectDataContext()
  const tge = projectData?.info.tge
  const { projectId } = useParams()

  const { data: investmentSummaryData, isLoading: isLoadingSummary } = useQuery(
    {
      queryFn: () =>
        backendApi.getInvestmentIntentSummary({
          projectId: projectId!,
        }),
      queryKey: ["getInvestmentIntentSummary", projectId],
      enabled: Boolean(projectId),
    },
  )

  // @SolanaID - we don't have specific date in timeline yet
  // const rewardDistributionStartDate = timeline.find(
  //   (event) => event.id === "REWARD_DISTRIBUTION",
  // )?.date

  return (
    <section className="max-w-screen flex w-full flex-col gap-[25px] px-4 lg:max-w-[792px]">
      <div className="flex w-full flex-wrap justify-between gap-6">
        <div className="flex flex-1 flex-col gap-2">
          <span className="text-sm text-fg-tertiary">
            {t("total_investment_interest")}
          </span>
          <span className="font-geist-mono text-base text-fg-primary">
            <Text
              as="span"
              className="font-geist-mono text-base text-fg-primary"
              isLoading={isLoadingSummary}
              text={formatCurrencyAmount(investmentSummaryData?.sum)}
            />
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <span className="text-sm text-fg-tertiary">TGE</span>
          <span className="text-nowrap font-geist-mono text-base text-fg-primary">
            {tge?.tokenGenerationEventDate}
            {/* @SolanaID - we don't have specific date in timeline yet */}
            {/* {rewardDistributionStartDate && formatDateAndMonth(rewardDistributionStartDate)} */}
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <span className="text-sm text-fg-tertiary">{t("fdv")}</span>
          <span className="font-geist-mono text-base text-fg-primary">
            {!isLoading ? formatCurrencyAmount(tge.fdv) : <SimpleLoader />}
          </span>
        </div>
      </div>
    </section>
  )
}

export default BasicTokenInfo
