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
import {
  EligibilityCompliancesSection,
  EligibilityTiersSection,
} from "@/components/EligibilitySection/EligibilitySection.tsx"
import { useWalletContext } from "@/hooks/useWalletContext.tsx"
import { useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { backendApi } from "@/data/backendApi.ts"
import DataRoom from "@/components/LaunchPool/DataRoom"

type LiveNowProps = {
  eventData: ExpandedTimelineEventType
  timeline: ExpandedTimelineEventType[]
}

const LiveNow = ({ eventData, timeline }: LiveNowProps) => {
  const { t } = useTranslation()
  const eligibilitySectionRef = useRef<HTMLDivElement>(null)

  const { address } = useWalletContext()
  const { projectId } = useParams()
  const { data: eligibilityStatusData } = useQuery({
    queryFn: () => {
      if (!address || !projectId) return
      return backendApi.getEligibilityStatus({ address, projectId })
    },
    queryKey: ["getEligibilityStatus", address, projectId],
    enabled: Boolean(address) && Boolean(projectId),
  })
  const isUserEligible = eligibilityStatusData?.isEligible

  return (
    <div className="flex w-full flex-col items-center px-4">
      <div className="flex w-full max-w-[764px] flex-col items-center gap-[52px]">
        <BasicTokenInfo />

        <DataRoom />

        <Timeline timelineEvents={timeline} />

        <SaleProgress />

        <EligibilityCompliancesSection className="w-full max-w-[432px]" />
        <div className="flex w-full max-w-[432px] flex-col gap-5">
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
              {/*<TopContributor />*/}
              <PastOrders />
            </>
          )}
        </div>
        <EligibilityTiersSection className="w-full max-w-[432px]" />
      </div>
    </div>
  )
}

export default LiveNow
