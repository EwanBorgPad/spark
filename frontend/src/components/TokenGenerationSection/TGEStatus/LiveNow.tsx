import { useTranslation } from "react-i18next"

import BasicTokenInfo from "@/components/TokenGenerationSection/components/BasicTokenInfo"
import { ExpandedTimelineEventType } from "@/components/Timeline/Timeline"
import LiveNowExchange from "../components/LiveNowExchange"
import SaleProgress from "../components/SaleProgress"
import { formatDateForTimer } from "@/utils/date-helpers"
import CountDownTimer from "@/components/CountDownTimer"
import { PastOrders } from "../components/PastOrders"
import { TgeWrapper } from "../components/Wrapper"
import TopContributor from "../components/TopContributor"
import { useRef } from "react"
import { EligibilitySection } from "@/components/EligibilitySection/EligibilitySection.tsx"
import { useWalletContext } from "@/hooks/useWalletContext.tsx"
import { useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { backendApi } from "@/data/backendApi.ts"

type LiveNowProps = {
  eventData: ExpandedTimelineEventType
}

const LiveNow = ({ eventData }: LiveNowProps) => {
  const { t } = useTranslation()
  const eligibilitySectionRef = useRef<HTMLDivElement>(null)

  const { address } = useWalletContext()
  const { projectId } = useParams()
  const { data } = useQuery({
    queryFn: () => {
      if (!address || !projectId) return
      return backendApi.getEligibilityStatus({ address, projectId })
    },
    queryKey: ["getEligibilityStatus", address, projectId],
    enabled: Boolean(address) && Boolean(projectId),
  })
  const isUserEligible = data?.isEligible

  return (
    <div className="flex w-full flex-col items-center gap-[52px]">
      <BasicTokenInfo />
      <SaleProgress />
      {!isUserEligible && (
        <div className="flex w-full flex-col items-center" ref={eligibilitySectionRef}>
          <EligibilitySection />
        </div>
      )}
      <div className="flex w-full max-w-[432px] flex-col gap-5 px-4">
        <TgeWrapper label={t("tge.live_now")}>
          {eventData?.nextEventDate && (
            <CountDownTimer
              endOfEvent={eventData.nextEventDate}
              labelAboveTimer={`Ends on ${formatDateForTimer(eventData.nextEventDate)}`}
            />
          )}
          <LiveNowExchange eligibilitySectionRef={eligibilitySectionRef} />
        </TgeWrapper>
        {isUserEligible && (
          <>
            <TopContributor />
            <PastOrders />
          </>
        )}
      </div>
    </div>
  )
}

export default LiveNow
