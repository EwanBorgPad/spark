import { useCallback, useEffect, useState } from "react"

import { ExpandedTimelineEventType } from "../Timeline/Timeline"
import { getCurrentTgeEvent } from "@/utils/getCurrentTgeEvent"
import { CountDownCallback } from "../CountDownCallback"
import RegistrationOpensPhase from "./TGEStatus/RegistrationOpensPhase.tsx"
import SaleOver from "./TGEStatus/SaleOver"
import LiveNow from "./TGEStatus/LiveNow"
import DistributionOver from "./TGEStatus/DistributionOver"
import Upcoming from "./TGEStatus/Upcoming.tsx"
import { useProjectDataContext } from "@/hooks/useProjectData.tsx"
import TgeEventSkeleton from "./TGEStatus/TgeEventSkeleton.tsx"
import { useQuery } from "@tanstack/react-query"
import { useParams } from "react-router-dom"
import { backendApi } from "@/data/api/backendApi.ts"

type Props = {
  expandedTimeline: ExpandedTimelineEventType[]
}

const TokenGenerationSection = ({ expandedTimeline }: Props) => {
  const { isLoading } = useProjectDataContext()
  const { projectId } = useParams()
  const [currentTgeEvent, setCurrentTgeEvent] = useState<ExpandedTimelineEventType | null>(
    getCurrentTgeEvent(expandedTimeline),
  )

  const { data: saleData, isLoading: isLoadingSaleData } = useQuery({
    queryFn: async () => {
      if (!projectId) return null
      return await backendApi.getSaleResults({
        projectId,
      })
    },
    queryKey: ["saleResults", projectId],
    enabled: Boolean(projectId) && !!currentTgeEvent && currentTgeEvent.id === "SALE_OPENS",
    staleTime: 30 * 1000,
  })

  const updateTgeStatus = useCallback(() => {
    if (isLoading) return
    if (saleData && saleData.raiseTargetReached) {
      if (currentTgeEvent?.id !== "SALE_OPENS") return
      // if sale is live and target has been reached => close the sale
      const saleOverEvent = expandedTimeline.find((event) => event.id === "SALE_CLOSES")
      if (!saleOverEvent) return
      setCurrentTgeEvent(saleOverEvent)
      return
    }
    const newTgeStatus = getCurrentTgeEvent(expandedTimeline)
    setCurrentTgeEvent(newTgeStatus)
  }, [currentTgeEvent?.id, expandedTimeline, isLoading, saleData])

  useEffect(() => {
    if (isLoading) return
    updateTgeStatus()
  }, [expandedTimeline, isLoading, updateTgeStatus, saleData])

  const renderComponent = (tgeEvent: ExpandedTimelineEventType | null) => {
    if (!tgeEvent || !currentTgeEvent) return <></>
    switch (tgeEvent.id) {
      case "UPCOMING":
        return <Upcoming timeline={expandedTimeline} />
      case "REGISTRATION_OPENS":
        return <RegistrationOpensPhase eventData={currentTgeEvent} timeline={expandedTimeline} />
      case "SALE_OPENS":
        return <LiveNow eventData={tgeEvent} timeline={expandedTimeline} />
      case "SALE_CLOSES":
      case "REWARD_DISTRIBUTION":
        return <SaleOver eventData={tgeEvent} timeline={expandedTimeline} isRaiseTargetReached={saleData?.raiseTargetReached} />
      case "DISTRIBUTION_OVER":
        return <DistributionOver eventData={tgeEvent} timeline={expandedTimeline} />
    }
  }

  return (
    <div className="flex w-full flex-col items-center">
      {currentTgeEvent?.nextEventDate && (
        <CountDownCallback endOfEvent={currentTgeEvent.nextEventDate} callbackWhenTimeExpires={updateTgeStatus} />
      )}
      {isLoading || isLoadingSaleData ? <TgeEventSkeleton /> : renderComponent(currentTgeEvent)}
    </div>
  )
}

export default TokenGenerationSection
