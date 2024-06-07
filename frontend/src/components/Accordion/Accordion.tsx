import { useEffect, useRef, useState } from "react"
import { Icon } from "../Icon/Icon"
import { twMerge } from "tailwind-merge"
import { ProjectData } from "@/data/data"
import { formatDateForDisplay } from "@/utils/date-helpers"
import { ExternalLink } from "../Button/ExternalLink"

type AccordionProps = {
  label: string
  tgeData: ProjectData["tge"]
  // items: AccordionItem[]
}

const Accordion = ({ tgeData, label }: AccordionProps) => {
  const [isOpen, setOpen] = useState(false)
  const accordionRef = useRef<HTMLDivElement>(null)

  // @TODO - fetch past orders

  useEffect(() => {
    if (!accordionRef.current) return
    setOpen(false)
    accordionRef.current.style.maxHeight =
      accordionRef.current?.scrollHeight + "px"
  }, [])

  const numberOfPastOrders = tgeData.pastOrders.length

  return (
    <div className="relative z-20 flex w-full flex-col">
      <div
        onClick={() => setOpen(!isOpen)}
        className="hover:bg-red-200/20 z-[10] flex w-full cursor-pointer items-center justify-center gap-1 rounded-lg border-[1px] border-bd-primary bg-default p-3 dark:text-white"
      >
        <span className="text-sm font-normal">{label}</span>
        <span className="text-sm font-normal">({numberOfPastOrders})</span>
        <Icon
          icon={"SvgChevronDown"}
          className={twMerge(
            "text-fg-primary opacity-50 transition-transform duration-500",
            isOpen && "rotate-180",
          )}
        />
      </div>
      <div
        ref={accordionRef}
        className={twMerge(
          "transition-height top-11 z-[-10] -mt-1.5 w-full overflow-y-scroll rounded-b-lg border-[1px] border-t-0 border-bd-primary bg-secondary delay-0 duration-200 ease-in-out",
          !isOpen && "!max-h-0",
        )}
      >
        <div className="h-1.5 w-full"></div>
        {tgeData.pastOrders.map((order, index) => {
          return (
            <div
              // @TODO - use past order ID for key prop when available
              key={order.date.getTime()}
              className={twMerge(
                "flex w-full flex-col gap-0.5 border-b-[1px] border-b-bd-primary p-4",
                index + 1 === numberOfPastOrders && "border-none",
              )}
            >
              <div className="flex w-full items-center justify-between gap-1">
                <div className="flex items-center gap-1">
                  <span className="text-base font-medium">
                    {order.borgAmount}
                  </span>
                  <span>BORG</span>
                  <Icon icon="SvgBorgCoin" className="text-xl" />
                </div>
                <div className="relative h-6 w-6">
                  <ExternalLink.Icon
                    externalLink={{ linkType: "outer-link", url: "#" }}
                    className="absolute -left-1 -top-1 border-none text-xl text-fg-tertiary"
                  />
                </div>
              </div>
              <div className="flex w-full items-center justify-between text-sm text-fg-tertiary">
                <span>$50</span>
                <span>{formatDateForDisplay(order.date)}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Accordion
