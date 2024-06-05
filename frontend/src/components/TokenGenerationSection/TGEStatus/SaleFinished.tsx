import { ExtendedTimelineEventType } from "@/components/Timeline/Timeline"
import React from "react"
import { useTranslation } from "react-i18next"
import { TgeWrapper } from "../components/Wrapper"
import CountDownTimer from "@/components/CountDownTimer"

type LiveProps = {
  eventData: ExtendedTimelineEventType
}

const SaleFinished = ({ eventData }: LiveProps) => {
  const { t } = useTranslation()
  return (
    <TgeWrapper label={t("tge.sale_finished")}>
      {eventData?.nextEventDate && (
        <CountDownTimer endOfEvent={eventData.nextEventDate} />
      )}
    </TgeWrapper>
  )
}

export default SaleFinished
