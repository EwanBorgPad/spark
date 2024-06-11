import { useCallback, useEffect, useState } from "react"

import { ExtendedTimelineEventType } from "../Timeline/Timeline"
import { getCurrentTgeEvent } from "@/utils/getCurrentTgeEvent"
import { CountDownCallback } from "../CountDownCallback"
import LaunchpadLive from "./TGEStatus/LaunchpadLive"
import Whitelisting from "./TGEStatus/Whitelisting"
import SaleFinished from "./TGEStatus/SaleFinished"
import { ProjectData } from "../../data/data"
import LiveNow from "./TGEStatus/LiveNow"
import { useTranslation } from "react-i18next"

type Props = {
  data: ProjectData
  expandedTimeline: ExtendedTimelineEventType[]
  isUserWhitelisted: boolean
}

const TokenGenerationSection = ({
  expandedTimeline,
  data,
  isUserWhitelisted,
}: Props) => {
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
        return <Whitelisting eventData={tgeEvent} tgeData={data.tge} />
      case "SALE_OPENS":
        return (
          <LiveNow
            isUserWhitelisted={isUserWhitelisted}
            eventData={tgeEvent}
            tgeData={data.tge}
          />
        )
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
