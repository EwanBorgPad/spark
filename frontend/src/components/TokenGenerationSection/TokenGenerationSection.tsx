import { useCallback, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { ExpandedTimelineEventType } from "../Timeline/Timeline"
import { getCurrentTgeEvent } from "@/utils/getCurrentTgeEvent"
import { CountDownCallback } from "../CountDownCallback"
import RegistrationOpensPhase from "./TGEStatus/RegistrationOpensPhase.tsx"
import SaleOver from "./TGEStatus/SaleOver"
import LiveNow from "./TGEStatus/LiveNow"
import DistributionOver from "./TGEStatus/DistributionOver"
import Upcoming from "./TGEStatus/Upcoming.tsx"

type Props = {
  expandedTimeline: ExpandedTimelineEventType[]
}

const TokenGenerationSection = ({ expandedTimeline }: Props) => {
  const [currentTgeEvent, setCurrentTgeEvent] = useState<ExpandedTimelineEventType>(
    getCurrentTgeEvent(expandedTimeline),
  )

  const updateTgeStatus = useCallback(() => {
    const newTgeStatus = getCurrentTgeEvent(expandedTimeline)
    setCurrentTgeEvent(newTgeStatus)
  }, [expandedTimeline])

  useEffect(() => {
    updateTgeStatus()
  }, [expandedTimeline, updateTgeStatus])

  const renderComponent = (tgeEvent: ExpandedTimelineEventType) => {
    switch (tgeEvent.id) {
      case "UPCOMING":
        return <Upcoming timeline={expandedTimeline} />
      case "REGISTRATION_OPENS":
        return <RegistrationOpensPhase eventData={currentTgeEvent} timeline={expandedTimeline} />
      case "SALE_OPENS":
        return <LiveNow eventData={tgeEvent} timeline={expandedTimeline} />
      case "SALE_CLOSES":
      case "REWARD_DISTRIBUTION":
        return <SaleOver eventData={tgeEvent} timeline={expandedTimeline} />
      case "DISTRIBUTION_OVER":
        return <DistributionOver eventData={tgeEvent} timeline={expandedTimeline} />
    }
  }

  return (
    <div className="flex w-full flex-col items-center">
      {currentTgeEvent.nextEventDate && (
        <CountDownCallback endOfEvent={currentTgeEvent.nextEventDate} callbackWhenTimeExpires={updateTgeStatus} />
      )}
      {renderComponent(currentTgeEvent)}
    </div>
  )
}

export default TokenGenerationSection
