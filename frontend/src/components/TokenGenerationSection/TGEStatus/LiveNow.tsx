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
import WhitelistStatus from "../WhitelistStatus"

type LiveNowProps = {
  eventData: ExpandedTimelineEventType
}

const LiveNow = ({ eventData }: LiveNowProps) => {
  const { t } = useTranslation()

  const { whitelistStatus } = useWhitelistStatusContext()

  return (
    <div className="flex w-full max-w-[432px] flex-col items-center gap-[52px] px-4">
      <div className="flex w-full flex-col gap-6">
        <BasicTokenInfo />
        <SaleProgress />
      </div>
      {!whitelistStatus?.whitelisted && <WhitelistStatus />}
      <div className="flex w-full flex-col gap-5">
        <TgeWrapper label={t("tge.live_now")}>
          {eventData?.nextEventDate && (
            <CountDownTimer
              endOfEvent={eventData.nextEventDate}
              labelAboveTimer={`Ends on ${formatDateForTimer(eventData.nextEventDate)}`}
            />
          )}
          <LiveNowExchange />
        </TgeWrapper>
        {whitelistStatus?.whitelisted && <PastOrders />}
      </div>
    </div>
  )
}

export default LiveNow
