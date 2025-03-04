import { useMemo, useRef, useState } from "react"
import { twMerge } from "tailwind-merge"


import { useCheckOutsideClick } from "@/hooks/useCheckOutsideClick"
import { useProjectDataContext } from "@/hooks/useProjectData"
import { addMinutes } from "date-fns/addMinutes"
import { addHours } from "date-fns/addHours"
import { addDays } from "date-fns/addDays"
import { addWeeks } from "date-fns/addWeeks"
import { Button } from "../Button/Button"

const TIMESPANS = ["weeks", "days", "hours", "minutes"] as const
type ChangeType = (typeof TIMESPANS)[number]
type UpdateEventsProps = {
  changeType: ChangeType
  valueChange: -1 | 1
}
type OffsetEventInputType = {
  changeType: ChangeType
  updateEvents: (
    changeType: ChangeType,
    valueChange: UpdateEventsProps["valueChange"],
  ) => void
  currentOffset: Record<ChangeType, number>
}
const defaultOffset = { weeks: 0, days: 0, hours: 0, minutes: 0 }

const OffsetEventInput = ({
  currentOffset,
  changeType,
  updateEvents,
}: OffsetEventInputType) => {
  return (
    <div className="flex w-full items-center justify-between">
      <span className="text-sm capitalize">{changeType}</span>
      <div className="flex items-center gap-2">
        <Button
          size="xs"
          color="secondary"
          btnText="-"
          onClick={() => updateEvents(changeType, -1)}
        />
        <span className="w-5 text-center">{currentOffset[changeType]}</span>
        <Button
          size="xs"
          color="secondary"
          btnText="+"
          onClick={() => updateEvents(changeType, 1)}
        />
      </div>
    </div>
  )
}

const OffsetAllEvents = () => {
  const { projectData, setProjectData } = useProjectDataContext()
  const [offset, setOffset] = useState(defaultOffset)

  const originalTimeline = useMemo(
    () => projectData?.info.timeline,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const updateEvents = (changeType: ChangeType, valueChange: -1 | 1) => {
    const updateEvent = (date: Date) => {
      if (changeType === "weeks") {
        setOffset({ ...offset, weeks: offset.weeks + valueChange })
        return addWeeks(date, valueChange)
      }
      if (changeType === "days") {
        setOffset({ ...offset, days: offset.days + valueChange })
        return addDays(date, valueChange)
      }
      if (changeType === "hours") {
        setOffset({ ...offset, hours: offset.hours + valueChange })
        return addHours(date, valueChange)
      }
      if (changeType === "minutes") {
        setOffset({ ...offset, minutes: offset.minutes + valueChange })
        return addMinutes(date, valueChange)
      }
      return new Date()
    }

    const newTimeline = projectData?.info.timeline.map((event) => {
      return { ...event, date: event?.date ? updateEvent(event?.date) : null }
    })
    if (!newTimeline || !projectData) return
    setProjectData({
      ...projectData,
      info: { ...projectData?.info, timeline: newTimeline },
    })
  }

  const resetOffset = () => {
    setOffset(defaultOffset)
    if (!originalTimeline || !projectData) return
    setProjectData({
      ...projectData,
      info: { ...projectData.info, timeline: originalTimeline },
    })
  }


  return (
    <div className="w-full flex justify-end">
      <div className="flex w-full flex-col gap-4 rounded-2xl border-[1px] border-brand-primary/10 bg-default p-4">
        <span className="text-base">Offset All Events</span>
        
        <div className="flex w-full flex-col gap-2 rounded-md">

          {TIMESPANS.map((timespan) => (
            <OffsetEventInput
              key={timespan}
              changeType={timespan}
              updateEvents={updateEvents}
              currentOffset={offset}
            />
          ))}
        </div>
        <Button
          size="xs"
          color="primary"
          btnText="Reset"
          onClick={resetOffset}
        />
      </div>
    </div>
  )
}

export default OffsetAllEvents
