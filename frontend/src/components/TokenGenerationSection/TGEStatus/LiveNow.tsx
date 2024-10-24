import { useTranslation } from "react-i18next"

import BasicTokenInfo from "@/components/TokenGenerationSection/components/BasicTokenInfo"
import { ExpandedTimelineEventType } from "@/components/Timeline/Timeline"
import { useWhitelistStatusContext } from "@/hooks/useWhitelistContext"
import LiveNowExchange from "../components/LiveNowExchange"
import SaleProgress from "../components/SaleProgress"
import { formatDateForTimer } from "@/utils/date-helpers"
import CountDownTimer from "@/components/CountDownTimer"
import { PastOrders } from "../components/PastOrders"
import { TgeWrapper } from "../components/Wrapper"
import TopContributor from "../components/TopContributor"
import { useRef } from "react"
import { EligibilitySection } from "@/components/EligibilitySection/EligibilitySection.tsx"

type LiveNowProps = {
  eventData: ExpandedTimelineEventType
}

const LiveNow = ({ eventData }: LiveNowProps) => {
  const { t } = useTranslation()
  const whitelistRef = useRef<HTMLDivElement>(null)
  const { whitelistStatus } = useWhitelistStatusContext()

  return (
    <div className="flex w-full flex-col items-center gap-[52px]">
      <BasicTokenInfo />
      <SaleProgress />
      {!whitelistStatus?.whitelisted && (
        <div className="flex w-full flex-col items-center" ref={whitelistRef}>
          {/* TODO is this needed here? can't find it on figma design */}
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
          <LiveNowExchange whitelistRequirementsRef={whitelistRef} />
        </TgeWrapper>
        {whitelistStatus?.whitelisted && (
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
