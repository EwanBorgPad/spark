import { twMerge } from "tailwind-merge"

import { ExternalLink } from "@/components/Button/ExternalLink"
import { formatDateForDisplay } from "@/utils/date-helpers"
import Accordion from "@/components/Accordion/Accordion"
import { formatCurrencyAmount } from "@/utils/format"
import { Icon } from "@/components/Icon/Icon"

// to be replaced with API calls
import { ContributionType, contributionData } from "@/data/contributionData"
import { dummyBorgPriceInUSD } from "@/data/borgPriceInUsd"

type PastOrdersProps = {
  label?: string
  className?: string
}
type PastOrderProps = {
  order: ContributionType["suppliedBorg"]["pastOrders"][0]
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
            externalLink={{ iconType: "OUTER_LINK", url: "#" }}
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

export const PastOrders = ({ label, className }: PastOrdersProps) => {
  ///////////////////////////////////////////////////////
  // @TODO - replace dummy call below with past orders //
  ///////////////////////////////////////////////////////
  const getContributions = () => {
    return contributionData
  }
  const pastOrders = getContributions().suppliedBorg.pastOrders
  const numberOfPastOrders = pastOrders.length
  if (numberOfPastOrders === 0) return null

  const getBorgPriceInUSD = () => {
    //////////////////////////////////////////////
    // @TODO - GET current BORG/USD price ////////
    // below is arbitrary value from 07.06.2024 //
    //////////////////////////////////////////////
    return dummyBorgPriceInUSD
  }
  const borgPriceInUSD = getBorgPriceInUSD()

  return (
    <Accordion
      label={label || "Past Orders"}
      subLabel={`(${numberOfPastOrders})`}
      maxChildrenHeight={MAX_ACCORDION_CONTAINER_HEIGHT}
      className={className}
    >
      {pastOrders.map((order, index) => {
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
