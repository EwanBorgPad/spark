import Accordion from "@/components/Accordion/Accordion"
import { ContributionType, PayoutScheduleType } from "@/data/contributionData"
import { formatDateForDisplay } from "@/utils/date-helpers"
import { formatCurrencyAmount } from "@/utils/format"
import { addDays } from "date-fns"
import React from "react"
import { twMerge } from "tailwind-merge"

type PayoutProps = {
  index: number
  numberOfPastClaims: number
  payout: PayoutScheduleType
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
      <div
        className={twMerge(
          "flex items-center gap-1 text-sm",
          payout.isClaimed && "line-through opacity-50",
        )}
      >
        {formatDateForDisplay(payout.date)}
      </div>
      <div
        className={twMerge(
          "flex items-center gap-1 text-sm",
          payout.isClaimed && "opacity-50",
        )}
      >
        <p className={twMerge(payout.isClaimed && "line-through")}>
          <span>{formatCurrencyAmount(payout.amount, false)}</span>{" "}
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
  payoutSchedule: PayoutScheduleType[]
}
const ShowPayoutSchedule = ({
  ticker,
  tokenIconUrl,
  payoutSchedule,
}: ShowPayoutScheduleProps) => {
  const numberOfPastOrders = payoutSchedule.length

  return (
    <Accordion label={"Show Payout Schedule"} subLabel={""}>
      {payoutSchedule.map((payout, index) => (
        <Payout
          key={index}
          index={index}
          numberOfPastClaims={numberOfPastOrders}
          payout={payout}
          ticker={ticker}
          tokenIconUrl={tokenIconUrl}
        />
      ))}
    </Accordion>
  )
}

export default ShowPayoutSchedule
