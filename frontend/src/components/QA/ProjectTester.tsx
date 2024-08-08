import { useMemo, useRef, useState } from "react"
import { twMerge } from "tailwind-merge"

import { useWhitelistStatusContext } from "@/hooks/useWhitelistContext"
import { useCheckOutsideClick } from "@/hooks/useCheckOutsideClick"
import { useProjectDataContext } from "@/hooks/useProjectData"
import { addMinutes } from "date-fns/addMinutes"
import { addHours } from "date-fns/addHours"
import { addDays } from "date-fns/addDays"
import { Button } from "../Button/Button"

const TIMESPANS = ["days", "hours", "minutes"] as const
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
const defaultOffset = { days: 0, hours: 0, minutes: 0 }

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

const ProjectTester = () => {
  const { projectData, setProjectData } = useProjectDataContext()

  const [isOpened, setIsOpen] = useState(false)
  const [offset, setOffset] = useState(defaultOffset)
  const ref = useRef<HTMLDivElement>(null)
  const originalTimeline = useMemo(
    () => projectData.info.timeline,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
  const {
    setWhitelistStatusToNotEligible,
    isUserWhitelisted,
    setWhitelistStatusToEligible,
  } = useWhitelistStatusContext()

  useCheckOutsideClick(ref, () => setIsOpen(false))

  const updateEvents = (changeType: ChangeType, valueChange: -1 | 1) => {
    const updateEvent = (date: Date) => {
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

    const newTimeline = projectData.info.timeline.map((event) => {
      return { ...event, date: updateEvent(event.date) }
    })
    setProjectData({
      ...projectData,
      info: { ...projectData.info, timeline: newTimeline },
    })
  }

  const resetOffset = () => {
    setOffset(defaultOffset)
    setProjectData({
      ...projectData,
      info: { ...projectData.info, timeline: originalTimeline },
    })
  }

  const onWhitelistCheckboxClick = (isChecked: boolean) => {
    if (isChecked) {
      setWhitelistStatusToEligible()
    } else {
      setWhitelistStatusToNotEligible()
    }
  }

  return (
    <div ref={ref} className="fixed right-3 top-[50vh] z-[20]">
      {isOpened ? (
        <div className="flex w-[300px] flex-col gap-4 rounded-2xl border-[1px] border-brand-primary bg-default p-4">
          <span className="text-base">Input Values</span>
          <div className="flex items-center rounded-md bg-emphasis px-3 py-2">
            <input
              name="whitelist-checkbox"
              id="whitelist-checkbox"
              type="checkbox"
              checked={isUserWhitelisted}
              className="h-5 w-5 cursor-pointer rounded border-gray-300 bg-gray-100 text-brand-primary"
              onChange={(event) =>
                onWhitelistCheckboxClick(event.target.checked)
              }
            />
            <label
              htmlFor="whitelist-checkbox"
              className="cursor-pointer select-none pl-2 pr-4"
            >
              Whitelisted
            </label>
          </div>
          <div className="flex w-full flex-col gap-2 rounded-md bg-emphasis p-2">
            <span className="text-base">Offset All Events</span>

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

          <Button.Icon
            size="md"
            color="plain"
            icon="SvgX"
            className="absolute right-1 top-1 bg-transparent"
            onClick={() => setIsOpen(false)}
          />
        </div>
      ) : (
        <Button.Icon
          icon={"SvgChevronDown"}
          size="md"
          color="primary"
          className={twMerge(
            "rounded-full bg-brand-primary",
            !isOpened && "rotate-90",
          )}
          onClick={() => setIsOpen(true)}
        />
      )}
    </div>
  )
}

export default ProjectTester
