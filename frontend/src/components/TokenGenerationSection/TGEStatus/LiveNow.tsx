import { useTranslation } from "react-i18next"

import { ExtendedTimelineEventType } from "@/components/Timeline/Timeline"
import LiveNowExchange from "../components/LiveNowExchange"
import CountDownTimer from "@/components/CountDownTimer"
import { TgeWrapper } from "../components/Wrapper"
import { ProjectData } from "@/data/data"

type LiveNowProps = {
  eventData: ExtendedTimelineEventType
  userIsWhitelisted: boolean
  tgeData: ProjectData["tge"]
}

const LiveNow = ({ eventData, userIsWhitelisted, tgeData }: LiveNowProps) => {
  const { t } = useTranslation()

  return (
    <TgeWrapper label={t("tge.live_now")}>
      {eventData?.nextEventDate && (
        <CountDownTimer endOfEvent={eventData.nextEventDate} />
      )}
      <LiveNowExchange
        userIsWhitelisted={userIsWhitelisted}
        tgeData={tgeData}
      />
    </TgeWrapper>
  )
}

export default LiveNow
