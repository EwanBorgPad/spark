import { ExpandedTimelineEventType } from "@/components/Timeline/Timeline"
import { isBefore } from "date-fns/isBefore"

const preWhitelistStatus: ExpandedTimelineEventType = {
  label: "Registration not opened yet",
  id: "UPCOMING",
  idRank: 1,
  date: new Date(),
  nextEventDate: new Date(),
}

export const getCurrentTgeEvent = (timeline: ExpandedTimelineEventType[]) => {
  const currentMoment = new Date()
  const status = timeline.find((event) => {
    const isEventFinished = isBefore(event.date, currentMoment)
    if (!isEventFinished) return false
    if (!event?.nextEventDate) return true

    const isThisLastActivatedEvent = Boolean(
      isBefore(new Date(), event.nextEventDate),
    )
    return isThisLastActivatedEvent
  })
  if (!status) return preWhitelistStatus
  return status
}
