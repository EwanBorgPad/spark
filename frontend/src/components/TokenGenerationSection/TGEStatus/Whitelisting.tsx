import { useTranslation } from "react-i18next"

import MarketAndTokensData from "@/components/TokenGenerationSection/components/MarketAndTokensData"
import { ExpandedTimelineEventType } from "@/components/Timeline/Timeline"
import WhitelistingContent from "../components/WhitelistingContent"
import CountDownTimer from "@/components/CountDownTimer"
import { TgeWrapper } from "../components/Wrapper"
import WhitelistStatus from "../WhitelistStatus"
import { ProjectData } from "@/data/projectData"
import { formatDateForTimer } from "@/utils/date-helpers"

type WhitelistingProps = {
  eventData: ExpandedTimelineEventType
  projectData: ProjectData
}

const Whitelisting = ({ eventData, projectData }: WhitelistingProps) => {
  const { t } = useTranslation()

  const tgeData = projectData.tge

  return (
    <div className="flex w-full flex-col items-center gap-[52px] px-4">
      <MarketAndTokensData projectData={projectData} />
      <div className="flex w-full max-w-[400px] flex-col gap-5">
        <TgeWrapper label={t("tge.whitelisting")}>
          {eventData?.nextEventDate && (
            <>
              <CountDownTimer
                endOfEvent={eventData.nextEventDate}
                labelAboveTimer={`Going live on ${formatDateForTimer(eventData.nextEventDate)}`}
              />
            </>
          )}
          <WhitelistingContent tgeData={tgeData} />
        </TgeWrapper>
        <WhitelistStatus />
      </div>
    </div>
  )
}

export default Whitelisting
