import { ExternalLinkType } from "@/components/Button/ExternalLink"
import curator from "../assets/curator.png"
import chainImg from "../assets/zoraImg.png"

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
    available: 1150,
    total: 2000,
  },
}
