import React from "react"
import { TgeWrapper } from "../Wrapper"
import CountDownTimer from "@/components/CountDownTimer"
import { useTranslation } from "react-i18next"
import { ExtendedTimelineEventType } from "@/components/Timeline/Timeline"

type LiveProps = {
  eventData: ExtendedTimelineEventType
}

const Live = ({ eventData }: LiveProps) => {
  const { t } = useTranslation()
  return (
    <TgeWrapper label={t("tge.live")}>
      {eventData?.nextEventDate && (
        <CountDownTimer endOfEvent={eventData.nextEventDate} />
      )}
      <TgeWrapper.Inner>
        <span>Sale Opens Info</span>
      </TgeWrapper.Inner>
    </TgeWrapper>
  )
}

export default Live
