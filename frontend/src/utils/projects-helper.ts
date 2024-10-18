import {
  ExpandedTimelineEventType,
  timelineEventIdRanks,
} from "@/components/Timeline/Timeline"
import { formatDateMonthDateHours } from "./date-helpers"
import { expandTimelineDataInfo } from "./timeline"
import { getCurrentTgeEvent } from "./getCurrentTgeEvent"
import { ProjectModel } from "shared/models"

export type ExpandedProject = ProjectModel & {
  additionalData: {
    currentEvent: ExpandedTimelineEventType
    endMessage: string
    badgeClassName: string
  }
}

export const getLaunchPoolData = (tgeEvent: ExpandedTimelineEventType) => {
  switch (tgeEvent.id) {
    case "PRE_WHITELIST":
      return {
        badgeClassName: "text-fg-primary border-bd-primary bg-default",
        endMessage: `Whitelisting opens ${formatDateMonthDateHours(tgeEvent.nextEventDate)}`,
      }
    case "REGISTRATION_OPENS":
      return {
        badgeClassName: "text-fg-primary border-bd-secondary bg-tertiary",
        endMessage: `Whitelisting closes ${formatDateMonthDateHours(tgeEvent.nextEventDate)}`,
      }
    case "SALE_OPENS":
      return {
        badgeClassName: "text-fg-alt-default border-bd-secondary bg-primary",
        endMessage: `Sale Closes ${formatDateMonthDateHours(tgeEvent.nextEventDate)}`,
      }
    case "SALE_CLOSES":
      return {
        badgeClassName: "text-fg-primary border-primary bg-primary",
        endMessage: `Reward Distribution starts ${formatDateMonthDateHours(tgeEvent.nextEventDate)}`,
      }
    case "REWARD_DISTRIBUTION":
      return {
        badgeClassName: "text-primary border-bd-secondary bg-tertiary",
        endMessage: `Reward Distribution ends ${formatDateMonthDateHours(tgeEvent.nextEventDate)}`,
      }
    case "DISTRIBUTION_OVER":
      return {
        badgeClassName: "text-fg-primary border-bd-primary bg-default",
        endMessage: `Reward distribution ended ${tgeEvent.date}`,
      }
  }
}

export const sortProjectsPerStatus = (
  projects: ProjectModel[],
): ExpandedProject[] => {
  const expandedProjects = projects.map((project) => {
    const expandedTimeline = expandTimelineDataInfo(project.info.timeline)
    const currentEvent = getCurrentTgeEvent(expandedTimeline)
    const { endMessage, badgeClassName } = getLaunchPoolData(currentEvent)

    const additionalData = { currentEvent, endMessage, badgeClassName }
    return { additionalData, ...project }
  })
  const sortedProjects = expandedProjects.sort(
    (a, b) =>
      timelineEventIdRanks[a.additionalData.currentEvent.id] -
      timelineEventIdRanks[b.additionalData.currentEvent.id],
  )
  return sortedProjects
}
