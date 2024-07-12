import { ExpandedTimelineEventType } from "@/components/Timeline/Timeline"
import { isBefore } from "date-fns/isBefore"

const inactiveStatus: ExpandedTimelineEventType = {
  label: "Registration not opened yet",
  id: "INACTIVE",
  date: new Date(),
  nextEventDate: new Date(),
}

export const getCurrentTgeEvent = (timeline: ExpandedTimelineEventType[]) => {
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
