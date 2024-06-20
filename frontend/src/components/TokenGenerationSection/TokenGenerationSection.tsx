import { useCallback, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { ExtendedTimelineEventType } from "../Timeline/Timeline"
import { getCurrentTgeEvent } from "@/utils/getCurrentTgeEvent"
import { CountDownCallback } from "../CountDownCallback"
import LaunchpadLive from "./TGEStatus/LaunchpadLive"
import SaleFinished from "./TGEStatus/SaleFinished"
import Whitelisting from "./TGEStatus/Whitelisting"
import { ProjectData } from "../../data/data"
import LiveNow from "./TGEStatus/LiveNow"

type Props = {
  data: ProjectData
  expandedTimeline: ExtendedTimelineEventType[]
}

const TokenGenerationSection = ({ expandedTimeline, data }: Props) => {
  const { t } = useTranslation()
  const [currentTgeEvent, setCurrentTgeEvent] =
    useState<ExtendedTimelineEventType>(getCurrentTgeEvent(expandedTimeline))

  const updateTgeStatus = useCallback(() => {
    const newTgeStatus = getCurrentTgeEvent(expandedTimeline)
    setCurrentTgeEvent(newTgeStatus)
  }, [expandedTimeline])

  ///////////////////////////////////////////////////////////
  // @TODO - Add API for checking user eligibility //////////
  ///////////////////////////////////////////////////////////

  useEffect(() => {
    updateTgeStatus()
  }, [expandedTimeline, updateTgeStatus])

  const renderComponent = (tgeEvent: ExtendedTimelineEventType) => {
    switch (tgeEvent.id) {
      case "INACTIVE":
        return <span>{t("tge.not_opened_yet")}</span>
      case "REGISTRATION_OPENS":
        return <Whitelisting eventData={currentTgeEvent} projectData={data} />
      case "SALE_OPENS":
        return <LiveNow eventData={tgeEvent} projectData={data} />
      case "SALE_CLOSES":
        return <SaleFinished eventData={tgeEvent} />
      case "REWARD_DISTRIBUTION":
        return <LaunchpadLive eventData={tgeEvent} />
      case "UNKNOWN":
        return <span>{tgeEvent.label}</span>
    }
  }

  return (
    <>
      <CountDownCallback
        endOfEvent={currentTgeEvent.nextEventDate}
        callbackWhenTimeExpires={updateTgeStatus}
      />
      {renderComponent(currentTgeEvent)}
    </>
  )
}

export default TokenGenerationSection
