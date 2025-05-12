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
import { backendApi } from "@/data/api/backendApi"
import { useWalletContext } from "@/hooks/useWalletContext.tsx"
import { useEffect } from "react"

const useScript = (src: string) => {
  useEffect(() => {
    const script = document.createElement('script')
    script.src = src
    script.type = 'module'
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [src])
}

const Rewards = () => {
  const { t } = useTranslation()
  const { projectData, isLoading } = useProjectDataContext()
  const { address } = useWalletContext()
  const projectId = projectData?.id || ""

  useScript("https://widgets.streamflow.finance/widgets/airdrop-claim/airdrop-claim-0-0-1.js")

  const iconUrl = projectData?.config.launchedTokenData.iconUrl || ""
  const ticker = projectData?.config.launchedTokenData.ticker || ""
  const endpoint = projectData?.config.cluster === "mainnet" ? "https://api.mainnet-beta.solana.com" : "https://api.devnet.solana.com"

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
            <sf-airdrop-claim
              data-theme="dark"
              name={ticker}
              cluster={projectData?.config.cluster}
              distributor-id={projectData?.info.claimUrl.split('/').pop() || ""}
              endpoint={endpoint}
              token-decimals={projectData?.config.launchedTokenData.decimals.toString() || "9"}
              token-symbol={ticker}
            />
          ) : (
            <Button btnText={btnText} size="lg" disabled={true} className="w-full py-3 font-normal" />
          )}
        </div>
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
