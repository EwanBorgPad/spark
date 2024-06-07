import { useTranslation } from "react-i18next"

import { ExtendedTimelineEventType } from "@/components/Timeline/Timeline"
import LiveNowExchange from "../components/LiveNowExchange"
import CountDownTimer from "@/components/CountDownTimer"
import { PastOrders } from "../components/PastOrders"
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
    <div className="flex w-full max-w-[400px] flex-col gap-5">
      <TgeWrapper label={t("tge.live_now")}>
        {eventData?.nextEventDate && (
          <CountDownTimer endOfEvent={eventData.nextEventDate} />
        )}
        <LiveNowExchange
          userIsWhitelisted={userIsWhitelisted}
          tgeData={tgeData}
        />
      </TgeWrapper>
      <PastOrders tgeData={tgeData} />
    </div>
  )
}

export default LiveNow
