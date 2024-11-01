import { useCallback, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { ExpandedTimelineEventType } from "../Timeline/Timeline"
import { getCurrentTgeEvent } from "@/utils/getCurrentTgeEvent"
import { CountDownCallback } from "../CountDownCallback"
import RegistrationOpensPhase from "./TGEStatus/RegistrationOpensPhase.tsx"
import SaleOver from "./TGEStatus/SaleOver"
import LiveNow from "./TGEStatus/LiveNow"
import DistributionOver from "./TGEStatus/DistributionOver"

type Props = {
  expandedTimeline: ExpandedTimelineEventType[]
}

const TokenGenerationSection = ({ expandedTimeline }: Props) => {
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
      case "UPCOMING":
        return <span>{t("tge.not_opened_yet")}</span>
      case "REGISTRATION_OPENS":
        return <RegistrationOpensPhase eventData={currentTgeEvent} />
      case "SALE_OPENS":
        return <LiveNow eventData={tgeEvent} />
      case "SALE_CLOSES":
      case "REWARD_DISTRIBUTION":
        return <SaleOver eventData={tgeEvent} />
      case "DISTRIBUTION_OVER":
        return <DistributionOver eventData={tgeEvent} />
    }
  }

  return (
    <section className="flex w-full flex-col items-center">
      <CountDownCallback
        endOfEvent={currentTgeEvent.nextEventDate}
        callbackWhenTimeExpires={updateTgeStatus}
      />
      {renderComponent(currentTgeEvent)}
    </section>
  )
}

export default TokenGenerationSection
