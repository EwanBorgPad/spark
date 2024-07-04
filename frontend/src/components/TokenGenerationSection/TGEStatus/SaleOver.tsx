import { Tweet, TweetNotFound } from "react-tweet"
import { useTranslation } from "react-i18next"
import { twMerge } from "tailwind-merge"
import { useRef } from "react"

import { ExpandedTimelineEventType } from "@/components/Timeline/Timeline"
import { ConnectButton } from "@/components/Header/ConnectButton"
import YourContribution from "../components/YourContribution"
import { useWalletContext } from "@/hooks/useWalletContext"
import { getTweetIdFromURL } from "@/utils/tweetParser"
import { formatCurrencyAmount } from "@/utils/format"
import { Button } from "@/components/Button/Button"
import Rewards from "../components/Rewards"
import Divider from "@/components/Divider"

// to be replaced with API calls
import { ContributionType, contributionData } from "@/data/contributionData"
import { ProjectData } from "@/data/projectData"
import { tokenData } from "@/data/tokenData"

type LiveProps = {
  eventData: ExpandedTimelineEventType
  projectData: ProjectData
}

const SaleOver = ({ eventData, projectData }: LiveProps) => {
  const contributionsRef = useRef<HTMLDivElement>(null)
  const rewardsRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()

  const {
    totalAmountRaised,
    sellOutPercentage,
    participantCount,
    averageInvestedAmount,
  } = projectData.saleResults

  const { walletState } = useWalletContext()

  ////////////////////////////////////////////////////////
  // @TODO - add API for getting contribution info ///////
  ////////////////////////////////////////////////////////
  const getContributionInfo = (): ContributionType | null => {
    return contributionData
  }
  const contributionInfo = getContributionInfo()
  const userDidContribute = !!contributionInfo?.suppliedBorg.total

  /////////////////////////////////////////////////
  // @TODO - add API for getting token info ///////
  /////////////////////////////////////////////////
  const getTokenInfo = () => {
    return tokenData
  }
  const { marketCap, fdv } = getTokenInfo()

  const scrollToRewards = () => {
    if (!contributionsRef.current) return
    if (userDidContribute) {
      if (!rewardsRef.current) return
      window.scrollBy({
        behavior: "smooth",
        top: rewardsRef.current.getBoundingClientRect().top - 100,
      })
      return
    }
    window.scrollBy({
      behavior: "smooth",
      top: contributionsRef.current.getBoundingClientRect().top - 100,
    })
  }

  const tweetId = getTweetIdFromURL(projectData.tge.tweetURL)
  const sectionClass = "flex w-full max-w-[400px] flex-col items-center gap-6"
  const hasDistributionStarted = eventData.id === "REWARD_DISTRIBUTION"

  return (
    <>
      <div className="flex w-full flex-col items-center gap-9">
        <div className="flex w-full flex-col items-center gap-1">
          <h2 className="text-4xl font-semibold leading-11">
            {hasDistributionStarted ? t("reward_distribution") : t("sale_over")}
          </h2>
          <span className="text-sm opacity-60">{t("sale_over.thank_you")}</span>

          {/* @TODO - Add ScrollTo event when you make targeted component */}
          <Button
            color="plain"
            className="cursor-pointer py-0 text-sm underline"
            onClick={scrollToRewards}
          >
            {t("sale_over.check_your_rewards")}
          </Button>
        </div>

        <div className="flex w-full flex-wrap gap-x-4 gap-y-5 rounded-lg border-[1px] border-bd-primary bg-secondary px-5 py-4">
          <div className="flex min-w-[167px] flex-1 basis-[26%] flex-col gap-1">
            <span className="text-sm text-fg-tertiary">
              {t("sale_over.total_amount_raised")}
            </span>
            <span className="font-geist-mono text-base leading-7 text-fg-primary">
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

        <div className="w-full max-w-[400px]" data-theme="dark">
          {tweetId ? <Tweet id={tweetId} /> : <TweetNotFound />}
        </div>
      </div>

      <div
        ref={contributionsRef}
        className="flex w-full flex-col items-center gap-9"
      >
        <Divider icon="SvgHandWithWallet" />
        <h3 className="text-[32px] font-semibold leading-tight">
          {t("sale_over.your_contribution")}
        </h3>
        {walletState !== "CONNECTED" ? (
          <ConnectButton
            customBtnText={"Connect Wallet to See Contribution"}
            btnClassName="py-3 px-4 w-full max-w-[400px] text-base"
          />
        ) : userDidContribute ? (
          <>
            <section className={sectionClass}>
              <YourContribution
                contributionInfo={contributionInfo}
                eventData={eventData}
              />
            </section>
            <section
              ref={rewardsRef}
              className={twMerge(sectionClass, "mt-7 gap-4")}
            >
              <Rewards
                eventData={eventData}
                hasDistributionStarted={hasDistributionStarted}
              />
            </section>
          </>
        ) : (
          <div className="w-full max-w-[400px] rounded-lg border border-bd-primary bg-secondary px-4 py-3 text-sm opacity-60">
            {t("sale_over.wallet_didnt_contribute")}
          </div>
        )}
      </div>
    </>
  )
}

export default SaleOver
