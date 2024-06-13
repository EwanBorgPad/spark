import { useTranslation } from "react-i18next"

import { ExtendedTimelineEventType } from "@/components/Timeline/Timeline"
import WhitelistingContent from "../components/WhitelistingContent"
import CountDownTimer from "@/components/CountDownTimer"
import { TgeWrapper } from "../components/Wrapper"
import { ProjectData } from "@/data/data"
import WhitelistStatus from "../WhitelistStatus"
import { WhitelistStatusType } from "@/data/whitelistingData"

type WhitelistingProps = {
  eventData: ExtendedTimelineEventType
  tgeData: ProjectData["tge"]
  isUserWhitelisted: boolean
  whitelistStatus: WhitelistStatusType
}

const Whitelisting = ({
  eventData,
  tgeData,
  isUserWhitelisted,
  whitelistStatus,
}: WhitelistingProps) => {
  const { t } = useTranslation()
  return (
    <div className="flex w-full max-w-[400px] flex-col gap-5">
      <TgeWrapper label={t("tge.whitelisting")}>
        {eventData?.nextEventDate && (
          <>
            <CountDownTimer endOfEvent={eventData.nextEventDate} />
          </>
        )}
        <WhitelistingContent
          tgeData={tgeData}
          isUserWhitelisted={isUserWhitelisted}
        />
      </TgeWrapper>
      <WhitelistStatus
        isUserWhitelisted={isUserWhitelisted}
        whitelistStatus={whitelistStatus}
      />
    </div>
  )
}

export default Whitelisting
