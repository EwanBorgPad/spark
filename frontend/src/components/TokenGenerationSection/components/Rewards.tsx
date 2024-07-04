import { useTranslation } from "react-i18next"
import Divider from "@/components/Divider"
import { TgeWrapper } from "./Wrapper"
import CountDownTimer from "@/components/CountDownTimer"
import { ExpandedTimelineEventType } from "@/components/Timeline/Timeline"
import { useProjectDataContext } from "@/hooks/useProjectData"
import ProgressBar from "./ProgressBar"
import Accordion from "@/components/Accordion/Accordion"
import ShowPayoutSchedule from "./ShowPayoutSchedule"

type RewardsProps = {
  eventData: ExpandedTimelineEventType
  hasDistributionStarted: boolean
}
const Rewards = ({ eventData, hasDistributionStarted }: RewardsProps) => {
  const { projectData } = useProjectDataContext()
  const { iconUrl, ticker } = projectData.tge.projectCoin
  const { t } = useTranslation()
  return (
    <>
      <Divider icon="SvgMedal" />
      <div className="mb-7 flex w-full flex-col items-center gap-1">
        <h2 className="text-4xl font-semibold">{t("sale_over.rewards")}</h2>
        <p className="text-center text-sm opacity-60">
          {t("sale_over.monthly_payments_need_to")}
        </p>
        <span className="cursor-pointer text-center text-sm underline opacity-60">
          {t("sale_over.learn_more_about")}
        </span>
      </div>
      <TgeWrapper label={t("sale_over.monthly_payout")}>
        {eventData?.nextEventDate && (
          <CountDownTimer endOfEvent={eventData.nextEventDate} />
        )}
        {hasDistributionStarted && (
          <>
            <hr className="w-full max-w-[calc(100%-32px)] border-bd-primary" />
            <div className="flex w-full flex-col gap-2.5 p-4 pb-7">
              <div className="flex w-full items-center justify-between gap-2">
                <span className="text-sm font-medium">Claimed</span>
                <div className="flex items-center gap-2">
                  <img src={iconUrl} className="h-4 w-4" />
                  <p>
                    <span className="mr-1">2,000/12,000</span>
                    <span>LRC</span>
                  </p>
                </div>
              </div>
              <ProgressBar fulfilledAmount={2000} totalAmount={12000} />
            </div>
          </>
        )}
      </TgeWrapper>
      {hasDistributionStarted && (
        <ShowPayoutSchedule ticker={ticker} tokenIconUrl={iconUrl} />
      )}
    </>
  )
}

export default Rewards
