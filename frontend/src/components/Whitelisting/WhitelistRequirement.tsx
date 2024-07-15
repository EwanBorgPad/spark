import {
  WhitelistingRequirementType,
  whitelistRequirements,
} from "@/utils/constants"
import React from "react"
import { twMerge } from "tailwind-merge"
import { Icon } from "../Icon/Icon"
import { CtaButton } from "./CtaButton"

type WhitelistRequirementProps = {
  type: WhitelistingRequirementType
  isLastItem: boolean
  requirementStatus: {
    isFulfilled: boolean
    isMandatory: boolean
  }
}
const WhitelistRequirement = ({
  type,
  isLastItem,
  requirementStatus,
}: WhitelistRequirementProps) => {
  const requirementContent = whitelistRequirements[type]

  const renderCtaButton = () => {
    if (type === "DONT_RESIDE_IN_US") return <CtaButton.NotResidingInUS />
    if (type === "FOLLOW_ON_X") return <CtaButton.FollowOnX />
    if (type === "HOLD_BORG_IN_WALLET") return <CtaButton.HoldBorgInAmount />
  }

  return (
    <div
      className={twMerge(
        "flex w-full flex-col justify-start gap-1 border-b-[1px] border-b-bd-primary p-4 text-sm",
        isLastItem && "border-none",
      )}
    >
      <div className="flex w-full items-center justify-between">
        <span
          className={twMerge(
            "font-medium",
            requirementStatus.isFulfilled && "opacity-50",
          )}
        >
          {requirementContent.label}
        </span>
        <Icon
          icon={
            requirementStatus.isFulfilled ? "SvgRoundCheckmark" : "SvgCircledX"
          }
          className={twMerge(
            "text-xl",
            requirementStatus.isFulfilled
              ? "text-fg-success-primary"
              : "text-fg-error-primary",
          )}
        />
      </div>
      {!requirementStatus.isFulfilled && renderCtaButton()}
      {requirementContent.description && (
        <span className="font-normal opacity-50">
          {requirementContent.description}
        </span>
      )}
    </div>
  )
}

export default WhitelistRequirement
