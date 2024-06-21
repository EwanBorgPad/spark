import { useTranslation } from "react-i18next"

import { ExpandedTimelineEventType } from "@/components/Timeline/Timeline"
import CountDownTimer from "@/components/CountDownTimer"
import { formatCurrencyAmount } from "@/utils/format"
import { TgeWrapper } from "../components/Wrapper"
import { ProjectData } from "@/data/data"

import { tokenData } from "@/data/tokenData"
import { Button } from "@/components/Button/Button"

type LiveProps = {
  eventData: ExpandedTimelineEventType
  projectData: ProjectData
}

const SaleOver = ({ eventData, projectData }: LiveProps) => {
  const { t } = useTranslation()

  const {
    totalAmountRaised,
    sellOutPercentage,
    participants,
    averageInvestedAmount,
  } = projectData.saleResults

  // @TODO - add API for getting token info
  const getTokenInfo = () => {
    return tokenData
  }
  const { marketCap, fdv } = getTokenInfo()

  return (
    <>
      <div className="flex w-full flex-col gap-9">
        <div className="flex w-full flex-col items-center gap-1">
          <h2 className="leading-11 text-4xl font-semibold">Sale Over</h2>
          <span className="text-sm opacity-60">
            Thank you for your participation
          </span>

          {/* @TODO - Add ScrollTo event when you make targeted component */}
          <Button
            color="plain"
            className="cursor-pointer py-0 text-sm underline"
            onClick={() => {}}
          >
            Check Your Rewards Here
          </Button>
        </div>

        <div className="flex w-full flex-wrap gap-x-4 gap-y-5 rounded-lg border-[1px] border-bd-primary bg-secondary px-5 py-4">
          <div className="flex min-w-[167px] flex-1 basis-[26%] flex-col gap-1">
            <span className="text-sm text-fg-tertiary">
              Total Amount Raised
            </span>
            <span className="font-geist-mono text-base leading-7 text-fg-primary">
              {formatCurrencyAmount(totalAmountRaised)}
            </span>
          </div>
          <div className="flex min-w-[167px] flex-1 basis-[26%] flex-col gap-1">
            <span className="text-sm text-fg-tertiary">
              Sell Out Percentage
            </span>
            <span className="font-geist-mono text-base leading-7 text-fg-primary">
              {sellOutPercentage}%
            </span>
          </div>
          <div className="flex min-w-[167px] flex-1 basis-[26%] flex-col gap-1">
            <span className="text-sm text-fg-tertiary">Participants</span>
            <span className="font-geist-mono text-base leading-7 text-fg-primary">
              {participants}
            </span>
          </div>
          <div className="flex min-w-[167px] flex-1 basis-[26%] flex-col gap-1">
            <span className="text-sm text-fg-tertiary">
              Average Invested Amount
            </span>
            <span className="font-geist-mono text-base leading-7 text-fg-primary">
              {formatCurrencyAmount(averageInvestedAmount)}
            </span>
          </div>
          <div className="flex min-w-[167px] flex-1 basis-[26%] flex-col gap-1">
            <span className="text-sm text-fg-tertiary">Market Cap</span>
            <span className="font-geist-mono text-base leading-7 text-fg-primary">
              {formatCurrencyAmount(marketCap)}
            </span>
          </div>
          <div className="flex min-w-[167px] flex-1 basis-[26%] flex-col gap-1">
            <span className="text-sm text-fg-tertiary">FDV</span>
            <span className="font-geist-mono text-base leading-7 text-fg-primary">
              {formatCurrencyAmount(fdv)}
            </span>
          </div>
        </div>
      </div>

      <TgeWrapper label={t("tge.sale_finished")}>
        {eventData?.nextEventDate && (
          <CountDownTimer endOfEvent={eventData.nextEventDate} />
        )}
      </TgeWrapper>
    </>
  )
}

export default SaleOver
