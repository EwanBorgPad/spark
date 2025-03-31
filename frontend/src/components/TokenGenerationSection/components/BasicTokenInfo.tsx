import { useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useQuery } from "@tanstack/react-query"

import { backendApi } from "@/data/backendApi.ts"
import { formatCurrencyAmount } from "shared/utils/format"
import { useProjectDataContext } from "@/hooks/useProjectData"
import Text from "@/components/Text"

type Props = {
  isDraftPick?: boolean
}

const BasicTokenInfo = ({ isDraftPick }: Props) => {
  const { t } = useTranslation()
  const { projectData, isLoading } = useProjectDataContext()
  const { projectId } = useParams()

  const { data: investmentSummaryData, isLoading: isLoadingSummary } = useQuery({
    queryFn: () =>
      backendApi.getInvestmentIntentSummary({
        projectId: projectId!,
      }),
    queryKey: ["getInvestmentIntentSummary", projectId],
    enabled: Boolean(projectId),
    staleTime: 30 * 60 * 1000,
  })

  const fdv = projectData?.config.fdv
    ? formatCurrencyAmount(projectData?.config.fdv, { withDollarSign: true, customDecimals: 0 })
    : ""
  const targetFdv = projectData?.info?.targetFdv
  const tgeDate = projectData?.info?.tokenGenerationEventDate || "TBD"
  const targetVesting = projectData?.info?.targetVesting || projectData?.info.tokenGenerationEventDate || "TBD"

  return (
    <section className="max-w-screen flex w-full flex-col items-center gap-[25px]">
      <div className="flex w-full max-w-[792px] flex-col flex-wrap justify-between gap-3 divide-bd-secondary rounded-lg border border-bd-secondary bg-default py-3 md:flex-row md:gap-6 md:divide-x-[1px] md:px-0 md:py-0">
        <div className="flex min-w-[118px] flex-1 items-center justify-between gap-2 px-4 md:flex-col md:items-start md:py-4">
          <span className="text-nowrap text-sm text-fg-tertiary">{t("total_investment_interest")}</span>
          <Text
            as="span"
            className="whitespace-nowrap text-nowrap text-base text-fg-primary"
            isLoading={isLoadingSummary}
            text={formatCurrencyAmount(investmentSummaryData?.sum, { withDollarSign: true, customDecimals: 0 })}
          />
        </div>
        {isDraftPick ? (
          <div className="flex min-w-[118px] flex-1 items-center justify-between gap-2 px-4 md:flex-col md:items-start md:py-4">
            <span className="text-sm text-fg-tertiary">Target Vesting</span>
            <Text text={targetVesting} isLoading={isLoading} className="text-nowrap text-base text-fg-primary" />
          </div>
        ) : (
          <div className="flex min-w-[118px] flex-1 items-center justify-between gap-2 px-4 md:flex-col md:items-start md:py-4">
            <span className="text-sm text-fg-tertiary">TGE</span>
            <Text text={tgeDate} isLoading={isLoading} className="text-nowrap text-base text-fg-primary" />
          </div>
        )}
        {isDraftPick ? (
          <div className="flex min-w-[118px] flex-1 items-center justify-between gap-2 px-4 md:flex-col md:items-start md:py-4">
            <span className="text-sm text-fg-tertiary">Target FDV</span>
            <Text text={targetFdv} isLoading={isLoading} className="text-base text-fg-primary" />
          </div>
        ) : (
          <div className="flex min-w-[118px] flex-1 items-center justify-between gap-2 px-4 md:flex-col md:items-start md:py-4">
            <span className="text-sm text-fg-tertiary">{t("fdv")}</span>
            <Text text={fdv} isLoading={isLoading} className="text-base text-fg-primary" />
          </div>
        )}
      </div>
    </section>
  )
}

export default BasicTokenInfo
