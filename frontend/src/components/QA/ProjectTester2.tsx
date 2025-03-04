import { useRef, useState } from "react"
import { twMerge } from "tailwind-merge"

import { Button } from "../Button/Button"
import DateTimeField from "@/components/InputField/DateTimeField.tsx"
import OffsetAllEvents from "./OffsetAllEvents"

const FAKE_DATE_KEY = 'fakeDate'

/**
 * Rename accordingly - DateFaker.tsx or something
 * @constructor
 */
const ProjectTester2 = () => {
  const [isOpened, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const fakeDateString = sessionStorage.getItem(FAKE_DATE_KEY)
  const initialDate = fakeDateString
    ? new Date(fakeDateString)
    : null

  const [fakeDate, setFakeDate] = useState<null | Date>(initialDate)
  const isDateFaked = fakeDate !== null
  const applyFakeDate = () => {
    if (!fakeDate) return
    sessionStorage.setItem(FAKE_DATE_KEY, fakeDate.toISOString())
    window.location.reload()
  }

  const resetFakeDate = () => {
    setFakeDate(null)
    sessionStorage.removeItem(FAKE_DATE_KEY)
    window.location.reload()
  }

  return (
    <div ref={ref} className="fixed right-3 top-[10vh] z-[20]">
      {isOpened ? (
        <div className="flex w-[440px] flex-col gap-4 rounded-2xl border-[1px] border-brand-primary/20 bg-default/50 p-4 pt-14">
          <div className="flex flex-col gap-4 rounded-xl border-[1px]  border-brand-primary/10 p-4">
            <span className="text-base">Fixate Date in time</span>

            <DateTimeField value={fakeDate} onChange={setFakeDate} />

            <div className="flex w-full flex-row gap-4">
              <Button
                disabled={!fakeDate}
                className="w-full"
                size="md"
                color="primary"
                btnText="Apply"
                onClick={applyFakeDate}
              />
              <Button className="w-full" size="md" color="danger" btnText="Reset" onClick={resetFakeDate} />
            </div>
          </div>
          <OffsetAllEvents />

          {/* close button */}
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
          color={isDateFaked ? "danger" : "primary"}
          className={twMerge("rounded-full", !isOpened && "rotate-90")}
          onClick={() => setIsOpen(true)}
        />
      )}
    </div>
  )
}

export default ProjectTester2
