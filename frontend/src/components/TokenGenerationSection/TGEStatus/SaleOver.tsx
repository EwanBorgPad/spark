import { Tweet, TweetNotFound } from "react-tweet"
import { useTranslation } from "react-i18next"
import { twMerge } from "tailwind-merge"
import { useRef } from "react"

import { ExpandedTimelineEventType } from "@/components/Timeline/Timeline"
import { ConnectButton } from "@/components/Header/ConnectButton"
import YourContribution from "../components/YourContribution"
import { useWalletContext } from "@/hooks/useWalletContext"
import { getTweetIdFromURL } from "@/utils/tweetParser"
import { Button } from "@/components/Button/Button"
import Rewards from "../components/Rewards"
import Divider from "@/components/Divider"

// to be replaced with API calls
import {
  ContributionAndRewardsType,
  contributionAndRewardsData,
} from "@/data/contributionAndRewardsData"
import SaleOverResults from "../components/SaleOverResults"
import { ProjectData } from "@/data/projectData"

type LiveProps = {
  eventData: ExpandedTimelineEventType
  projectData: ProjectData
}

const SaleOver = ({ eventData, projectData }: LiveProps) => {
  const contributionsRef = useRef<HTMLDivElement>(null)
  const rewardsRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()
  const { walletState } = useWalletContext()

  ////////////////////////////////////////////////////////
  // @TODO - add API for getting contribution info ///////
  ////////////////////////////////////////////////////////
  const getContributionInfo = (): ContributionAndRewardsType | null => {
    return contributionAndRewardsData
  }
  const contributionInfo = getContributionInfo()
  const userDidContribute = !!contributionInfo?.suppliedBorg.total

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

        <SaleOverResults saleResults={projectData.saleResults} />

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
                rewards={contributionInfo.claimPositions.rewards}
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
