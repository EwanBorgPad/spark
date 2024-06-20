import { useTranslation } from "react-i18next"

import MarketAndTokensData from "@/components/MarketAndTokens/MarketAndTokensData"
import { ExtendedTimelineEventType } from "@/components/Timeline/Timeline"
import { useWhitelistStatusContext } from "@/hooks/useWhitelistContext"
import LiveNowExchange from "../components/LiveNowExchange"
import CountDownTimer from "@/components/CountDownTimer"
import { PastOrders } from "../components/PastOrders"
import { TgeWrapper } from "../components/Wrapper"
import WhitelistStatus from "../WhitelistStatus"
import { ProjectData } from "@/data/data"

type LiveNowProps = {
  eventData: ExtendedTimelineEventType
  projectData: ProjectData
}

const LiveNow = ({ eventData, projectData }: LiveNowProps) => {
  const { t } = useTranslation()

  const { whitelistStatus } = useWhitelistStatusContext()

  const tgeData = projectData.tge

  return (
    <>
      <MarketAndTokensData projectData={projectData} />
      <div className="flex w-full max-w-[400px] flex-col gap-5">
        <TgeWrapper label={t("tge.live_now")}>
          {eventData?.nextEventDate && (
            <CountDownTimer endOfEvent={eventData.nextEventDate} />
          )}
          <LiveNowExchange tgeData={tgeData} />
        </TgeWrapper>
        {whitelistStatus?.whitelisted ? (
          <PastOrders tgeData={tgeData} />
        ) : (
          <WhitelistStatus />
        )}
      </div>
    </>
  )
}

export default LiveNow
