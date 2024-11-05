import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import { formatCurrencyAmount } from "@/utils/format"
import { backendApi } from "@/data/backendApi.ts"
import SimpleLoader from "@/components/Loaders/SimpleLoader"
import { formatDateAndMonth } from "@/utils/date-helpers"
import { useProjectDataContext } from "@/hooks/useProjectData"
import { useParams } from "react-router-dom"

const BasicTokenInfo = () => {
  const { t } = useTranslation()
  const {
    projectData: {
      info: { timeline, tge },
    },
  } = useProjectDataContext()
  const { projectId } = useParams()

  // TODO @hardcoded switch to projectCoin instead of hardcoded BORG
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

  const { data: investmentSummaryData } = useQuery({
    queryFn: () =>
      backendApi.getInvestmentIntentSummary({
        projectId: projectId!,
      }),
    queryKey: ["getInvestmentIntentSummary", projectId],
    enabled: Boolean(projectId),
  })

  // @SolanaID - we don't have specific date in timeline yet
  // const rewardDistributionStartDate = timeline.find(
  //   (event) => event.id === "REWARD_DISTRIBUTION",
  // )?.date

  return (
    <section className="max-w-screen flex w-full flex-col gap-[25px] px-4 lg:max-w-[792px]">
      <div className="mt-[28px] flex w-full flex-wrap justify-between gap-6">
        <div className="flex flex-1 flex-col gap-2">
          <span className="text-sm text-fg-tertiary">
            {t("total_investment_interest")}
          </span>
          <span className="font-geist-mono text-base text-fg-primary">
            {investmentSummaryData ? (
              formatCurrencyAmount(investmentSummaryData.sum)
            ) : (
              <SimpleLoader />
            )}
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <span className="text-sm text-fg-tertiary">TGE</span>
          <span className="text-nowrap font-geist-mono text-base text-fg-primary">
            {tge.tokenGenerationEventDate}
            {/* @SolanaID - we don't have specific date in timeline yet */}
            {/* {rewardDistributionStartDate && formatDateAndMonth(rewardDistributionStartDate)} */}
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <span className="text-sm text-fg-tertiary">{t("fdv")}</span>
          <span className="font-geist-mono text-base text-fg-primary">
            {exchangeData?.fullyDilutedValuation ? (
              formatCurrencyAmount(exchangeData?.fullyDilutedValuation)
            ) : (
              <SimpleLoader />
            )}
          </span>
        </div>
      </div>
    </section>
  )
}

export default BasicTokenInfo
