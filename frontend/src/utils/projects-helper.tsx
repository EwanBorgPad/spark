import {
  ExpandedTimelineEventType,
  timelineEventIdRanks,
} from "@/components/Timeline/Timeline"
import { formatDateMonthDateHours } from "./date-helpers"
import { expandTimelineDataInfo } from "./timeline"
import { getCurrentTgeEvent } from "./getCurrentTgeEvent"
import { ProjectModel } from "shared/models"
import i18n from "@/i18n/i18n"

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
  const fallbackText = i18n.t("launch_pools.at_tbd")
  const getEventDateString = (date: Date | null) => {
    return date ? formatDateMonthDateHours(date) : fallbackText
  }

  switch (tgeEvent.id) {
    case "UPCOMING": {
      const text = getEventDateString(tgeEvent.nextEventDate)
      return {
        badgeClassName: "text-fg-primary border-bd-primary bg-default",
        endMessage: i18n.t("launch_pools.whitelist_opens", { text }),
        badgeLabel: "Upcoming",
      }
    }
    case "REGISTRATION_OPENS": {
      const text = getEventDateString(tgeEvent.nextEventDate)
      return {
        badgeClassName:
          "text-fg-brand-primary border-bd-brand-secondary bg-tertiary",
        endMessage: i18n.t("launch_pools.whitelist_closes", { text }),
        badgeLabel: "Whitelisting",
      }
    }
    case "SALE_OPENS": {
      const text = getEventDateString(tgeEvent.nextEventDate)
      return {
        badgeClassName:
          "text-fg-alt-default border-bd-secondary bg-brand-primary",
        endMessage: i18n.t("launch_pools.sale_closes", { text }),
        badgeLabel: "Live Now",
      }
    }
    case "SALE_CLOSES": {
      const text = getEventDateString(tgeEvent.nextEventDate)
      return {
        badgeClassName: "text-fg-primary border-bd-primary bg-default",
        endMessage: i18n.t("launch_pools.reward_distribution_start", { text }),
        badgeLabel: "Sale Over",
      }
    }
    case "REWARD_DISTRIBUTION": {
      const text = getEventDateString(tgeEvent.nextEventDate)
      return {
        badgeClassName:
          "text-fg-brand-primary border-bd-brand-secondary bg-tertiary",
        endMessage: i18n.t("launch_pools.reward_distribution_ends", { text }),
        badgeLabel: "Reward Distribution",
      }
    }
    case "DISTRIBUTION_OVER": {
      const text = getEventDateString(tgeEvent.date)
      return {
        badgeClassName: "text-fg-primary border-bd-primary bg-default",
        endMessage: i18n.t("launch_pools.reward_distribution_ended", { text }),
        badgeLabel: "Closed",
      }
    }
  }
}

export const sortProjectsPerStatus = (
  projects: ProjectModel[],
): ExpandedProject[] => {
  const expandedProjects = projects.map((project) => {
    const expandedTimeline = expandTimelineDataInfo(project.info.timeline)
    const currentEvent = getCurrentTgeEvent(expandedTimeline)

    const { endMessage, badgeClassName, badgeLabel } = generateAdditionalEventData(currentEvent)
    const additionalData = {
      currentEvent,
      endMessage,
      badgeClassName,
      badgeLabel,
    }

    return { additionalData, ...project }
  })

  // @TODO - make better sorting function
  const upcomingProjects = expandedProjects.filter((project) => project.additionalData.currentEvent.id === "UPCOMING")
  const whitelistedProjects = expandedProjects.filter(
    (project) => project.additionalData.currentEvent.id === "REGISTRATION_OPENS",
  )
  const targetIndex = whitelistedProjects.findIndex((project) => project.id === "solana-id")

  if (targetIndex !== -1) {
    // Remove the element from its current position
    const [targetEvent] = whitelistedProjects.splice(targetIndex, 1)

    // Add the element to the beginning of the array
    whitelistedProjects.unshift(targetEvent)
  }
  const saleOpenedProjects = expandedProjects.filter(
    (project) => project.additionalData.currentEvent.id === "SALE_OPENS",
  )
  const saleClosedProjects = expandedProjects.filter(
    (project) => project.additionalData.currentEvent.id === "SALE_CLOSES",
  )
  const rewardDistributionProjects = expandedProjects.filter(
    (project) => project.additionalData.currentEvent.id === "REWARD_DISTRIBUTION",
  )
  const distributionOverProjects = expandedProjects.filter(
    (project) => project.additionalData.currentEvent.id === "DISTRIBUTION_OVER",
  )
  const sortedProjects = [
    ...whitelistedProjects,
    ...saleOpenedProjects,
    ...saleClosedProjects,
    ...rewardDistributionProjects,
    ...upcomingProjects,
    ...distributionOverProjects,
  ]
  return sortedProjects
}
