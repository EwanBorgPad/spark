import { useTranslation } from "react-i18next"

import Timeline, { ExpandedTimelineEventType } from "@/components/Timeline/Timeline"
import WhitelistingContent from "../components/WhitelistingContent"
import CountDownTimer from "@/components/CountDownTimer"
import { TgeWrapper } from "../components/Wrapper"
import { formatDateForTimer } from "@/utils/date-helpers"
import { JoinThePool } from "@/components/EligibilitySection/JoinThePool.tsx"
import { Button } from "@/components/Button/Button"
import { useRef } from "react"
import { useWalletContext } from "@/hooks/useWalletContext"
import { useQuery } from "@tanstack/react-query"
import { backendApi } from "@/data/api/backendApi"
import { useParams } from "react-router-dom"
import Banner from "@/components/Projects/Banner"

type RegistrationOpensPhaseProps = {
  eventData: ExpandedTimelineEventType
  timeline: ExpandedTimelineEventType[]
}
/**
 * @param eventData
 * @constructor
 */
const RegistrationOpensPhase = ({ eventData, timeline }: RegistrationOpensPhaseProps) => {
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

  return (
    <div className="flex w-full flex-col items-center px-4">
      <div className="flex w-full max-w-[792px] flex-col items-center gap-[52px]">
        <div className="flex w-full flex-col gap-4">
          <Timeline timelineEvents={timeline} />
          <Banner type="WIDE" />
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

        {/* main section with borg/token math */}
        <div className="flex w-full max-w-[432px] flex-col gap-5">
          <TgeWrapper label={t("tge.lp_terms")}>
            {eventData?.nextEventDate && (
              <>
                <CountDownTimer
                  endOfEvent={eventData.nextEventDate}
                  labelAboveTimer={`Going live on ${formatDateForTimer(eventData.nextEventDate)}`}
                />
              </>
            )}
            <WhitelistingContent />
          </TgeWrapper>
          <a
            href="https://swissborg.com/blog/become-market-maker-with-agora-alpha"
            target="_blank"
            className="text-center text-sm font-light text-fg-secondary underline"
            rel="noreferrer"
          >
            {t("tge.learn_more_about")}
          </a>
        </div>
        <div ref={joinThePoolRef} className="flex w-full flex-col items-center">
          <JoinThePool />
        </div>
      </div>
    </div>
  )
}

export default RegistrationOpensPhase
