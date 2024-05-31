import React from "react"
import { TgeWrapper } from "../Wrapper"
import { useTranslation } from "react-i18next"
import CountDownTimer from "@/components/CountDownTimer"
import { ExtendedTimelineEventType } from "@/components/Timeline/Timeline"
import WhitelistingLP from "../WhitelistingLP"
import { ProjectData } from "@/data/data"

type WhitelistingProps = {
  eventData: ExtendedTimelineEventType
  whitelistingData: ProjectData["whitelisting"]
}

const Whitelisting = ({ eventData, whitelistingData }: WhitelistingProps) => {
  const { t } = useTranslation()
  return (
    <TgeWrapper label={t("tge.whitelisting")}>
      {eventData?.nextEventDate && (
        <>
          <CountDownTimer endOfEvent={eventData.nextEventDate} />
        </>
      )}
      <WhitelistingLP data={whitelistingData} />
    </TgeWrapper>
  )
}

export default Whitelisting
