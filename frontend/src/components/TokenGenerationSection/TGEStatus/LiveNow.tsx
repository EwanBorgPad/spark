import { useTranslation } from "react-i18next"

import MarketAndTokensData from "@/components/TokenGenerationSection/components/MarketAndTokensData"
import { ExpandedTimelineEventType } from "@/components/Timeline/Timeline"
import { useWhitelistStatusContext } from "@/hooks/useWhitelistContext"
import LiveNowExchange from "../components/LiveNowExchange"
import CountDownTimer from "@/components/CountDownTimer"
import { PastOrders } from "../components/PastOrders"
import { TgeWrapper } from "../components/Wrapper"
import WhitelistStatus from "../WhitelistStatus"
import { formatDateForTimer } from "@/utils/date-helpers"
import { useProjectDataContext } from "@/hooks/useProjectData.tsx"

type LiveNowProps = {
  eventData: ExpandedTimelineEventType
}

const LiveNow = ({ eventData }: LiveNowProps) => {
  const { t } = useTranslation()

  const { whitelistStatus } = useWhitelistStatusContext()

  return (
    <div className="flex w-full flex-col items-center gap-[52px] px-4">
      <MarketAndTokensData />
      <div className="flex w-full max-w-[400px] flex-col gap-5">
        <TgeWrapper label={t("tge.live_now")}>
          {eventData?.nextEventDate && (
            <CountDownTimer
              endOfEvent={eventData.nextEventDate}
              labelAboveTimer={`Ends on ${formatDateForTimer(eventData.nextEventDate)}`}
            />
          )}
          <LiveNowExchange />
        </TgeWrapper>
        {whitelistStatus?.whitelisted ? <PastOrders /> : <WhitelistStatus />}
      </div>
    </div>
  )
}

export default LiveNow
