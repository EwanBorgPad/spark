import { addDays } from "date-fns/addDays"
import { addMonths } from "date-fns"
import i18n from "@/i18n/i18n"
import { ProjectModel } from "../../shared/models.ts"

const currentMoment = addDays(new Date(), 11)

/**
 * TODO @deprecate this
 */
export const dummyData: ProjectModel = {
  info: {
    id: "puffer-finance",
    title: "Puffer Finance",
    subtitle: "Anti-Slashing Liquid Staking",
    logoUrl: "/images/puffer-finance/avatar.png",
    thumbnailUrl: "https://pub-afd56fb014c94eac935a52c2d0d6a5e8.r2.dev/images/westeros-validator-group/project-thumbnail-824297648",
    chain: { name: "Zora", iconUrl: "/images/puffer-finance/chain-icon.png" },
    origin: "🇮🇹 Italy",
    sector: "Healthcare",
    curator: {
      avatarUrl: "",
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
    totalTokensForSale: 2000,

    "projectOwnerAddress": "5oY4RHVH4PBS3YDCuQ86gnaM27KvdC9232TpB71wLi1W",

    "launchedTokenMintAddress": "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr",
    "launchedTokenLpDistribution": 50,
    "launchedTokenCap": 100000,

    "raisedTokenMintAddress": "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr",
    "raisedTokenMinCap": 1000,
    "raisedTokenMaxCap": 1000000,

    "cliffDuration": 1728998916,
    "vestingDuration": 1731677316,

    tge: {
      raiseTarget: 2000000,
      projectCoin: {
        iconUrl: "",
        ticker: "LRC",
      },
      fixedCoinPriceInBorg: 1,
      liquidityPool: {
        name: "Raydium",
        iconUrl: "",
        lbpType: "Full Range",
        lockingPeriod: "12-month lockup",
        unlockDate: addMonths(addDays(currentMoment, -2), 12),
        url: "#",
      },
      tweetUrl:
        "https://x.com/swissborg/status/1801629344848089180?s=23431?t=134134",
    },
    dataRoom: {
      backgroundImgUrl: "",
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
    whitelistRequirements: [],
  },
  whitelistParticipants: 769,
  saleData: {
    availableTokens: 1200,
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
