import { IconLinkType } from "@/components/Button/ExternalLink"
import { timelineEventOptions } from "./constants"
import { WhitelistRequirementModel } from "shared/models"

export const getDefaultValues = () => {
  return {
    id: "",
    title: "",
    subtitle: "",
    logoUrl: "",
    chain: { name: "", iconUrl: "" },
    origin: "",
    sector: "",
    curator: {
      avatarUrl: "",
      fullName: "",
      position: "",
      socials: [
        {
          url: "",
          iconType: "X_TWITTER" as Exclude<IconLinkType, "NO_ICON">,
          label: "X (ex-Twitter)",
        },
      ],
    },
    projectLinks: [
      {
        url: "",
        iconType: "WEB" as Exclude<IconLinkType, "NO_ICON">,
        label: "Web Link",
      },
    ],
    totalTokensForSale: undefined,
    tge: {
      raiseTarget: undefined,
      projectCoin: {
        iconUrl: "",
        ticker: "",
      },
      fixedCoinPriceInBorg: undefined,
      whitelistParticipants: 1698,
      liquidityPool: {
        name: "",
        iconUrl: "",
        lbpType: "",
        lockingPeriod: "",
        unlockDate: undefined,
        url: "#",
      },
      tweetUrl: "",
    },
    dataRoom: {
      backgroundImgUrl: "",
      url: "",
    },
    timeline: timelineEventOptions.map((option) => ({
      id: option.id,
      date: undefined,
      label: option.label,
    })),
    whitelistRequirements: [
      {
        type: "HOLD_BORG_IN_WALLET",
        label: "Hold 20000 BORG in your wallet",
        description: "",
        isMandatory: true,
        heldAmount: 20000,
      },
      {
        type: "FOLLOW_ON_X",
        label: "Follow BorgPad on X",
        description: "",
        isMandatory: true,
      },
      {
        type: "DONT_RESIDE_IN_US",
        label: "Don’t reside in the US",
        description: "",
        isMandatory: true,
      },
    ] as WhitelistRequirementModel[],

    // this will not be submitted through body
    adminKey: "",
  }
}
