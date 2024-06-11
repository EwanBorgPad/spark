import { twMerge } from "tailwind-merge"

import { ExternalLink } from "@/components/Button/ExternalLink"
import { formatDateForDisplay } from "@/utils/date-helpers"
import { formatCurrencyAmount } from "@/utils/format"
import { Icon } from "@/components/Icon/Icon"
import { ProjectData } from "@/data/data"
import Accordion from "@/components/Accordion/Accordion"

type PastOrderProps = {
  order: ProjectData["tge"]["pastOrders"][0]
  numberOfPastOrders: number
  index: number
  borgPriceInUSD: number
}

const MAX_ACCORDION_CONTAINER_HEIGHT = 317

export const PastOrder = ({
  order,
  numberOfPastOrders,
  index,
  borgPriceInUSD,
}: PastOrderProps) => {
  ///////////////////////////////
  // @TODO - fetch past orders //
  ///////////////////////////////

  const getBorgValueInUSD = (amount: number) => {
    return formatCurrencyAmount(borgPriceInUSD * amount)
  }

  return (
    <div
      className={twMerge(
        "flex w-full flex-col border-b-[1px] border-b-bd-primary p-4",
        index + 1 === numberOfPastOrders && "border-none",
      )}
    >
      <div className="flex w-full items-center justify-between gap-1">
        <div className="flex items-center gap-1">
          <span className="text-base font-medium">{order.borgAmount}</span>
          <span>BORG</span>
          <Icon icon="SvgBorgCoin" className="text-xl" />
        </div>
        <div className="relative h-6 w-6">
          <ExternalLink.Icon
            externalLink={{ linkType: "outer-link", url: "#" }}
            className="absolute -left-1 -top-1.5 border-none text-xl text-fg-tertiary"
          />
        </div>
      </div>
      <div className="flex w-full items-center justify-between text-sm text-fg-tertiary">
        <span>{getBorgValueInUSD(order.borgAmount)}</span>
        <span>{formatDateForDisplay(order.date)}</span>
      </div>
    </div>
  )
}

type PastOrdersProps = {
  tgeData: ProjectData["tge"]
}

export const PastOrders = ({ tgeData }: PastOrdersProps) => {
  const numberOfPastOrders = tgeData.pastOrders.length
  if (numberOfPastOrders === 0) return null

  const getBorgPriceInUSD = () => {
    //////////////////////////////////////////////
    // @TODO - GET current BORG/USD price ////////
    // below is arbitrary value from 07.06.2024 //
    //////////////////////////////////////////////
    return 0.2179
  }
  const borgPriceInUSD = getBorgPriceInUSD()

  return (
    <Accordion
      label={"Past Orders"}
      sublabel={`(${numberOfPastOrders})`}
      maxChildrenHeight={MAX_ACCORDION_CONTAINER_HEIGHT}
    >
      {tgeData.pastOrders.map((order, index) => {
        return (
          <PastOrder
            // @TODO - use past order ID for key prop when available
            key={index}
            numberOfPastOrders={numberOfPastOrders}
            order={order}
            index={index}
            borgPriceInUSD={borgPriceInUSD}
          />
        )
      })}
    </Accordion>
  )
}
