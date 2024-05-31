import { useWindowSize } from "@/hooks/useWindowSize"
import { formatDateForDisplay } from "@/utils/date-helpers"
import { differenceInMilliseconds } from "date-fns"
import { isBefore } from "date-fns/isBefore"
import { useLayoutEffect, useRef, useState } from "react"
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
const GAP_SIZE = 16
const BORDER_SIZE = 1
const HORIZONTAL_PADDING = 16

const Timeline = ({ timelineEvents }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState<number | null>(null)

  const { width } = useWindowSize()

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
      const ratio =
        (timelineDurationInMs - timelineLeftInMs) / timelineDurationInMs
      return ratio
    }

    const calculatedRatio = calculateTimelineRatio()
    const calculateHorizontalTimelineSectionWidth = () => {
      if (!containerWidth) return 0
      return (
        (containerWidth -
          2 * (HORIZONTAL_PADDING + BORDER_SIZE) -
          (dataLength - 1) * GAP_SIZE) /
          dataLength +
        GAP_SIZE
      )
    }
    const horizontalTimelineWidth = calculateHorizontalTimelineSectionWidth()

    return (
      <div
        key={event.label}
        className="flex w-full flex-1 items-center gap-4 lg:max-w-[132px] lg:flex-col"
      >
        <div className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-default lg:shrink">
          {displayTimeline && (
            <>
              {/* vertical view */}
              <div className="absolute left-[9px] top-3 z-[1] h-[54px] w-[6px] items-center bg-default lg:hidden"></div>
              <div
                style={{
                  height: calculatedRatio * MAX_TIMELINE_SECTION_HEIGHT,
                }}
                className="absolute left-[9px] top-3 z-[2] ml-[2px] flex w-[2px] flex-col gap-1 bg-brand-primary lg:hidden"
              ></div>
              {/* horizontal view */}
              <div
                style={{ width: horizontalTimelineWidth }}
                className="absolute left-3 z-[1] hidden h-[6px] w-full items-center bg-default lg:flex"
              ></div>
              <div
                style={{
                  width: calculatedRatio * horizontalTimelineWidth,
                }}
                className="absolute left-3 z-[2] hidden h-[2px] flex-col bg-brand-primary lg:flex"
              ></div>
            </>
          )}
          {event.didTimePass && (
            <div className="z-[3] h-2 w-2 rounded-full bg-brand-primary"></div>
          )}
        </div>
        <div className="flex flex-1 flex-col lg:items-center">
          <span
            className={twMerge(
              "truncate text-wrap text-xs font-normal",
              event.didTimePass && "font-semibold",
            )}
          >
            {event.label}
          </span>
          <span className="truncate text-xs leading-[18px] opacity-50">
            {event.displayedTime}
          </span>
        </div>
      </div>
    )
  }

  useLayoutEffect(() => {
    if (containerRef?.current?.offsetWidth) {
      setContainerWidth(containerRef.current.offsetWidth)
    }
  }, [width])

  return (
    <section ref={containerRef} className="w-full">
      <h2 className="w-full pb-3 text-left text-2xl">Timeline</h2>
      <div className="flex w-full flex-col justify-between gap-4 rounded-lg border border-bd-secondary bg-secondary/50 px-4 py-5 lg:flex-row">
        {Object.values(data).map(
          (event: ExtendedTimelineEventType, dataIndex) =>
            renderTimelineEvent(event, dataLength, dataIndex),
        )}
      </div>
    </section>
  )
}

export default Timeline
