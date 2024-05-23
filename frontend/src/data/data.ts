import { ExternalLinkType } from "@/components/Button/ExternalLink"
import curator from "../assets/curator.png"
import chainImg from "../assets/zoraImg.png"
import projectCoin from "../assets/projectCoin.png"
import secondaryImgUrl from "../assets/secondaryImgUrl.png"
import { addDays } from "date-fns/addDays"
import { addHours } from "date-fns/addHours"
import { addMinutes } from "date-fns/addMinutes"
import { TimelineEventType } from "@/components/Timeline/Timeline"

const arbitraryDate = addMinutes(addHours(addDays(new Date(), -11), 1), 44)

type ProjectData = {
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
  whitelisting: {
    raiseTarget: number
    price: {
      coin: {
        iconUrl: string
        ticker: string
      }
      dollarPrice: number
      borgPrice: number
    }
    registrations: number
    vesting: {
      tgePercentage: number
      cliffPercentage: number
    }
    tokenGenerationEventDate: Date
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
    position: "Founding Contributor",
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
  whitelisting: {
    raiseTarget: 2000000,
    price: {
      coin: {
        iconUrl: projectCoin,
        ticker: "LRC",
      },
      dollarPrice: 0.08327,
      borgPrice: 0.41635,
    },
    registrations: 1698,
    vesting: {
      tgePercentage: 20,
      cliffPercentage: 20,
    },
    tokenGenerationEventDate: arbitraryDate,
  },
  secondaryImgUrl: secondaryImgUrl,
  timeline: [
    { label: "Registration Opens", date: arbitraryDate },
    { label: "Sale Opens", date: addDays(arbitraryDate, 10) },
    { label: "Sale Closes", date: addDays(arbitraryDate, 12) },
    { label: "Reward Distribution", date: addDays(arbitraryDate, 22) },
    { label: "?", date: addDays(arbitraryDate, 24) },
  ],
}
