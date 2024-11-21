import { ExpandedTimelineEventType } from "@/components/Timeline/Timeline"
import { isBefore } from "date-fns/isBefore"

const upcomingStatusTemplate: ExpandedTimelineEventType = {
  label: "Registration not opened yet",
  id: "UPCOMING",
  idRank: 1,
  date: new Date(),
  nextEventDate: null,
}

const generateUpcomingStatus = (whitelistStartDate: Date | null) => {
  const upcomingStatus = Object.assign(upcomingStatusTemplate, { nextEventDate: whitelistStartDate })
  return upcomingStatus
}

export const getCurrentTgeEvent = (timeline: ExpandedTimelineEventType[]) => {
  const currentMoment = new Date()
  const status = timeline.find((event) => {
    const hasEventStarted = event.date && !isBefore(currentMoment, event.date)
    const isEventFinished = event.date && isBefore(event.date, currentMoment)
    if (!hasEventStarted) return false
    if (!isEventFinished) return false
    if (!event?.nextEventDate) return true

    const isThisLastActivatedEvent = Boolean(isBefore(new Date(), event.nextEventDate))
    return isThisLastActivatedEvent
  })
  if (!status) {
    const whitelistStartDate = timeline[0].date
    const upcomingStatus = generateUpcomingStatus(whitelistStartDate)
    return upcomingStatus
  }
  return status
}
