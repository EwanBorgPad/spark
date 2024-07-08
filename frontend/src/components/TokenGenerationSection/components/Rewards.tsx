import { useTranslation } from "react-i18next"

import { ExpandedTimelineEventType } from "@/components/Timeline/Timeline"
import { useProjectDataContext } from "@/hooks/useProjectData"
import CountDownTimer from "@/components/CountDownTimer"
import ShowPayoutSchedule from "./ShowPayoutSchedule"
import Divider from "@/components/Divider"
import ProgressBar from "./ProgressBar"
import { TgeWrapper } from "./Wrapper"

import { ContributionType } from "@/data/contributionData"
import { Button } from "@/components/Button/Button"
import { formatCurrencyAmount } from "@/utils/format"
import { Icon } from "@/components/Icon/Icon"
import { formatDateForTimer } from "@/utils/date-helpers"

type RewardsProps = {
  eventData: ExpandedTimelineEventType
  hasDistributionStarted: boolean
  rewards: ContributionType["claimPositions"]["rewards"]
}

const Rewards = ({
  eventData,
  hasDistributionStarted,
  rewards,
}: RewardsProps) => {
  const { projectData } = useProjectDataContext()
  const { iconUrl, ticker } = projectData.tge.projectCoin
  const { t } = useTranslation()

  const nextScheduledPayment = rewards.payoutSchedule.find(
    (payment) => !payment.isClaimed,
  )

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
        {nextScheduledPayment ? (
          <>
            <CountDownTimer
              labelAboveTimer={`Next Payment in: ${formatDateForTimer(nextScheduledPayment.date)}`}
              endOfEvent={eventData.nextEventDate}
            />
            <div className="w-full px-4 pb-6">
              {nextScheduledPayment && (
                <Button
                  btnText={`Claim ${formatCurrencyAmount(nextScheduledPayment.amount, false)} ${ticker}`}
                  size="lg"
                  className="w-full py-3 font-normal"
                />
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center gap-2 px-4 pb-6 pt-12">
            <Icon
              icon="SvgCircledCheckmark"
              className="text-lg text-brand-primary"
            />
            <span>All rewards claimed.</span>
          </div>
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
                    <span className="mr-1">{rewards.claimedTokens}</span>
                    <span className="mr-1">/</span>
                    <span className="mr-1">{rewards.totalTokens}</span>
                    <span>{projectData.tge.projectCoin.ticker}</span>
                  </p>
                </div>
              </div>
              <ProgressBar
                fulfilledAmount={rewards.claimedTokens}
                totalAmount={rewards.totalTokens}
              />
            </div>
          </>
        )}
      </TgeWrapper>
      {hasDistributionStarted && (
        <ShowPayoutSchedule
          ticker={ticker}
          tokenIconUrl={iconUrl}
          payoutSchedule={rewards.payoutSchedule}
        />
      )}
    </>
  )
}

export default Rewards
