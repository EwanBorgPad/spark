import { useCallback, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { ExpandedTimelineEventType } from "../Timeline/Timeline"
import { getCurrentTgeEvent } from "@/utils/getCurrentTgeEvent"
import { useProjectDataContext } from "@/hooks/useProjectData"
import { CountDownCallback } from "../CountDownCallback"
import Whitelisting from "./TGEStatus/Whitelisting"
import SaleOver from "./TGEStatus/SaleOver"
import LiveNow from "./TGEStatus/LiveNow"

type Props = {
  expandedTimeline: ExpandedTimelineEventType[]
}

const TokenGenerationSection = ({ expandedTimeline }: Props) => {
  const { projectData } = useProjectDataContext()
  const { t } = useTranslation()
  const [currentTgeEvent, setCurrentTgeEvent] =
    useState<ExpandedTimelineEventType>(getCurrentTgeEvent(expandedTimeline))

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

  const renderComponent = (tgeEvent: ExpandedTimelineEventType) => {
    switch (tgeEvent.id) {
      case "INACTIVE":
        return <span>{t("tge.not_opened_yet")}</span>
      case "REGISTRATION_OPENS":
        return (
          <Whitelisting eventData={currentTgeEvent} projectData={projectData} />
        )
      case "SALE_OPENS":
        return <LiveNow eventData={tgeEvent} projectData={projectData} />
      case "SALE_CLOSES":
      case "REWARD_DISTRIBUTION":
        return <SaleOver eventData={tgeEvent} projectData={projectData} />
      case "UNKNOWN":
        return <span>{"PHASE TO BE DETERMINED"}</span>
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
