import DataRoom from "@/components/LaunchPool/DataRoom"
import Timeline, { ExpandedTimelineEventType } from "@/components/Timeline/Timeline"
import React from "react"

type UpcomingProps = {
  timeline: ExpandedTimelineEventType[]
}

const Upcoming = ({ timeline }: UpcomingProps) => {
  return (
    <div className="flex w-full justify-center px-4">
      <div className="flex w-full max-w-[760px] flex-col items-center gap-10">
        <DataRoom />
        <Timeline timelineEvents={timeline} />
      </div>
    </div>
  )
}

export default Upcoming
