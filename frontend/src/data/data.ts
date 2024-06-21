import i18n from "@/i18n/i18n"

import { ExternalLinkType } from "@/components/Button/ExternalLink"
import { TimelineEventType } from "@/components/Timeline/Timeline"
import { addDays } from "date-fns/addDays"

import secondaryImgUrl from "../assets/secondaryImgUrl.png"
import raydiumImg from "@/assets/raydium.png"
import lrcCoinImg from "@/assets/lrcCoin.png"
import chainImg from "../assets/zoraImg.png"
import curator from "../assets/curator.png"

const currentMoment = new Date()

export type ProjectData = {
  title: string
  subtitle: string
  projectLinks: ExternalLinkType[]
  chain: {
    name: string
    picUrl: string
  }
  lbpType: string
  origin: string
  createdAt: Date
  curator: {
    avatarUrl: string
    fullName: string
    position: string
    socials: ExternalLinkType[]
  }
  tokens: {
    available: number
    total: number
  }
  tge: {
    raiseTarget: number
    projectCoin: {
      iconUrl: string
      ticker: string
    }
    registrations: number
    vesting: {
      tgePercentage: number
      cliffPercentage: number
    }
    tokenGenerationEventDate: Date
    liquidityPoolDetails: LiquidityPoolDetails
    pastOrders: {
      borgAmount: number
      date: Date
      externalLink: string
    }[]
  }
  secondaryImgUrl: string
  timeline: TimelineEventType[]
  saleResults: {
    totalAmountRaised: number
    sellOutPercentage: number
    participants: number
    averageInvestedAmount: number
  }
}

export const dummyData: ProjectData = {
  title: "Puffer Finance",
  subtitle: "Anti-Slashing Liquid Staking",
  projectLinks: [
    {
      url: "#",
      linkType: "WEB",
      label: undefined,
    },
    {
      url: "#",
      linkType: "MEDIUM",
      label: undefined,
    },
    {
      url: "#",
      linkType: "LINKED_IN",
      label: undefined,
    },
    {
      url: "#",
      linkType: "X_TWITTER",
      label: undefined,
    },
  ],
  chain: { name: "Zora", picUrl: chainImg },
  lbpType: "Buy Only",
  origin: "🇮🇹 Italy",
  createdAt: new Date(),
  curator: {
    avatarUrl: curator,
    fullName: "John Doe",
    position: i18n.t("founding.contributor"),
    socials: [
      {
        url: "#",
        linkType: "LINKED_IN",
        label: "Linkedin",
      },
      {
        url: "#",
        linkType: "X_TWITTER",
        label: "X (ex-Twitter)",
      },
      {
        url: "#",
        linkType: "MEDIUM",
        label: "Medium",
      },
    ],
  },
  tokens: {
    available: 1565,
    total: 2000,
  },
  tge: {
    raiseTarget: 2000000,
    projectCoin: {
      iconUrl: lrcCoinImg,
      ticker: "LRC",
    },
    registrations: 1698,
    vesting: {
      tgePercentage: 20,
      cliffPercentage: 20,
    },
    tokenGenerationEventDate: currentMoment,
    liquidityPoolDetails: {
      defiProtocol: {
        name: "Raydium",
        imgUrl: raydiumImg,
      },
      lbType: "Full Range",
      lockingPeriod: "12 months",
    },
    pastOrders: [
      {
        borgAmount: 3813.35,
        date: addDays(currentMoment, -8),
        externalLink: "#",
      },
      {
        borgAmount: 110.1,
        date: addDays(currentMoment, -7),
        externalLink: "#",
      },
      {
        borgAmount: 240.891,
        date: addDays(currentMoment, -6),
        externalLink: "#",
      },
      {
        borgAmount: 440.4,
        date: addDays(currentMoment, -5),
        externalLink: "#",
      },
    ],
  },
  secondaryImgUrl: secondaryImgUrl,
  timeline: [
    {
      label: i18n.t("timeline.registration_opens"),
      date: addDays(currentMoment, -22),
      id: "REGISTRATION_OPENS",
    },
    {
      label: i18n.t("timeline.sale_opens"),
      date: addDays(currentMoment, -10),
      id: "SALE_OPENS",
    },
    {
      label: i18n.t("timeline.sale_closes"),
      date: addDays(currentMoment, -1),
      id: "SALE_CLOSES",
    },
    {
      label: i18n.t("timeline.reward_distribution"),
      date: addDays(currentMoment, 5),
      id: "REWARD_DISTRIBUTION",
    },
    {
      label: "?",
      date: addDays(currentMoment, 24),
      id: "UNKNOWN",
    },
  ],
  saleResults: {
    totalAmountRaised: 800402.5661,
    sellOutPercentage: 78,
    participants: 578,
    averageInvestedAmount: 1200.34,
  },
}

export type LiquidityPoolDetails = {
  defiProtocol: {
    name: string
    imgUrl: string
  }
  lbType: string
  lockingPeriod: string
}