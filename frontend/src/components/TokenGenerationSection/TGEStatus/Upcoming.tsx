import Timeline, { ExpandedTimelineEventType } from "@/components/Timeline/Timeline"

type UpcomingProps = {
  timeline: ExpandedTimelineEventType[]
}

const Upcoming = ({ timeline }: UpcomingProps) => {
  return (
    <div className="flex w-full justify-center px-4">
      <div className="flex w-full max-w-[792px] flex-col items-center gap-10">
        <Timeline timelineEvents={timeline} />
      </div>
    </div>
  )
}

export default Upcoming
