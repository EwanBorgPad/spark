import { useRef, useState } from "react"
import { twMerge } from "tailwind-merge"

import { Button } from "../Button/Button"
import DateTimeField from "@/components/InputField/DateTimeField.tsx"

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
    <div ref={ref} className="fixed right-3 top-[50vh] z-[20]">
      {isOpened ? (
        <div className="flex w-[420px] flex-col gap-4 rounded-2xl border-[1px] border-brand-primary bg-default p-4">
          <DateTimeField value={fakeDate} onChange={setFakeDate} />

          <div className='flex flex-row gap-4 w-full'>
            <Button
              disabled={!Boolean(fakeDate)}
              className='w-full'
              size="md"
              color="primary"
              btnText="Apply"
              onClick={applyFakeDate}
            />
            <Button
              className='w-full'
              size="md"
              color="danger"
              btnText="Reset"
              onClick={resetFakeDate}
            />
          </div>

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
          color={isDateFaked ? 'danger' : 'primary'}
          className={twMerge(
            "rounded-full",
            !isOpened && "rotate-90",
          )}
          onClick={() => setIsOpen(true)}
        />
      )}
    </div>
  )
}

export default ProjectTester2
