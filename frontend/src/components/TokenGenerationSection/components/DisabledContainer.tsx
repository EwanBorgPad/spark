import { Button } from "@/components/Button/Button"
import React from "react"
import DisabledBlurContainer from "./DisabledBlurContainer"
import { formatDateForTimerWithTimezone } from "@/utils/date-helpers"
import SimpleLoader from "@/components/Loaders/SimpleLoader"

type TierBenefitsType =
  | {
      startDate: Date
      minInvestment: string
      maxInvestment: string
    }
  | undefined

type Props = {
  isUserEligible: boolean | undefined
  isEligibilityLoading: boolean
  isDepositStatusLoading: boolean
  isEligibleTierActive: boolean
  userInvestedMaxAmount: boolean
  scrollToWhitelistRequirements: () => void
  scrollToTiers: () => void
  tierBenefits: TierBenefitsType
}

const DisabledContainer = ({
  isUserEligible,
  isEligibilityLoading,
  isEligibleTierActive,
  userInvestedMaxAmount,
  isDepositStatusLoading,
  scrollToWhitelistRequirements,
  scrollToTiers,
  tierBenefits,
}: Props) => {
  if (isDepositStatusLoading || isEligibilityLoading) {
    return (
      <DisabledBlurContainer>
        <div className="flex w-full max-w-[340px] flex-col items-center gap-2 rounded-lg bg-default p-4 shadow-white/5">
          <SimpleLoader className="text-2xl" />
          <div className="flex animate-pulse flex-col items-start">
            {isDepositStatusLoading && (
              <span className="text-center text-fg-tertiary">{`Loading Deposit Status...`}</span>
            )}
            {isEligibilityLoading && (
              <span className="text-center text-fg-tertiary">{`Loading Eligibility Status...`}</span>
            )}
          </div>
        </div>
      </DisabledBlurContainer>
    )
  }

  if (!isUserEligible && !isEligibilityLoading)
    return (
      <DisabledBlurContainer>
        <div className="flex w-full max-w-[340px] flex-col items-center rounded-lg bg-default p-4 shadow-sm shadow-white/5">
          <span className="text-center text-fg-error-primary">Your Wallet was not whitelisted for this deal</span>
          <Button
            onClick={scrollToWhitelistRequirements}
            size="md"
            color="plain"
            btnText="See Whitelist Requirements"
            className="text-sm font-normal"
          ></Button>
        </div>
      </DisabledBlurContainer>
    )

  if (!isEligibleTierActive && !isEligibilityLoading)
    return (
      <DisabledBlurContainer>
        <div className="flex flex-col items-center py-2 text-sm font-normal text-fg-primary">
          <p>
            <span onClick={scrollToTiers} className="cursor-pointer underline">
              Your Tier
            </span>
            <span>{" opens on: "}</span>
          </p>
          <span>{tierBenefits && formatDateForTimerWithTimezone(tierBenefits.startDate)}</span>
        </div>
      </DisabledBlurContainer>
    )

  if (userInvestedMaxAmount && !isEligibilityLoading)
    return (
      <DisabledBlurContainer>
        <div className="py-2 text-sm font-normal text-fg-primary">
          <span>You have invested max amount</span>
        </div>
      </DisabledBlurContainer>
    )

  return <></>
}

export default DisabledContainer
