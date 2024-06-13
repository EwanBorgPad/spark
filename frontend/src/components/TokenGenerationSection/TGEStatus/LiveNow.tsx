import { useTranslation } from "react-i18next"

import { ExtendedTimelineEventType } from "@/components/Timeline/Timeline"
import {
  WhitelistStatusType,
  whitelistDummyData,
} from "@/data/whitelistingData"
import LiveNowExchange from "../components/LiveNowExchange"
import CountDownTimer from "@/components/CountDownTimer"
import { PastOrders } from "../components/PastOrders"
import { TgeWrapper } from "../components/Wrapper"
import WhitelistStatus from "../WhitelistStatus"
import { ProjectData } from "@/data/data"

type LiveNowProps = {
  eventData: ExtendedTimelineEventType
  isUserWhitelisted: boolean
  tgeData: ProjectData["tge"]
  whitelistStatus: WhitelistStatusType
}

const LiveNow = ({
  eventData,
  isUserWhitelisted,
  tgeData,
  whitelistStatus,
}: LiveNowProps) => {
  const { t } = useTranslation()

  return (
    <div className="flex w-full max-w-[400px] flex-col gap-5">
      <TgeWrapper label={t("tge.live_now")}>
        {eventData?.nextEventDate && (
          <CountDownTimer endOfEvent={eventData.nextEventDate} />
        )}
        <LiveNowExchange
          isUserWhitelisted={isUserWhitelisted}
          tgeData={tgeData}
        />
      </TgeWrapper>
      {whitelistStatus.whitelisted ? (
        <PastOrders tgeData={tgeData} />
      ) : (
        <WhitelistStatus
          isUserWhitelisted={isUserWhitelisted}
          whitelistStatus={whitelistStatus}
        />
      )}
    </div>
  )
}

export default LiveNow
