import Accordion from "@/components/Accordion/Accordion"
import { formatDateForDisplay } from "@/utils/date-helpers"
import { formatCurrencyAmount } from "@/utils/format"
import { addDays } from "date-fns"
import React from "react"
import { twMerge } from "tailwind-merge"

type PayoutProps = {
  index: number
  numberOfPastClaims: number
  payout: null
  ticker: string
  tokenIconUrl: string
}
const Payout = ({
  index,
  numberOfPastClaims,
  payout,
  ticker,
  tokenIconUrl,
}: PayoutProps) => {
  return (
    <div
      className={twMerge(
        "flex w-full justify-between border-b-[1px] border-b-bd-primary p-4",
        index + 1 === numberOfPastClaims && "border-none",
      )}
    >
      <div className="flex items-center gap-1 text-sm">
        {formatDateForDisplay(addDays(new Date(), index + 1))}
      </div>
      <div className="flex items-center gap-1 text-sm text-fg-tertiary">
        <p>
          <span>{formatCurrencyAmount(1000, false, 0)}</span>
          <span>/</span>
          <span>{formatCurrencyAmount(1000, false, 0)}</span>
          <span>{ticker}</span>
        </p>
        <img src={tokenIconUrl} className="h-4 w-4" />
      </div>
    </div>
  )
}
type ShowPayoutScheduleProps = {
  ticker: string
  tokenIconUrl: string
}
const ShowPayoutSchedule = ({
  ticker,
  tokenIconUrl,
}: ShowPayoutScheduleProps) => {
  const numberOfPastOrders = 8
  const payoutArray = [...Array(numberOfPastOrders).keys()]

  return (
    <Accordion label={"Show Payout Schedule"} subLabel={""}>
      {payoutArray.map((payout, index) => (
        <Payout
          key={index}
          index={index}
          numberOfPastClaims={numberOfPastOrders}
          payout={null}
          ticker={ticker}
          tokenIconUrl={tokenIconUrl}
        />
      ))}
    </Accordion>
  )
}

export default ShowPayoutSchedule
