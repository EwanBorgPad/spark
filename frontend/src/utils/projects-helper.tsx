import { ExpandedTimelineEventType } from "@/components/Timeline/Timeline"
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

export type EventTypeId = ExpandedTimelineEventType["id"]

export const generateAdditionalEventData = (tgeEvent: ExpandedTimelineEventType) => {
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
        badgeClassName: "text-fg-brand-primary border-bd-brand-secondary bg-tertiary",
        endMessage: i18n.t("launch_pools.whitelist_closes", { text }),
        badgeLabel: "Whitelisting",
      }
    }
    case "SALE_OPENS": {
      const text = getEventDateString(tgeEvent.nextEventDate)
      return {
        badgeClassName: "text-fg-alt-default border-bd-secondary bg-brand-primary",
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
        badgeClassName: "text-fg-brand-primary border-bd-brand-secondary bg-tertiary",
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

const sortByReferencedDate = (projects: ExpandedProject[], config: SortPhaseConfigType) => {
  if (!projects.length) return []
  const sortedProjects = [...projects].sort((a, b) => {
    const dateA = a.additionalData.currentEvent.nextEventDate
    const dateB = b.additionalData.currentEvent.nextEventDate

    // Handle `null` or `undefined` dates
    if (!dateA) return 1 // `a` goes to the end
    if (!dateB) return -1 // `b` goes to the end

    // Compare valid dates
    const timeA = new Date(dateA).getTime()
    const timeB = new Date(dateB).getTime()

    return timeA - timeB
  })
  if (config.order === "descending") {
    return [...sortedProjects].reverse()
  } else return sortedProjects
}

type SortPhaseConfigType = {
  referencedDate: "nextEventDate" | "date"
  order: "ascending" | "descending"
  customSort?: string[]
}

const sortConfig: Record<EventTypeId, SortPhaseConfigType> = {
  UPCOMING: {
    referencedDate: "nextEventDate",
    order: "ascending",
    customSort: ["ambient-network", "intercellar", "fitchin"],
  },
  REGISTRATION_OPENS: { referencedDate: "nextEventDate", order: "ascending" },
  SALE_OPENS: { referencedDate: "nextEventDate", order: "ascending" },
  SALE_CLOSES: { referencedDate: "nextEventDate", order: "ascending" },
  REWARD_DISTRIBUTION: { referencedDate: "nextEventDate", order: "descending" },
  DISTRIBUTION_OVER: { referencedDate: "nextEventDate", order: "ascending" },
}

const sortProjectsByPhases = (expandedProjects: ExpandedProject[]) => {
  const entriesArray = Object.entries(sortConfig) as [EventTypeId, SortPhaseConfigType][]
  return entriesArray.map((event) => {
    const eventId = event[0]
    const eventConfig = event[1]
    const projectsInPhase = expandedProjects.filter((project) => project.additionalData.currentEvent.id === eventId)
    if (eventConfig.customSort) {
      const customSorted = [...eventConfig.customSort]
        .map((orderId) => {
          return projectsInPhase.find((item) => item.id === orderId)
        })
        .filter((project) => !!project)

      return sortByReferencedDate(customSorted, eventConfig)
    } else {
      return sortByReferencedDate(projectsInPhase, eventConfig)
    }
  })
}

export const sortProjectsPerStatus = (projects: ProjectModel[]): ExpandedProject[][] => {
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

  const sortedProjects = sortProjectsByPhases(expandedProjects)
  return sortedProjects
}
