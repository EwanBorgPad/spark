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
    badgeLabel: string
  }
}

export const generateAdditionalEventData = (
  tgeEvent: ExpandedTimelineEventType,
) => {
  switch (tgeEvent.id) {
    case "UPCOMING":
      return {
        badgeClassName: "text-fg-primary border-bd-primary bg-default",
        endMessage: `Whitelisting opens ${tgeEvent.nextEventDate && formatDateMonthDateHours(tgeEvent.nextEventDate)}`,
        badgeLabel: "Upcoming",
      }
    case "REGISTRATION_OPENS":
      return {
        badgeClassName:
          "text-fg-brand-primary border-bd-brand-secondary bg-tertiary",
        endMessage: `Whitelisting closes ${tgeEvent.nextEventDate && formatDateMonthDateHours(tgeEvent.nextEventDate)}`,
        badgeLabel: "Whitelisting",
      }
    case "SALE_OPENS":
      return {
        badgeClassName:
          "text-fg-alt-default border-bd-secondary bg-brand-primary",
        endMessage: `Sale Closes ${tgeEvent.nextEventDate && formatDateMonthDateHours(tgeEvent.nextEventDate)}`,
        badgeLabel: "Live Now",
      }
    case "SALE_CLOSES":
      return {
        badgeClassName: "text-fg-primary border-bd-primary bg-default",
        endMessage: `Reward Distribution starts ${tgeEvent.nextEventDate && formatDateMonthDateHours(tgeEvent.nextEventDate)}`,
        badgeLabel: "Sale Over",
      }
    case "REWARD_DISTRIBUTION":
      return {
        badgeClassName:
          "text-fg-brand-primary border-bd-brand-secondary bg-tertiary",
        endMessage: `Reward Distribution ends ${tgeEvent.nextEventDate && formatDateMonthDateHours(tgeEvent.nextEventDate)}`,
        badgeLabel: "Reward Distribution",
      }
    case "DISTRIBUTION_OVER":
      return {
        badgeClassName: "text-fg-primary border-bd-primary bg-default",
        endMessage: `Reward distribution ended ${tgeEvent.date && formatDateMonthDateHours(tgeEvent.date)}`,
        badgeLabel: "Closed",
      }
  }
}

export const sortProjectsPerStatus = (
  projects: ProjectModel[],
): ExpandedProject[] => {
  const expandedProjects = projects.map((project) => {
    const expandedTimeline = expandTimelineDataInfo(project.info.timeline)
    const currentEvent = getCurrentTgeEvent(expandedTimeline)

    const { endMessage, badgeClassName, badgeLabel } =
      generateAdditionalEventData(currentEvent)
    const additionalData = {
      currentEvent,
      endMessage,
      badgeClassName,
      badgeLabel,
    }

    return { additionalData, ...project }
  })
  const sortedProjects = expandedProjects.sort(
    (a, b) =>
      timelineEventIdRanks[a.additionalData.currentEvent.id] -
      timelineEventIdRanks[b.additionalData.currentEvent.id],
  )
  return sortedProjects
}
