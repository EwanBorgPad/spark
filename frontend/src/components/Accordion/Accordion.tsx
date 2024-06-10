import { useEffect, useRef, useState } from "react"
import { twMerge } from "tailwind-merge"

import { Button } from "../Button/Button"
import { Icon } from "../Icon/Icon"

type AccordionProps = {
  label: string
  sublabel: string
  children: React.ReactNode
}

const Accordion = ({ label, sublabel, children }: AccordionProps) => {
  const [isOpen, setOpen] = useState(false)
  const accordionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!accordionRef.current) return
    setOpen(false)
    accordionRef.current.style.maxHeight =
      accordionRef.current?.scrollHeight + "px"
  }, [])

  return (
    <div className="relative z-20 flex w-full flex-col">
      <Button
        color="secondary"
        size="xl"
        onClick={() => setOpen(!isOpen)}
        className="z-[10] scale-100 gap-1 rounded-lg p-3 hover:opacity-100 active:!scale-[100%]"
        style={{}}
      >
        <span className="text-sm font-normal">{label}</span>
        {sublabel && <span className="text-sm font-normal">{sublabel}</span>}
        <Icon
          icon={"SvgChevronDown"}
          className={twMerge(
            "text-fg-primary opacity-50 transition-transform duration-500",
            isOpen && "rotate-180",
          )}
        />
      </Button>
      <div
        ref={accordionRef}
        className={twMerge(
          "transition-height top-11 z-[-10] -mt-2.5 max-h-[420px] w-full overflow-y-scroll rounded-b-lg border-[1px] border-t-0 border-bd-primary bg-secondary delay-0 duration-200 ease-in-out",
          !isOpen && "!max-h-0",
        )}
      >
        <div className="h-2 w-full"></div>
        {children}slack
      </div>
    </div>
  )
}

export default Accordion
