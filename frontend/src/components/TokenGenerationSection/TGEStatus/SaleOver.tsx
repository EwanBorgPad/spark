import { Tweet, TweetNotFound } from "react-tweet"
import { useTranslation } from "react-i18next"
import { twMerge } from "tailwind-merge"
import { useRef } from "react"

import Timeline, { ExpandedTimelineEventType } from "@/components/Timeline/Timeline"
import { ConnectButton } from "@/components/Header/ConnectButton"
import YourContribution from "../components/YourContribution"
import { useWalletContext } from "@/hooks/useWalletContext"
import backdropImg from "@/assets/bg-your-contribution.png"
import { getTweetIdFromURL } from "@/utils/tweetParser"
import { Button } from "@/components/Button/Button"
import Rewards from "../components/Rewards"
import Divider from "@/components/Divider"

// to be replaced with API calls
import { ContributionAndRewardsType, contributionAndRewardsData } from "@/data/contributionAndRewardsData"
import SaleOverResults from "../components/SaleOverResults"
import { useProjectDataContext } from "@/hooks/useProjectData.tsx"
import SaleUnsuccessful from "../components/SaleUnsuccessful"

type LiveProps = {
  eventData: ExpandedTimelineEventType
  timeline: ExpandedTimelineEventType[]
}

const SaleOver = ({ eventData, timeline }: LiveProps) => {
  const contributionsRef = useRef<HTMLDivElement>(null)
  const rewardsRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()
  const { walletState } = useWalletContext()
  const { projectData } = useProjectDataContext()

  ////////////////////////////////////////////////////////
  // TODO @api for getting contribution info ///////
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

  const tweetId = projectData.info.tge.tweetUrl ? getTweetIdFromURL(projectData.info.tge.tweetUrl) : ""
  const sectionClass = "flex w-full max-w-[432px] flex-col items-center gap-6 px-4"
  const hasDistributionStarted = eventData.id === "REWARD_DISTRIBUTION"

  return (
    <div className="flex w-full justify-center px-4">
      <div className="flex w-full max-w-[760px] flex-col items-center">
        <Timeline timelineEvents={timeline} />

        <div className="mt-[52px] flex w-full flex-col items-center gap-9 px-4">
          <div className="flex w-full flex-col items-center gap-1">
            <h2 className="text-4xl font-semibold leading-11">
              {hasDistributionStarted ? t("reward_distribution") : t("sale_over")}
            </h2>
            {projectData?.saleData?.saleSucceeded ? (
              <>
                <span className="text-sm opacity-60">{t("sale_over.thank_you")}</span>
                <Button color="plain" className="cursor-pointer py-0 text-sm underline" onClick={scrollToRewards}>
                  {t("sale_over.check_your_rewards")}
                </Button>
              </>
            ) : (
              <SaleUnsuccessful />
            )}
          </div>

          <SaleOverResults />

          <div className="w-full max-w-[400px]" data-theme="dark">
            {tweetId ? <Tweet id={tweetId} /> : <TweetNotFound />}
          </div>
        </div>

        {projectData?.saleData?.saleSucceeded && (
          <div ref={contributionsRef} className="relative flex w-full flex-col items-center gap-9 px-4 pt-[80px]">
            <Divider icon="SvgHandWithWallet" />
            <div
              className={twMerge(
                "max-w-screen absolute left-0 top-10 -z-[-10] w-full overflow-hidden lg:top-16",
                !userDidContribute || walletState !== "CONNECTED" ? "h-[247px] lg:top-0" : "",
              )}
            >
              <img src={backdropImg} className="lg:h-auto lg:w-screen" />
            </div>
            <h3 className="px-4 text-[32px] font-semibold leading-tight">{t("sale_over.your_contribution")}</h3>
            {walletState !== "CONNECTED" ? (
              <ConnectButton
                customBtnText={"Connect Wallet to See Contribution"}
                btnClassName="py-3 px-4 w-full max-w-[400px] text-base z-10"
              />
            ) : userDidContribute ? (
              <>
                <section className={sectionClass}>
                  <YourContribution contributionInfo={contributionInfo} eventData={eventData} />
                </section>
                <section ref={rewardsRef} className={twMerge(sectionClass, "mt-7 gap-4")}>
                  <Rewards
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
        )}
      </div>
    </div>
  )
}

export default SaleOver
