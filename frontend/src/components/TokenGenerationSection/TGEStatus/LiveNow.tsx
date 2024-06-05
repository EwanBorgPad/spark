import { useTranslation } from "react-i18next"

import { ExtendedTimelineEventType } from "@/components/Timeline/Timeline"
import LiveNowExchange from "../components/LiveNowExchange"
import CountDownTimer from "@/components/CountDownTimer"
import { TgeWrapper } from "../components/Wrapper"

type LiveNowProps = {
  eventData: ExtendedTimelineEventType
}

const LiveNow = ({ eventData }: LiveNowProps) => {
  const { t } = useTranslation()

  return (
    <TgeWrapper label={t("tge.live_now")}>
      {eventData?.nextEventDate && (
        <CountDownTimer endOfEvent={eventData.nextEventDate} />
      )}
      <LiveNowExchange />
    </TgeWrapper>
  )
}

export default LiveNow
