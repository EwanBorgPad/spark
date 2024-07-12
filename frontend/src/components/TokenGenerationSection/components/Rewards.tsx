import { useTranslation } from "react-i18next"

import { ExpandedTimelineEventType } from "@/components/Timeline/Timeline"
import { useProjectDataContext } from "@/hooks/useProjectData"
import CountDownTimer from "@/components/CountDownTimer"
import ShowPayoutSchedule from "./ShowPayoutSchedule"
import Divider from "@/components/Divider"
import ProgressBar from "./ProgressBar"
import { TgeWrapper } from "./Wrapper"

import { ContributionAndRewardsType } from "@/data/contributionAndRewardsData"
import { Button } from "@/components/Button/Button"
import { formatCurrencyAmount } from "@/utils/format"
import { Icon } from "@/components/Icon/Icon"
import { formatDateForTimer } from "@/utils/date-helpers"
import { isBefore } from "date-fns/isBefore"

type RewardsProps = {
  eventData: ExpandedTimelineEventType
  hasDistributionStarted: boolean
  rewards: ContributionAndRewardsType["claimPositions"]["rewards"]
}

const Rewards = ({
  eventData,
  hasDistributionStarted,
  rewards,
}: RewardsProps) => {
  const { projectData } = useProjectDataContext()
  const { iconUrl, ticker } = projectData.tge.projectCoin
  const { t } = useTranslation()

  const currentMoment = new Date()
  const nextScheduledPayment = rewards.payoutSchedule.find(
    (payment) => !payment.isClaimed && isBefore(currentMoment, payment.date),
  )
  const amountToBeClaimed = rewards.payoutSchedule.reduce(
    (accumulator, payment) => {
      if (
        !payment.isClaimed &&
        !isBefore(currentMoment, payment.date) &&
        isBefore(payment.date, currentMoment)
      ) {
        return accumulator + payment.amount
      }
      return accumulator
    },
    0,
  )

  const claimRewardsHandler = () => {
    // @TODO - add API for claiming rewards
    console.log("CLAIM REWARDS")
    // @TODO - refetch rewards
  }

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
              endOfEvent={nextScheduledPayment.date}
            />
            <div className="w-full px-4 pb-6">
              {nextScheduledPayment && (
                <Button
                  btnText={`Claim ${formatCurrencyAmount(amountToBeClaimed, false)} ${ticker}`}
                  size="lg"
                  className="w-full py-3 font-normal"
                  onClick={claimRewardsHandler}
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
            <span>{t("reward_distribution.all_rewards_claimed")}</span>
          </div>
        )}
        {hasDistributionStarted && (
          <>
            <hr className="w-full max-w-[calc(100%-32px)] border-bd-primary" />
            <div className="flex w-full flex-col gap-2.5 p-4 pb-7">
              <div className="flex w-full items-center justify-between gap-2">
                <span className="text-sm font-medium">
                  {t("reward_distribution.claimed")}
                </span>
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
