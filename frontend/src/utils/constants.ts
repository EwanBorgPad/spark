export type WhitelistingRequirementType =
  | "FOLLOW_ON_X"
  | "DONT_RESIDE_IN_US"
  | "HOLD_BORG_IN_WALLET"

export type WhitelistRequirement = {
  label: string
  description: string
  isFulfilled: boolean
  isMandatory: boolean
  heldAmount?: number
}

export const whitelistRequirements: Record<
  WhitelistingRequirementType,
  WhitelistRequirement
> = {
  HOLD_BORG_IN_WALLET: {
    label: "Hold 20,000 BORG in your wallet",
    description: "",
    isFulfilled: false,
    isMandatory: true,
    heldAmount: 20000,
  },
  FOLLOW_ON_X: {
    label: "Follow BorgPad on X",
    description: "",
    isFulfilled: false,
    isMandatory: true,
  },
  DONT_RESIDE_IN_US: {
    label: "Don’t reside in the US",
    description: "",
    isFulfilled: true,
    isMandatory: true,
  },
}
