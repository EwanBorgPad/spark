import { useTranslation } from "react-i18next"

import Timeline, { ExpandedTimelineEventType } from "@/components/Timeline/Timeline"
import LiveNowExchange from "../components/LiveNowExchange"
import SaleProgress from "../components/SaleProgress"
import { PastOrders } from "../components/PastOrders"
import { TgeWrapper } from "../components/Wrapper"
import { useRef, useState } from "react"
import { JoinThePool } from "@/components/EligibilitySection/JoinThePool.tsx"
import { useWalletContext } from "@/hooks/useWalletContext.tsx"
import { useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { backendApi } from "@/data/backendApi.ts"
import { Button } from "@/components/Button/Button"
import { useProjectDataContext } from "@/hooks/useProjectData"
import LiveNowCountdown from "@/Countdown/LiveNowCountdown"
import { isBefore } from "date-fns"
import { CountDownCallback } from "@/components/CountDownCallback"
import { isAfter } from "date-fns/isAfter"
import Banner from "@/components/Projects/Banner"

type LiveNowProps = {
  eventData: ExpandedTimelineEventType
  timeline: ExpandedTimelineEventType[]
}

const LiveNow = ({ timeline }: LiveNowProps) => {
  const { projectData } = useProjectDataContext()
  const [nextTier, setNextTier] = useState(projectData?.info.tiers[1] || null)
  const { t } = useTranslation()
  const joinThePoolRef = useRef<HTMLDivElement>(null)

  const { address } = useWalletContext()
  const { projectId } = useParams()

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

  const scrollToJoinThePool = () => {
    const top = joinThePoolRef.current?.getBoundingClientRect().top ?? 0
    window.scrollBy({
      behavior: "smooth",
      top: top - 100,
    })
  }

  const getCurrentTierLabel = () => {
    if (!projectData?.info.tiers) return
    // find last tier which has a startDate BEFORE the current moment
    const currentTier = projectData.info.tiers.findLast((tier) => {
      if (!tier.benefits.startDate) return false
      return isBefore(tier.benefits.startDate, new Date())
    })
    return currentTier?.label ?? null
  }
  const currentTierLabel = getCurrentTierLabel()

  const getNextTier = () => {
    if (!projectData?.info.tiers) return
    // find first tier which has a startDate AFTER or SAME as the current moment
    const nextTier = projectData.info.tiers.find((tier) => {
      if (!tier.benefits.startDate) return false
      return isAfter(tier.benefits.startDate, new Date()) || tier.benefits.startDate.getTime() === new Date().getTime()
    })
    setNextTier(nextTier || null) // cause a re-render of THIS component and its CHILD components. This will re-evaluate value of the current and the next tier.
  }

  return (
    <div className="flex w-full flex-col items-center px-4">
      <div className="flex w-full max-w-[792px] flex-col items-center gap-8">
        <div className="flex w-full flex-col gap-4">
          <Timeline timelineEvents={timeline} />
          <Banner />
        </div>

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

        <div className="mt-[20px] flex w-full max-w-[432px] flex-col gap-5">
          <TgeWrapper label={`${t("tge.live_now")}${currentTierLabel ? ` - ${currentTierLabel}` : ""}`}>
            <LiveNowCountdown project={projectData} />
            <LiveNowExchange scrollToEligibilitySection={scrollToJoinThePool} eligibilitySectionRef={joinThePoolRef} />

            {nextTier?.benefits.startDate && (
              <CountDownCallback endOfEvent={nextTier.benefits.startDate} callbackWhenTimeExpires={getNextTier} />
            )}
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
