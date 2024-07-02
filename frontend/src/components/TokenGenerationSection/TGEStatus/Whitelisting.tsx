import { useTranslation } from "react-i18next"

import MarketAndTokensData from "@/components/TokenGenerationSection/components/MarketAndTokensData"
import { ExpandedTimelineEventType } from "@/components/Timeline/Timeline"
import WhitelistingContent from "../components/WhitelistingContent"
import CountDownTimer from "@/components/CountDownTimer"
import { TgeWrapper } from "../components/Wrapper"
import WhitelistStatus from "../WhitelistStatus"
import { ProjectData } from "@/data/projectData"

type WhitelistingProps = {
  eventData: ExpandedTimelineEventType
  projectData: ProjectData
}

const Whitelisting = ({ eventData, projectData }: WhitelistingProps) => {
  const { t } = useTranslation()

  const tgeData = projectData.tge

  return (
    <>
      <MarketAndTokensData projectData={projectData} />
      <div className="flex w-full max-w-[400px] flex-col gap-5">
        <TgeWrapper label={t("tge.whitelisting")}>
          {eventData?.nextEventDate && (
            <>
              <CountDownTimer endOfEvent={eventData.nextEventDate} />
            </>
          )}
          <WhitelistingContent tgeData={tgeData} />
        </TgeWrapper>
        <WhitelistStatus />
      </div>
    </>
  )
}

export default Whitelisting
