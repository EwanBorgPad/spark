import { useCallback, useEffect, useState } from "react"
import { isBefore } from "date-fns/isBefore"

import { ExtendedTimelineEventType } from "../Timeline/Timeline"
import LaunchpadLive from "./TGEStatus/LaunchpadLive"
import { CountDownCallback } from "../CountDownCallback"
import Whitelisting from "./TGEStatus/Whitelisting"
import SaleFinished from "./TGEStatus/SaleFinished"
import { ProjectData } from "../../data/data"
import Live from "./TGEStatus/Live"

type Props = {
  data: ProjectData
  expandedTimeline: ExtendedTimelineEventType[]
}

const inactiveStatus: ExtendedTimelineEventType = {
  label: "Registration not opened yet",
  id: "INACTIVE",
  date: new Date(),
  nextEventDate: new Date(),
}

export const getCurrentTgeEvent = (timeline: ExtendedTimelineEventType[]) => {
  const currentMoment = new Date()
  const status = timeline.find((event) => {
    const isEventFinished = isBefore(event.date, currentMoment)
    if (!isEventFinished) return false

    const isThisLastActivatedEvent = Boolean(
      event?.nextEventDate && isBefore(new Date(), event.nextEventDate),
    )
    return isThisLastActivatedEvent
  })
  if (!status) return inactiveStatus
  return status
}

const TokenGenerationSection = ({ expandedTimeline, data }: Props) => {
  const [currentTgeEvent, setCurrentTgeEvent] =
    useState<ExtendedTimelineEventType>(getCurrentTgeEvent(expandedTimeline))

  const updateTgeStatus = useCallback(() => {
    const newTgeStatus = getCurrentTgeEvent(expandedTimeline)
    setCurrentTgeEvent(newTgeStatus)
  }, [expandedTimeline])

  useEffect(() => {
    updateTgeStatus()
  }, [expandedTimeline, updateTgeStatus])

  const renderComponent = (tgeEvent: ExtendedTimelineEventType) => {
    switch (tgeEvent.id) {
      case "INACTIVE":
        return <span>Registration not opened yet</span>
      case "REGISTRATION_OPENS":
        return (
          <Whitelisting
            eventData={tgeEvent}
            whitelistingData={data.whitelisting}
          />
        )
      case "SALE_OPENS":
        return <Live eventData={tgeEvent} />
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
