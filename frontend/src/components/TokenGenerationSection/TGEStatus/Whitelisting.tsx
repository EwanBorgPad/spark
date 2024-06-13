import { useTranslation } from "react-i18next"

import { ExtendedTimelineEventType } from "@/components/Timeline/Timeline"
import WhitelistingContent from "../components/WhitelistingContent"
import CountDownTimer from "@/components/CountDownTimer"
import { TgeWrapper } from "../components/Wrapper"
import WhitelistStatus from "../WhitelistStatus"
import { ProjectData } from "@/data/data"

type WhitelistingProps = {
  eventData: ExtendedTimelineEventType
  tgeData: ProjectData["tge"]
}

const Whitelisting = ({ eventData, tgeData }: WhitelistingProps) => {
  const { t } = useTranslation()
  return (
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
  )
}

export default Whitelisting
