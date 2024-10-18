import { GetProjectsResponse, ProjectModel } from "shared/models"

export const getProjectsDummyResponse: GetProjectsResponse = {
  projects: [
    {
      info: {
        id: "puffer-finance",
        title: "Puffer Finance",
        subtitle: "Anti-Slashing Liquid Staking",
        logoUrl: "/images/puffer-finance/avatar.png",
        chain: {
          name: "Zora",
          iconUrl: "/images/puffer-finance/chain-icon.png",
        },
        origin: "🇮🇹 Italy",
        sector: "Healthcare",
        curator: {
          avatarUrl: "/images/puffer-finance/curator-avatar.png",
          fullName: "John Doe",
          position: "Founding Contributor",
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
        totalTokensForSale: 25000,
        tge: {
          raiseTarget: 2000000,
          projectCoin: {
            iconUrl: "/images/puffer-finance/project-coin-icon.svg",
            ticker: "LRC",
          },
          fixedCoinPriceInBorg: 1,
          liquidityPool: {
            name: "Raydium",
            iconUrl: "/images/puffer-finance/liquidity-pool-icon.png",
            lbpType: "Full Range",
            lockingPeriod: "12-month lockup",
            unlockDate: "2025-07-12T12:39:16.000Z",
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
            id: "REGISTRATION_OPENS",
            date: "2024-06-20T00:00:00.000Z",
            label: "Registration Opens",
          },
          {
            id: "SALE_OPENS",
            date: "2024-07-02T00:00:00.000Z",
            label: "Sale Opens",
          },
          {
            id: "SALE_CLOSES",
            date: "2024-07-07T00:00:00.000Z",
            label: "Sale Closes",
          },
          {
            id: "REWARD_DISTRIBUTION",
            date: "2024-07-10T00:00:00.000Z",
            label: "Reward Distribution",
          },
          {
            id: "DISTRIBUTION_OVER",
            date: "2025-07-10T00:00:00.000Z",
            label: "Distribution Over",
          },
        ],
        whitelistRequirements: [
          {
            type: "HOLD_BORG_IN_WALLET",
            label: "Hold 20,000 BORG in your wallet",
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
        ],
      },
      whitelistParticipants: 768,
      saleData: {
        availableTokens: 12403,
        saleSucceeded: true,
        totalAmountRaised: 800402.5661,
        sellOutPercentage: 78,
        participantCount: 578,
        averageInvestedAmount: 1200.34,
      },
      rewards: {
        distributionType: "linear",
        description: "linearly paid-out through 12 months",
        payoutInterval: "monthly",
      },
    },
    {
      info: {
        id: "mediterranean-olive-syndicate",
        title: "Mediterranean Olive Syndicate",
        subtitle: "Olive business",
        logoUrl: "",
        chain: {
          name: "Zora",
          iconUrl: "",
        },
        origin: "🇮🇹 Italy",
        sector: "Olives",
        curator: {
          avatarUrl: "",
          fullName: "Eddie Halstead",
          position: "Olives expert",
          socials: [
            {
              url: "https://brave.com",
              iconType: "X_TWITTER",
              label: "X (ex-Twitter)",
            },
          ],
        },
        projectLinks: [
          {
            url: "https://brave.com",
            iconType: "WEB",
            label: "Web Link",
          },
          {
            url: "https://brave.com",
            iconType: "LINKED_IN",
            label: "LinkedIn",
          },
        ],
        totalTokensForSale: 200000000,
        tge: {
          raiseTarget: 20000000,
          projectCoin: {
            iconUrl: "",
            ticker: "MOSA",
          },
          fixedCoinPriceInBorg: 0.233,
          liquidityPool: {
            name: "Olive Group",
            iconUrl: "",
            lbpType: "linear",
            lockingPeriod: "12 month lockup",
            unlockDate: "2025-04-24T22:00:00.000Z",
            url: "#",
          },
          tweetUrl:
            "https://x.com/swissborg/status/1801629344848089180?s=23431?t=134134",
        },
        dataRoom: {
          backgroundImgUrl: "",
          url: "https://brave.com",
        },
        timeline: [
          {
            id: "REGISTRATION_OPENS",
            date: "2024-08-05T22:00:00.000Z",
            label: "Registration Opens",
          },
          {
            id: "SALE_OPENS",
            date: "2024-08-07T22:00:00.000Z",
            label: "Sale Opens",
          },
          {
            id: "SALE_CLOSES",
            date: "2024-08-09T22:00:00.000Z",
            label: "Sale Closes",
          },
          {
            id: "REWARD_DISTRIBUTION",
            date: "2024-08-12T22:00:00.000Z",
            label: "Reward Distribution",
          },
          {
            id: "DISTRIBUTION_OVER",
            date: "2025-05-21T22:00:00.000Z",
            label: "Distribution Over",
          },
        ],
        whitelistRequirements: [
          {
            type: "HOLD_BORG_IN_WALLET",
            label: "Hold 11333 BORG in your wallet",
            description: "",
            isMandatory: true,
            heldAmount: 11333,
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
        ],
      },
      whitelistParticipants: 768,
      saleData: {
        availableTokens: 12403,
        saleSucceeded: true,
        totalAmountRaised: 800402.5661,
        sellOutPercentage: 78,
        participantCount: 578,
        averageInvestedAmount: 1200.34,
      },
      rewards: {
        distributionType: "linear",
        description: "linearly paid-out through 12 months",
        payoutInterval: "monthly",
      },
    },
    {
      info: {
        id: "alaska-fishing-rods-company",
        title: "Alaska Fishing Rods Company",
        subtitle: "Fishing",
        logoUrl:
          "https://pub-afd56fb014c94eac935a52c2d0d6a5e8.r2.dev/images/alaska-fishing-rods-company/project-logo-587028206",
        chain: {
          name: "Zora",
          iconUrl:
            "https://pub-afd56fb014c94eac935a52c2d0d6a5e8.r2.dev/images/alaska-fishing-rods-company/chain-icon-19618374",
        },
        origin: "🇺🇸 Alaska",
        sector: "Fishing",
        curator: {
          avatarUrl:
            "https://pub-afd56fb014c94eac935a52c2d0d6a5e8.r2.dev/images/alaska-fishing-rods-company/curator-avatar-222078670",
          fullName: "Eddie Halstead",
          position: "Fishing Expert",
          socials: [
            {
              url: "https://x.com/BorgPadHQ",
              iconType: "X_TWITTER",
              label: "X (ex-Twitter)",
            },
            {
              url: "https://x.com/BorgPadHQ",
              iconType: "MEDIUM",
              label: "Medium",
            },
            {
              url: "https://x.com/BorgPadHQ",
              iconType: "WEB",
              label: "Web Url",
            },
          ],
        },
        projectLinks: [
          {
            url: "https://x.com/BorgPadHQ",
            iconType: "WEB",
            label: "Web Link",
          },
          {
            url: "https://x.com/BorgPadHQ",
            iconType: "LINKED_IN",
            label: "LinkedIn",
          },
          {
            url: "https://x.com/BorgPadHQ",
            iconType: "X_TWITTER",
            label: "X (ex Twitter)",
          },
        ],
        totalTokensForSale: 20000000,
        tge: {
          raiseTarget: 2000000,
          projectCoin: {
            iconUrl:
              "https://pub-afd56fb014c94eac935a52c2d0d6a5e8.r2.dev/images/alaska-fishing-rods-company/project-coin-icon-112955543",
            ticker: "AFRC",
          },
          fixedCoinPriceInBorg: 0.1441,
          liquidityPool: {
            name: "Alaska Group",
            iconUrl:
              "https://pub-afd56fb014c94eac935a52c2d0d6a5e8.r2.dev/images/alaska-fishing-rods-company/liquidity-pool-icon-867930826",
            lbpType: "Full Range",
            lockingPeriod: "12-month lockup",
            unlockDate: "2025-07-23T22:00:00.000Z",
            url: "#",
          },
          tweetUrl:
            "https://x.com/swissborg/status/1801629344848089180?s=23431?t=134134",
        },
        dataRoom: {
          backgroundImgUrl:
            "https://pub-afd56fb014c94eac935a52c2d0d6a5e8.r2.dev/images/alaska-fishing-rods-company/data-room-backdrop-313054317",
          url: "https://x.com/BorgPadHQ",
        },
        timeline: [
          {
            id: "REGISTRATION_OPENS",
            date: "2024-08-11T22:00:00.000Z",
            label: "Registration Opens",
          },
          {
            id: "SALE_OPENS",
            date: "2024-08-13T22:00:00.000Z",
            label: "Sale Opens",
          },
          {
            id: "SALE_CLOSES",
            date: "2024-08-15T22:00:00.000Z",
            label: "Sale Closes",
          },
          {
            id: "REWARD_DISTRIBUTION",
            date: "2024-08-17T22:00:00.000Z",
            label: "Reward Distribution",
          },
          {
            id: "DISTRIBUTION_OVER",
            date: "2025-05-15T22:00:00.000Z",
            label: "Distribution Over",
          },
        ],
        whitelistRequirements: [
          {
            type: "HOLD_BORG_IN_WALLET",
            label: "Hold 11450 BORG in your wallet",
            description: "",
            isMandatory: true,
            heldAmount: 11450,
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
        ],
      },
      whitelistParticipants: 399,
      saleData: {
        availableTokens: 1900,
        saleSucceeded: true,
        totalAmountRaised: 39999.5661,
        sellOutPercentage: 41,
        participantCount: 422,
        averageInvestedAmount: 989.34,
      },
      rewards: {
        distributionType: "linear",
        description: "linearly paid-out through 12 months",
        payoutInterval: "monthly",
      },
    },
    {
      info: {
        id: "new-madagascar-ski-resort",
        title: "New Madagascar Ski Resort",
        subtitle: "Ski Resort",
        logoUrl:
          "https://pub-afd56fb014c94eac935a52c2d0d6a5e8.r2.dev/images/new-madagascar-ski-resort/project-logo-311742656",
        chain: {
          name: "Zora Alternative",
          iconUrl:
            "https://pub-afd56fb014c94eac935a52c2d0d6a5e8.r2.dev/images/new-madagascar-ski-resort/chain-icon-500176709",
        },
        origin: "🇲🇬 Madagascar",
        sector: "Winter Turism",
        curator: {
          avatarUrl:
            "https://pub-afd56fb014c94eac935a52c2d0d6a5e8.r2.dev/images/new-madagascar-ski-resort/curator-avatar-373617204",
          fullName: "Confused Jack",
          position: "LBP Expert",
          socials: [
            {
              url: "https://en.wikipedia.org/wiki/Samurai_Jack",
              iconType: "X_TWITTER",
              label: "X (ex-Twitter)",
            },
            {
              url: "https://en.wikipedia.org/wiki/Samurai_Jack",
              iconType: "WEB",
              label: "",
            },
            {
              url: "https://en.wikipedia.org/wiki/Samurai_Jack",
              iconType: "LINKED_IN",
              label: "LinkedIn",
            },
            {
              url: "https://en.wikipedia.org/wiki/Samurai_Jack",
              iconType: "MEDIUM",
              label: "Medium",
            },
          ],
        },
        projectLinks: [
          {
            url: "https://en.wikipedia.org/wiki/Madagascar_(2005_film)",
            iconType: "WEB",
            label: "Web Link",
          },
          {
            url: "https://en.wikipedia.org/wiki/Madagascar_(2005_film)",
            iconType: "X_TWITTER",
            label: "X (ex Twitter)",
          },
          {
            url: "https://en.wikipedia.org/wiki/Madagascar_(2005_film)",
            iconType: "LINKED_IN",
            label: "LinkedIn",
          },
          {
            url: "https://en.wikipedia.org/wiki/Madagascar_(2005_film)",
            iconType: "MEDIUM",
            label: "Medium",
          },
        ],
        totalTokensForSale: 20000000,
        tge: {
          raiseTarget: 20000000,
          projectCoin: {
            iconUrl:
              "https://pub-afd56fb014c94eac935a52c2d0d6a5e8.r2.dev/images/new-madagascar-ski-resort/project-coin-icon-284500146",
            ticker: "NMSR",
          },
          fixedCoinPriceInBorg: 0.2002,
          liquidityPool: {
            name: "Madagascar Group",
            iconUrl:
              "https://pub-afd56fb014c94eac935a52c2d0d6a5e8.r2.dev/images/new-madagascar-ski-resort/liquidity-pool-icon-725131546",
            lbpType: "Full Ragne",
            lockingPeriod: "12-month lockup",
            unlockDate: "2025-02-12T23:00:00.000Z",
            url: "#",
          },
          tweetUrl:
            "https://x.com/swissborg/status/1801629344848089180?s=23431?t=134134",
        },
        dataRoom: {
          backgroundImgUrl:
            "https://pub-afd56fb014c94eac935a52c2d0d6a5e8.r2.dev/images/new-madagascar-ski-resort/data-room-backdrop-152902184",
          url: "https://en.wikipedia.org/wiki/Samurai_Jack",
        },
        timeline: [
          {
            id: "REGISTRATION_OPENS",
            date: "2024-08-13T22:00:00.000Z",
            label: "Registration Opens",
          },
          {
            id: "SALE_OPENS",
            date: "2024-08-15T22:00:00.000Z",
            label: "Sale Opens",
          },
          {
            id: "SALE_CLOSES",
            date: "2024-08-17T22:00:00.000Z",
            label: "Sale Closes",
          },
          {
            id: "REWARD_DISTRIBUTION",
            date: "2024-08-19T22:00:00.000Z",
            label: "Reward Distribution",
          },
          {
            id: "DISTRIBUTION_OVER",
            date: "2025-02-13T23:00:00.000Z",
            label: "Distribution Over",
          },
        ],
        whitelistRequirements: [
          {
            type: "HOLD_BORG_IN_WALLET",
            label: "Hold 11000 BORG in your wallet",
            description: "",
            isMandatory: true,
            heldAmount: 11000,
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
        ],
      },
      whitelistParticipants: 524,
      saleData: {
        availableTokens: 34031,
        saleSucceeded: true,
        totalAmountRaised: 120000.5661,
        sellOutPercentage: 83,
        participantCount: 244,
        averageInvestedAmount: 2300.11,
      },
      rewards: {
        distributionType: "linear",
        description: "linearly paid-out through 12 months",
        payoutInterval: "monthly",
      },
    },
  ] as unknown as ProjectModel[],
  pagination: {
    page: 1,
    limit: 10,
    total: 4,
    totalPages: 1,
  },
}
