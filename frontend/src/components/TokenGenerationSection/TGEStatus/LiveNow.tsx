import { useTranslation } from "react-i18next"

import BasicTokenInfo from "@/components/TokenGenerationSection/components/BasicTokenInfo"
import Timeline, { ExpandedTimelineEventType } from "@/components/Timeline/Timeline"
import LiveNowExchange from "../components/LiveNowExchange"
import SaleProgress from "../components/SaleProgress"
import { formatDateForTimer } from "@/utils/date-helpers"
import CountDownTimer from "@/components/CountDownTimer"
import { PastOrders } from "../components/PastOrders"
import { TgeWrapper } from "../components/Wrapper"
import { useRef } from "react"
import { JoinThePool } from "@/components/EligibilitySection/JoinThePool.tsx"
import { useWalletContext } from "@/hooks/useWalletContext.tsx"
import { useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { backendApi } from "@/data/backendApi.ts"
import DataRoom from "@/components/LaunchPool/DataRoom"
import { twMerge } from "tailwind-merge"
import { Button } from "@/components/Button/Button"
import { useProjectDataContext } from "@/hooks/useProjectData"
import LiveNowCountdown from "@/Countdown/LiveNowCountdown"
import { isBefore } from "date-fns"

type LiveNowProps = {
  eventData: ExpandedTimelineEventType
  timeline: ExpandedTimelineEventType[]
}

const LiveNow = ({ eventData, timeline }: LiveNowProps) => {
  const { t } = useTranslation()
  const { projectData } = useProjectDataContext()
  const joinThePoolRef = useRef<HTMLDivElement>(null)

  const { address } = useWalletContext()
  const { projectId } = useParams()

  console.log(projectData?.info.tiers)

  // GET eligibility status
  const { data: eligibilityStatusData } = useQuery({
    queryFn: () => {
      if (!address || !projectId) return
      return backendApi.getEligibilityStatus({ address, projectId })
    },
    queryKey: ["getEligibilityStatus", address, projectId],
    enabled: Boolean(address) && Boolean(projectId),
    staleTime: 1000 * 60 * 60,
  })

  const isUserEligible = eligibilityStatusData?.isEligible
  const tierBenefits = eligibilityStatusData?.eligibilityTier?.benefits

  const scrollToJoinThePool = () => {
    const top = joinThePoolRef.current?.getBoundingClientRect().top ?? 0
    window.scrollBy({
      behavior: "smooth",
      top: top - 100,
    })
  }

  const getCurrentTierLabel = () => {
    if (!projectData?.info.tiers) return
    const currentTier = projectData.info.tiers.findLast((tier) => {
      if (!tier.benefits.startDate) return false
      return isBefore(tier.benefits.startDate, new Date())
    })
    return currentTier?.label ?? null
  }
  const currentTierLabel = getCurrentTierLabel()

  return (
    <div className="flex w-full flex-col items-center px-4">
      <div className="flex w-full max-w-[764px] flex-col items-center gap-[52px]">
        <BasicTokenInfo />

        <DataRoom />

        <Timeline timelineEvents={timeline} />

        {!isUserEligible && (
          <div className="relative flex w-full justify-center pb-8">
            <div className="relative h-fit">
              <Button
                btnText="Participate in the Pool"
                onClick={scrollToJoinThePool}
                className="w-full active:scale-100"
              />
              <div className="absolute inset-0 z-[-1] h-full w-full animate-pulse rounded-xl shadow-around shadow-brand-primary/60"></div>
            </div>
          </div>
        )}

        <SaleProgress />
        <div className="flex w-full max-w-[432px] flex-col gap-5">
          <TgeWrapper label={`${t("tge.live_now")}${currentTierLabel ? ` - ${currentTierLabel}` : ""}`}>
            <LiveNowCountdown project={projectData} />
            <LiveNowExchange scrollToEligibilitySection={scrollToJoinThePool} eligibilitySectionRef={joinThePoolRef} />
          </TgeWrapper>
          {isUserEligible && (
            <>
              {/*<TopContributor />*/}
              <PastOrders />
            </>
          )}
        </div>
        <div ref={joinThePoolRef} className="flex w-full flex-col items-center">
          <JoinThePool />
        </div>
      </div>
    </div>
  )
}

export default LiveNow
