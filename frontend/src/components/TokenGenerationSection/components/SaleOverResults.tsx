import { ProjectData } from "@/data/projectData"
import { formatCurrencyAmount } from "@/utils/format"
import React from "react"
import { useTranslation } from "react-i18next"
import { tokenData } from "@/data/tokenData"

type SaleOverResultsProps = {
  saleResults: ProjectData["saleResults"]
}

const SaleOverResults = ({ saleResults }: SaleOverResultsProps) => {
  const { t } = useTranslation()
  const {
    totalAmountRaised,
    sellOutPercentage,
    participantCount,
    averageInvestedAmount,
  } = saleResults

  /////////////////////////////////////////////////
  // @TODO - add API for getting token info ///////
  /////////////////////////////////////////////////

  const getTokenInfo = () => {
    return tokenData
  }
  const { marketCap, fdv } = getTokenInfo()

  return (
    <div className="flex w-full max-w-[760px] flex-wrap gap-x-4 gap-y-5 rounded-lg border-[1px] border-bd-primary bg-secondary px-4 py-4 lg:px-5">
      <div className="flex min-w-[167px] flex-1 basis-[26%] flex-col gap-1">
        <span className="w-fit text-sm text-fg-tertiary">
          {t("sale_over.total_amount_raised")}
        </span>
        <span className="w-fit font-geist-mono text-base leading-7 text-fg-primary">
          {formatCurrencyAmount(totalAmountRaised)}
        </span>
      </div>
      <div className="flex min-w-[167px] flex-1 basis-[26%] flex-col gap-1">
        <span className="text-sm text-fg-tertiary">
          {t("sale_over.sell_out_percentage")}
        </span>
        <span className="font-geist-mono text-base leading-7 text-fg-primary">
          {sellOutPercentage}%
        </span>
      </div>
      <div className="flex min-w-[167px] flex-1 basis-[26%] flex-col gap-1">
        <span className="text-sm text-fg-tertiary">
          {t("sale_over.participants")}
        </span>
        <span className="font-geist-mono text-base leading-7 text-fg-primary">
          {participantCount}
        </span>
      </div>
      <div className="flex min-w-[167px] flex-1 basis-[26%] flex-col gap-1">
        <span className="text-sm text-fg-tertiary">
          {t("sale_over.average_invested_amount")}
        </span>
        <span className="font-geist-mono text-base leading-7 text-fg-primary">
          {formatCurrencyAmount(averageInvestedAmount)}
        </span>
      </div>
      <div className="flex min-w-[167px] flex-1 basis-[26%] flex-col gap-1">
        <span className="text-sm text-fg-tertiary">{t("market_cap")}</span>
        <span className="font-geist-mono text-base leading-7 text-fg-primary">
          {formatCurrencyAmount(marketCap)}
        </span>
      </div>
      <div className="flex min-w-[167px] flex-1 basis-[26%] flex-col gap-1">
        <span className="text-sm text-fg-tertiary">{t("fdv")}</span>
        <span className="font-geist-mono text-base leading-7 text-fg-primary">
          {formatCurrencyAmount(fdv)}
        </span>
      </div>
    </div>
  )
}

export default SaleOverResults
