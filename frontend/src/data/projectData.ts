import { addDays } from "date-fns/addDays"
import { addMonths } from "date-fns"
import i18n from "@/i18n/i18n"
import { ProjectModel } from "../../shared/models.ts"

const currentMoment = addDays(new Date(), 11)

export const dummyData: ProjectModel = {
  id: "puffer-finance",
  title: "Puffer Finance",
  subtitle: "Anti-Slashing Liquid Staking",
  logoUrl: "/images/puffer-finance/avatar.png",
  chain: { name: "Zora", iconUrl: "/images/puffer-finance/chain-icon.png" },
  origin: "🇮🇹 Italy",
  sector: "Healthcare",
  curator: {
    avatarUrl: "/images/puffer-finance/curator-avatar.png",
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
      label: "",
    },
    {
      url: "https://medium.com/@puffer.fi",
      iconType: "MEDIUM",
      label: "",
    },
    {
      url: "https://www.linkedin.com/company/puffer-finance",
      iconType: "LINKED_IN",
      label: "",
    },
    {
      url: "https://twitter.com/puffer_finance",
      iconType: "X_TWITTER",
      label: "",
    },
  ],
  tokensAvailability: {
    available: 1565,
    total: 2000,
  },
  tge: {
    raiseTarget: 2000000,
    projectCoin: {
      iconUrl: "/images/puffer-finance/project-coin-icon.svg",
      ticker: "LRC",
    },
    fixedCoinPriceInBorg: 1,
    whitelistParticipants: 1698,
    liquidityPool: {
      name: "Raydium",
      iconUrl: "/images/puffer-finance/liquidity-pool-icon.png",
      lbpType: "Full Range",
      lockingPeriod: "12-month lockup",
      unlockDate: addMonths(addDays(currentMoment, -2), 12),
      url: "#",
    },
    tweetUrl:
      "https://x.com/swissborg/status/1801629344848089180?s=23431?t=134134",
  },
  dataRoom: {
    backgroundImgUrl: "/images/puffer-finance/avatar2.png",
    url: "#",
  },
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
      label: i18n.t("timeline.distribution_over"),
      date: addDays(currentMoment, 24),
      id: "DISTRIBUTION_OVER",
    },
  ],
  saleResults: {
    saleSucceeded: true,
    totalAmountRaised: 800402.5661,
    sellOutPercentage: 78,
    participantCount: 578,
    averageInvestedAmount: 1200.34,
  },
  rewards: {
    distributionType: "linear", // I think alternative is "exponential", but we should check and discuss this
    description: "linearly paid-out through 12 months",
    payoutInterval: "monthly", // used for calculating payout schedule
  },
}
