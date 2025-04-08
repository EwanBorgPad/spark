import { useTranslation } from "react-i18next"

import { useProjectDataContext } from "@/hooks/useProjectData"
import CountDownTimer from "@/components/CountDownTimer"
import ShowPayoutSchedule from "./ShowPayoutSchedule"
import Divider from "@/components/Divider"
import ProgressBar from "./ProgressBar"
import { TgeWrapper } from "./Wrapper"

import { Button } from "@/components/Button/Button"
import { formatCurrencyAmount } from "shared/utils/format"
import { Icon } from "@/components/Icon/Icon"
import { formatDateForDisplay, formatDateForTimer } from "@/utils/date-helpers"
import { isBefore } from "date-fns/isBefore"
import Img from "@/components/Image/Img"
import Text from "@/components/Text"
import { useQuery } from "@tanstack/react-query"
import { backendApi } from "@/data/backendApi.ts"
import { useWalletContext } from "@/hooks/useWalletContext.tsx"

const Rewards = () => {
  const { t } = useTranslation()
  const { projectData, isLoading } = useProjectDataContext()
  const { address } = useWalletContext()
  const projectId = projectData?.id || ""

  const iconUrl = projectData?.config.launchedTokenData.iconUrl || ""
  const ticker = projectData?.config.launchedTokenData.ticker || ""

  const { data: myRewardsResponse } = useQuery({
    queryFn: () => {
      if (!address || !projectId) return
      return backendApi.getMyRewards({ address, projectId })
    },
    queryKey: ["getMyRewards", address, projectId],
    enabled: Boolean(address) && Boolean(projectId),
  })

  if (!myRewardsResponse?.hasUserInvested) {
    return null
  }

  const currentMoment = new Date()
  const nextScheduledPayment = myRewardsResponse?.rewards.payoutSchedule.find(
    (payment) => !payment.isClaimed && isBefore(currentMoment, payment.date),
  )

  const claimRewardsHandler = () => {
    /**
     * TODO @api for claiming rewards
     * - refetch rewards
     */
  }

  const rewardDistributionDate =
    projectData?.info.timeline.find((item) => item.id === "REWARD_DISTRIBUTION")?.date || null
  const isNan = myRewardsResponse.rewards.claimableAmount.uiAmount === "NaN"
  const btnText = isNan
    ? "Claim"
    : `Claim ${formatCurrencyAmount(myRewardsResponse.rewards.claimableAmount.uiAmount)} ${ticker}`

  const claimUrl = projectData?.info.claimUrl

  return (
    <>
      <Divider icon="SvgMedal" />
      <div className="mb-7 flex w-full flex-col items-center gap-1">
        <h2 className="text-4xl font-semibold">{t("sale_over.rewards")}</h2>
        {rewardDistributionDate && (
          <p className="text-center text-sm opacity-60">{`Monthly payments need to be Claimed manually. Distribution of rewards will start from ${formatDateForDisplay(rewardDistributionDate)}.`}</p>
        )}
        {/* <span className="cursor-pointer text-center text-sm underline opacity-60">
          {t("sale_over.learn_more_about")}
        </span> */}
      </div>
      <TgeWrapper label={t("sale_over.monthly_payout")}>
        {nextScheduledPayment ? (
          <CountDownTimer
            labelAboveTimer={`Next Payment: ${formatDateForTimer(new Date(nextScheduledPayment.date))}`}
            endOfEvent={new Date(nextScheduledPayment.date)}
          />
        ) : (
          <div className="flex items-center justify-center gap-2 px-4 pb-6 pt-12">
            <Icon icon="SvgCircledCheckmark" className="text-lg text-brand-primary" />
            <span>All previous payments are available for claim.</span>
          </div>
        )}
        <div className="w-full px-4 pb-6">
          {claimUrl ? (
            <a href={claimUrl} target="_blank" rel="noopener noreferrer">
              <Button btnText={btnText} size="lg" disabled={false} className="w-full py-3 font-normal" />
            </a>
          ) : (
            <Button btnText={btnText} size="lg" disabled={true} className="w-full py-3 font-normal" />
          )}
        </div>

        {/* Uncomment when claimed data per user is ready */}
        {/* {myRewardsResponse?.rewards.hasRewardsDistributionStarted && (
          <>
            <hr className="w-full max-w-[calc(100%-32px)] border-bd-primary" />
            <div className="flex w-full flex-col gap-2.5 p-4 pb-7">
              <div className="flex w-full items-center justify-between gap-2">
                <span className="text-sm font-medium">{t("reward_distribution.claimed")}</span>
                <div className="flex items-center gap-2">
                  <Img src={iconUrl} size="4" isFetchingLink={isLoading} />
                  <p>
                    <span className="mr-1">
                      {formatCurrencyAmount(myRewardsResponse.rewards.claimedAmount.uiAmount)}
                    </span>
                    <span className="mr-1">/</span>
                    <span className="mr-1">{formatCurrencyAmount(myRewardsResponse.rewards.totalAmount.uiAmount)}</span>
                    <Text text={ticker} isLoading={isLoading} />
                  </p>
                </div>
              </div>
              
              <ProgressBar
                fulfilledAmount={Number(myRewardsResponse.rewards.claimedAmount.uiAmount)}
                totalAmount={Number(myRewardsResponse.rewards.totalAmount.uiAmount)}
              /> 
            </div>
          </>
        )} */}
      </TgeWrapper>
      {myRewardsResponse?.rewards.hasRewardsDistributionStarted && (
        <ShowPayoutSchedule
          ticker={ticker}
          tokenIconUrl={iconUrl ?? ""}
          payoutSchedule={myRewardsResponse.rewards.payoutSchedule}
        />
      )}
    </>
  )
}

export default Rewards
