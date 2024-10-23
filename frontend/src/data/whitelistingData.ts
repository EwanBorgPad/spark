import { WhitelistingRequirementType } from "@/utils/constants"

/**
 * @deprecated
 */
export type WhitelistStatusType = {
  whitelisted: boolean
  requirements: {
    isFulfilled: boolean
    isMandatory: boolean
    type: WhitelistingRequirementType
  }[]
}

/**
 * @deprecated
 */
export const whitelistDummyData: WhitelistStatusType = {
  whitelisted: true,
  requirements: [
    {
      isFulfilled: false,
      isMandatory: true,
      type: "DONT_RESIDE_IN_US",
    },
    {
      isFulfilled: false,
      isMandatory: true,
      type: "FOLLOW_ON_X",
    },
    {
      isFulfilled: true,
      isMandatory: true,
      type: "HOLD_BORG_IN_WALLET",
    },
  ],
}
