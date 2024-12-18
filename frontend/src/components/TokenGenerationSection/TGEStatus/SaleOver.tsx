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

import SaleOverResults from "../components/SaleOverResults"
import { useProjectDataContext } from "@/hooks/useProjectData.tsx"
import { useQuery } from "@tanstack/react-query"
import { backendApi } from "@/data/backendApi"

type LiveProps = {
  eventData: ExpandedTimelineEventType
  timeline: ExpandedTimelineEventType[]
}

const SaleOver = ({ eventData, timeline }: LiveProps) => {
  const contributionsRef = useRef<HTMLDivElement>(null)
  const rewardsRef = useRef<HTMLDivElement>(null)
  const { projectData } = useProjectDataContext()
  const { t } = useTranslation()
  const { walletState } = useWalletContext()
  const { address } = useWalletContext()
  const projectId = projectData?.info.id || ""

  const { data: userPositions } = useQuery({
    queryFn: () => {
      if (!address || !projectId) return
      return backendApi.getMyRewards({ address, projectId })
    },
    queryKey: ["getMyRewards", address, projectId],
    enabled: Boolean(address) && Boolean(projectId),
  })
  const hasUserInvested = userPositions?.hasUserInvested

  const scrollToRewards = () => {
    if (!contributionsRef.current) return
    if (hasUserInvested) {
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

  const tweetId = projectData?.info.tge.tweetUrl ? getTweetIdFromURL(projectData.info.tge.tweetUrl) : ""
  const sectionClass = "flex w-full max-w-[400px] flex-col items-center gap-6 z-[1]"
  const hasDistributionStarted = eventData.id === "REWARD_DISTRIBUTION"

  return (
    <div key="sale-over" className="flex w-full flex-col items-center justify-center px-4">
      <div className="flex w-full max-w-[760px] flex-col items-center">
        <Timeline timelineEvents={timeline} />

        <div className="mt-[52px] flex w-full flex-col items-center gap-9">
          <div className="flex w-full flex-col items-center gap-1">
            <h2 className="text-center text-4xl font-semibold leading-11">
              {hasDistributionStarted ? t("reward_distribution") : t("sale_over")}
            </h2>
            <>
              <span className="text-sm opacity-60">{t("sale_over.thank_you")}</span>
              <Button color="plain" className="cursor-pointer py-0 text-sm underline" onClick={scrollToRewards}>
                {t("sale_over.check_your_rewards")}
              </Button>
            </>
          </div>

          <SaleOverResults />

          {tweetId && (
            <div className="w-full max-w-[400px]" data-theme="dark">
              <Tweet id={tweetId} />
              {/* {tweetId ? <Tweet id={tweetId} /> : <TweetNotFound />} */}
            </div>
          )}
        </div>
      </div>

      <div ref={contributionsRef} className="relative flex w-full flex-col items-center gap-9 pt-[80px]">
        <div
          className={twMerge(
            "absolute top-10 z-[-100] w-screen max-w-[100vw] overflow-hidden opacity-40 md:opacity-100 lg:top-16",
            !hasUserInvested || walletState !== "CONNECTED" ? "h-[247px] lg:top-0" : "",
          )}
        >
          <img src={backdropImg} className="lg:h-auto lg:w-screen" />
        </div>
        <div className="z-[100] flex flex-col items-center gap-9">
          <Divider icon="SvgHandWithWallet" />
          <h3 className="z-[1] px-4 text-[32px] font-semibold  leading-tight">{t("sale_over.your_contribution")}</h3>
          {walletState !== "CONNECTED" ? (
            <ConnectButton
              customBtnText={"Connect Wallet to See Contribution"}
              btnClassName="py-3 px-4 w-full max-w-[400px] text-base z-10  z-[1]"
            />
          ) : hasUserInvested ? (
            <>
              <section className={sectionClass}>
                <YourContribution />
              </section>
              {hasDistributionStarted && (
                <section ref={rewardsRef} className={twMerge(sectionClass, "mt-7 gap-4")}>
                  <Rewards />
                </section>
              )}
            </>
          ) : (
            <div className="z-[1] w-full max-w-[400px] rounded-lg border border-bd-primary bg-secondary px-4 py-3 text-sm opacity-60">
              {t("sale_over.wallet_didnt_contribute")}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SaleOver
