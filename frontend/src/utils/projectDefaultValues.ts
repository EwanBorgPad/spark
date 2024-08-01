import { IconLinkType } from "@/components/Button/ExternalLink"
import { timelineEventOptions } from "./constants"

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
        label: "",
      },
    ],
    tokensAvailability: {
      available: undefined,
      total: undefined,
    },
    tge: {
      raiseTarget: undefined,
      projectCoin: {
        iconUrl: "",
        ticker: "",
      },
      fixedCoinPriceInBorg: 1,
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
      url: "#",
    },
    timeline: timelineEventOptions.map((option) => ({
      id: option.id,
      date: undefined,
      label: option.label,
    })),
  }
}
