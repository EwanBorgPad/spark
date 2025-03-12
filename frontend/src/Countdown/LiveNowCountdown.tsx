import CountDownTimer from "@/components/CountDownTimer"
import { formatDateForTimer } from "@/utils/date-helpers"
import { isAfter } from "date-fns/isAfter"
import React from "react"
import { ProjectModel } from "shared/models"
import { twMerge } from "tailwind-merge"

const LiveNowCountdown = ({ project }: { project: ProjectModel | undefined }) => {
  const tiers = project?.info.tiers ?? []

  const getNextTier = () => {
    if (!project?.info.timeline)
      return {
        countdownEvent: null,
        labelAboveTimer: "Loading countdown...",
      }
    const nextTier = tiers.find((tier) => {
      if (!tier.benefits.startDate) return false
      return isAfter( tier.benefits.startDate,new Date())
    })
    if (nextTier)
      return {
        countdownEvent: nextTier.benefits.startDate,
        labelAboveTimer: `Tier ${nextTier.label} opens in ${nextTier.benefits.startDate && formatDateForTimer(nextTier.benefits.startDate)}`,
      }
    const saleClosesPhase = project.info.timeline.find((phase) => phase.id === "SALE_CLOSES")
    return {
      countdownEvent: saleClosesPhase?.date ?? null,
      labelAboveTimer: saleClosesPhase?.date ? `Sale closes in ${formatDateForTimer(saleClosesPhase.date)}` : "",
    }
  }
  const nextTier = getNextTier()

  if (!nextTier.countdownEvent) return <></>

  console.log(nextTier.countdownEvent)

  return (
    <CountDownTimer
      endOfEvent={nextTier.countdownEvent}
      labelAboveTimer={nextTier.labelAboveTimer}
      className={twMerge("h-fit pb-3")}
    />
  )
}

export default LiveNowCountdown
