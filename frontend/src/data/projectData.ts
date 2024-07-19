import { addDays } from "date-fns/addDays"
import i18n from "@/i18n/i18n"

import { ExternalLinkType } from "@/components/Button/ExternalLink"
import { TimelineEventType } from "@/components/Timeline/Timeline"

import secondaryImgUrl from "../assets/secondaryImgUrl.png"

const currentMoment = addDays(new Date(), 12)

// Data defined through Back Office

export type ProjectData = {
  title: string
  subtitle: string
  logoUrl: string
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
  projectLinks: ExternalLinkType[]
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
    fixedCoinPriceInBorg: number
    registrations: number
    vesting: {
      tgePercentage: number
      cliffPercentage: number
    }
    tokenGenerationEventDate: Date
    lockupDetails: LockupDetails
    liquidityPoolDetails: {
      lbType: string
      lockingPeriod: string
    }
    tweetURL: string
  }
  secondaryImgUrl: string
  timeline: TimelineEventType[]
  saleResults: {
    totalAmountRaised: number
    sellOutPercentage: number
    participantCount: number
    averageInvestedAmount: number
  }
}

export const dummyData: ProjectData = {
  title: "Puffer Finance",
  subtitle: "Anti-Slashing Liquid Staking",
  logoUrl: "/images/puffer-finance/avatar.png",
  chain: { name: "Zora", picUrl: "/images/puffer-finance/chain-icon.png" },
  lbpType: "Buy Only",
  origin: "🇮🇹 Italy",
  createdAt: new Date(),
  curator: {
    avatarUrl: '/images/puffer-finance/curator-avatar.png',
    fullName: "John Doe",
    position: i18n.t("founding.contributor"),
    socials: [
      {
        url: "https://medium.com/@puffer.fi",
        iconType: "MEDIUM",
        label: "Medium",
      },
      {
        url: "https://www.linkedin.com/company/puffer-finance",
        iconType: "LINKED_IN",
        label: "Linkedin",
      },
      {
        url: "https://twitter.com/puffer_finance",
        iconType: "X_TWITTER",
        label: "X (ex-Twitter)",
      },
    ],
  },
  projectLinks: [
    {
      url: "https://www.puffer.fi",
      iconType: "WEB",
      label: undefined,
    },
    {
      url: "https://medium.com/@puffer.fi",
      iconType: "MEDIUM",
      label: undefined,
    },
    {
      url: "https://www.linkedin.com/company/puffer-finance",
      iconType: "LINKED_IN",
      label: undefined,
    },
    {
      url: "https://twitter.com/puffer_finance",
      iconType: "X_TWITTER",
      label: undefined,
    },
  ],
  tokens: {
    available: 1565,
    total: 2000,
  },
  tge: {
    raiseTarget: 2000000,
    projectCoin: {
      iconUrl: '/images/puffer-finance/lrc-icon.svg',
      ticker: "LRC",
    },
    fixedCoinPriceInBorg: 1,
    registrations: 1698,
    vesting: {
      tgePercentage: 20,
      cliffPercentage: 20,
    },
    tokenGenerationEventDate: currentMoment,
    lockupDetails: {
      liquidityPool: {
        name: "Raydium",
        imgUrl: '/images/puffer-finance/liquidity-pool-icon.png',
      },
      description: "12 months",
    },
    liquidityPoolDetails: {
      lbType: "Full Range",
      lockingPeriod: "12 months",
    },
    tweetURL:
      "https://x.com/swissborg/status/1801629344848089180?s=23431?t=134134",
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
      date: addDays(currentMoment, -5),
      id: "SALE_CLOSES",
    },
    {
      label: i18n.t("timeline.reward_distribution"),
      date: addDays(currentMoment, -2),
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
    participantCount: 578,
    averageInvestedAmount: 1200.34,
  },
}

export type LockupDetails = {
  liquidityPool: {
    name: string
    imgUrl: string
  }
  description: string
}
