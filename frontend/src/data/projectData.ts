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
    title: "",
    subtitle: "",
    logoUrl: "",
    thumbnailUrl: "",
    chain: { name: "", iconUrl: "" },
    origin: "",
    sector: "",
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
    lpPositionToBeBurned: true,
    totalTokensForSale: 12500000,
    totalTokensForRewardDistribution: 9375000,

    projectOwnerAddress: "5oY4RHVH4PBS3YDCuQ86gnaM27KvdC9232TpB71wLi1W",

    launchedTokenMintAddress: "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr",
    launchedTokenLpDistribution: 50,
    launchedTokenCap: 100000,

    raisedTokenMintAddress: "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr",
    raisedTokenMinCap: 1000,
    raisedTokenMaxCap: 1000000,

    cliffDuration: 1728998916,
    vestingDuration: 1731677316,

    tge: {
      raiseTarget: 2000000,
      projectCoin: {
        iconUrl: "",
        ticker: "SOLID",
      },
      fixedTokenPriceInUSD: 0.02,
      tokenGenerationEventDate: "Q4 2024",
      fdv: 2301444,
      liquidityPool: {
        name: "Raydium",
        iconUrl: "",
        lbpType: "Full Range",
        lockingPeriod: "12-month lockup",
        unlockDate: addMonths(addDays(currentMoment, -2), 12),
        url: "#",
      },
      tweetUrl: "https://x.com/swissborg/status/1801629344848089180?s=23431?t=134134",
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
        date: null,
        // date: addDays(currentMoment, -2),
        id: "SALE_OPENS",
      },
      {
        label: i18n.t("timeline.sale_closes"),
        date: null,
        // date: addDays(currentMoment, -5),
        id: "SALE_CLOSES",
      },
      {
        label: i18n.t("timeline.reward_distribution"),
        date: null,
        // date: addDays(currentMoment, -2),
        id: "REWARD_DISTRIBUTION",
      },
      {
        label: i18n.t("timeline.distribution_over"),
        date: null,
        // date: addDays(currentMoment, 24),
        id: "DISTRIBUTION_OVER",
      },
    ],
    tiers: [],
    finalSnapshotTimestamp: new Date("2024-10-10T00:00:00Z"),
  },
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
