import i18n from "@/i18n/i18n"

import { ExternalLinkType } from "@/components/Button/ExternalLink"
import curator from "../assets/curator.png"
import chainImg from "../assets/zoraImg.png"
import secondaryImgUrl from "../assets/secondaryImgUrl.png"
import { addDays } from "date-fns/addDays"
import { addHours } from "date-fns/addHours"
import { addMinutes } from "date-fns/addMinutes"
import { TimelineEventType } from "@/components/Timeline/Timeline"
import { addSeconds } from "date-fns/addSeconds"
import raydiumImg from "@/assets/raydium.png"
import lrcCoinImg from "@/assets/lrcCoin.png"

const arbitraryDate = addSeconds(
  addMinutes(addHours(addDays(new Date(), -11), 1), 9),
  25,
)

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
  marketcap: number
  fdv: number
  tokens: {
    available: number
    total: number
  }
  distributionStartDate: Date
  tge: {
    raiseTarget: number
    projectCoin: {
      iconUrl: string
      ticker: string
    }
    price: {
      dollarPrice: number
      borgPrice: number
    }
    registrations: number
    vesting: {
      tgePercentage: number
      cliffPercentage: number
    }
    tokenGenerationEventDate: Date
    liquidityPool: {
      name: string
      img: string
    }
  }
  secondaryImgUrl: string
  timeline: TimelineEventType[]
}

export const dummyData: ProjectData = {
  title: "Puffer Finance",
  subtitle: "Anti-Slashing Liquid Staking",
  projectLinks: [
    {
      url: "#",
      linkType: "web",
      label: undefined,
    },
    {
      url: "#",
      linkType: "medium",
      label: undefined,
    },
    {
      url: "#",
      linkType: "linkedin",
      label: undefined,
    },
    {
      url: "#",
      linkType: "x-twitter",
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
        linkType: "linkedin",
        label: "Linkedin",
      },
      {
        url: "#",
        linkType: "x-twitter",
        label: "X (ex-Twitter)",
      },
      {
        url: "#",
        linkType: "medium",
        label: "Medium",
      },
    ],
  },
  marketcap: 220301040.134242,
  fdv: 144501647.5001,
  tokens: {
    available: 1565,
    total: 2000,
  },
  // might be swaped with duration of TGE
  distributionStartDate: addDays(arbitraryDate, 22),
  tge: {
    raiseTarget: 2000000,
    projectCoin: {
      iconUrl: lrcCoinImg,
      ticker: "LRC",
    },
    price: {
      dollarPrice: 0.08327,
      borgPrice: 0.41635,
    },
    registrations: 1698,
    vesting: {
      tgePercentage: 20,
      cliffPercentage: 20,
    },
    tokenGenerationEventDate: arbitraryDate,
    liquidityPool: {
      name: "Raydium",
      img: raydiumImg,
    },
  },
  secondaryImgUrl: secondaryImgUrl,
  timeline: [
    {
      label: i18n.t("timeline.registration_opens"),
      date: arbitraryDate,
      id: "REGISTRATION_OPENS",
    },
    {
      label: i18n.t("timeline.sale_opens"),
      date: addDays(arbitraryDate, 10),
      id: "SALE_OPENS",
    },
    {
      label: i18n.t("timeline.sale_closes"),
      date: addDays(arbitraryDate, 12),
      id: "SALE_CLOSES",
    },
    {
      label: i18n.t("timeline.reward_distribution"),
      date: addDays(arbitraryDate, 22),
      id: "REWARD_DISTRIBUTION",
    },
    {
      label: "?",
      date: addDays(arbitraryDate, 24),
      id: "UNKNOWN",
    },
  ],
}
