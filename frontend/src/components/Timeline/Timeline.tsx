import { formatDateForDisplay } from "@/utils/date-helpers"
import { differenceInMilliseconds } from "date-fns"
import { isBefore } from "date-fns/isBefore"
import { twMerge } from "tailwind-merge"

export type Props = {
  timelineEvents: TimelineEventType[]
}

export type TimelineEventType = {
  label: string
  date: Date
}

type ExtendedTimelineEventType = {
  displayedTime: string
  didTimePass: boolean
  nextEventDate?: Date
} & TimelineEventType

const MAX_TIMELINE_SECTION_HEIGHT = 54

const Timeline = ({ timelineEvents }: Props) => {
  const calculateTimelineData = (): ExtendedTimelineEventType[] => {
    const currentMoment = new Date()
    const nextEventDates = timelineEvents.slice(1)
    return timelineEvents.map((event, index) => {
      return {
        label: event.label,
        date: event.date,
        nextEventDate: nextEventDates[index]?.date,
        displayedTime: formatDateForDisplay(event.date),
        didTimePass: isBefore(event.date, currentMoment),
      }
    })
  }
  const data = calculateTimelineData()
  const dataLength = data.length

  const renderTimelineEvent = (
    event: ExtendedTimelineEventType,
    dataLength: number,
    index: number,
  ) => {
    const displayTimeline = dataLength - 1 !== index
    const calculateTimelineRatio = () => {
      const isTimelineFinished = Boolean(
        event?.nextEventDate && isBefore(event.nextEventDate, new Date()),
      )
      if (isTimelineFinished) return 1
      if (!event.didTimePass) return 0
      if (!event?.nextEventDate) return 0
      const timelineDurationInMs = differenceInMilliseconds(
        event.nextEventDate,
        event.date,
      )
      const timelineLeftInMs = differenceInMilliseconds(
        event.nextEventDate,
        new Date(),
      )
      return (timelineDurationInMs - timelineLeftInMs) / timelineDurationInMs
    }

    const calculatedRatio = calculateTimelineRatio()

    return (
      <div key={event.label} className="flex items-center gap-4">
        <div className="relative flex h-6 w-6 items-center justify-center rounded-full bg-default">
          {displayTimeline && (
            <>
              <div className="absolute left-[9px] top-3 z-[1] h-[54px] w-[6px] items-center bg-default"></div>
              <div
                style={{
                  height: calculatedRatio * MAX_TIMELINE_SECTION_HEIGHT,
                }}
                className="absolute left-[9px] top-3 z-[2] ml-[2px] flex w-[2px] flex-col gap-1 bg-brand-primary"
              ></div>
            </>
          )}
          {event.didTimePass && (
            <div className="z-[3] h-2 w-2 rounded-full bg-brand-primary"></div>
          )}
        </div>
        <div className="flex flex-col">
          <span
            className={twMerge(
              "text-sm font-normal",
              event.didTimePass && "font-semibold",
            )}
          >
            {event.label}
          </span>
          <span className="text-xs leading-[18px] opacity-50">
            {event.displayedTime}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <h2 className="text-2xl w-full pb-3 text-left">Timeline</h2>
      <div className="flex w-full flex-col gap-4 rounded-lg border border-bd-secondary bg-secondary/50 px-4 py-5 ">
        {Object.values(data).map(
          (event: ExtendedTimelineEventType, dataIndex) =>
            renderTimelineEvent(event, dataLength, dataIndex),
        )}
      </div>
    </div>
  )
}

export default Timeline
