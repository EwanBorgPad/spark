import React from "react"
import { TgeWrapper } from "../components/Wrapper"
import { useTranslation } from "react-i18next"
import CountDownTimer from "@/components/CountDownTimer"
import { ExtendedTimelineEventType } from "@/components/Timeline/Timeline"
import WhitelistingLP from "../components/WhitelistingLP"
import { ProjectData } from "@/data/data"

type WhitelistingProps = {
  eventData: ExtendedTimelineEventType
  tgeData: ProjectData["tge"]
}

const Whitelisting = ({ eventData, tgeData }: WhitelistingProps) => {
  const { t } = useTranslation()
  return (
    <TgeWrapper label={t("tge.whitelisting")}>
      {eventData?.nextEventDate && (
        <>
          <CountDownTimer endOfEvent={eventData.nextEventDate} />
        </>
      )}
      <WhitelistingLP tgeData={tgeData} />
    </TgeWrapper>
  )
}

export default Whitelisting
