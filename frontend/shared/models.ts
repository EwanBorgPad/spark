import { z, ZodTypeAny } from "zod"
import { TierSchema } from "./eligibilityModel"
/**
 * @deprecated deprecate , use drizzle
 * UserModel, user table in the database.
 */
export type UserModel = {
  wallet_address: string
  json: UserModelJson
}
type TwitterHandle = string
type ProjectId = string
/**
 * UserModelJson, json column in user database.
 */
export type UserModelJson = {
  twitter?: {
    twitterId: string
    follows: Record<TwitterHandle, {
      isFollowing: boolean,
    }>
  }
  investmentIntent?: Record<ProjectId, {
    amount: string
    message: string
    signature: number[]
  }>
  termsOfUse?: {
    acceptedAt: Date
    acceptedTextSigned: string
    countryOfOrigin: string
  }
  referral?: Record<ProjectId, {
    referrerTwitterHandle: string
    createdAt: string
    message: string
    signature: number[]
  }>
}
/**
 * Represents url type
 * Not sure what we wanna validate there ATM, so leave it as string for now.
 */
const urlSchema = () => z.string()
const iconTypeSchema = () => z.enum(["WEB", "LINKED_IN", "X_TWITTER", "MEDIUM", "OUTER_LINK", "TELEGRAM"])
const externalUrlSchema = () =>
  z.object({
    url: z.string().min(1),
    iconType: iconTypeSchema(),
    label: z.string(),
  })
const dateSchema = () => z.coerce.date()
const timelineEventsSchema = () =>
  z.enum([
    "REGISTRATION_OPENS",
    "SALE_OPENS",
    "SALE_CLOSES",
    "REWARD_DISTRIBUTION",
    "DISTRIBUTION_OVER",
  ])

const optional = (type: ZodTypeAny) => type.optional().nullable();

const integerSchema = () => z.number().min(0).max(Number.MAX_SAFE_INTEGER).int();
const idSchema = () =>
  z
    .string()
    .min(1)
    .regex(new RegExp(/^[A-Za-z0-9-]+$/), "Only letters, numbers, and dashes are allowed")
export const SolanaAddressSchema = z.string().regex(/[1-9A-HJ-NP-Za-km-z]{32,44}/)
const SolanaClusterSchema = z.enum(['mainnet', 'devnet'])

const TokenDataSchema = z.object({
  iconUrl: urlSchema(),
  ticker: z.string(),

  mintAddress: SolanaAddressSchema.nullable(),
  decimals: integerSchema(),

  fixedTokenPriceInUsd: optional(z.number()),
  coinGeckoName: optional(z.string()),
})

export const ProjectTypeSchema = z.enum(["goat", "blitz", "draft-pick"])

export const projectSchema = z.object({
  id: idSchema(),
  config: z.object({
    cluster: SolanaClusterSchema,

    lpPositionToBeBurned: optional(z.boolean()),

    raiseTargetInUsd: integerSchema(),
    fdv: optional(integerSchema()),
    marketCap: optional(integerSchema()),

    totalTokensForLiquidityPool: integerSchema(),
    totalTokensForRewardDistribution: integerSchema(),

    rewardsDistributionTimeInMonths: integerSchema(),

    finalSnapshotTimestamp: optional(dateSchema()),

    lbpWalletAddress: SolanaAddressSchema.nullable(),

    raisedTokenData: TokenDataSchema,
    launchedTokenData: TokenDataSchema,
  }),
  info: z.object({
    /// following 4 fields are typically added AFTER the sale
    // link for claiming rewards (currently doing airdrops with streamflow, but could be anything)
    claimUrl: optional(z.string()),
    tweetUrl: optional(z.string()),
    tokenContractUrl: optional(z.string()),
    poolContractUrl: optional(z.string()),

    ///// project metadata info /////
    projectType: ProjectTypeSchema,
    title: z.string().min(1),
    subtitle: z.string().min(1),
    logoUrl: urlSchema(),
    thumbnailUrl: optional(urlSchema()),
    origin: z.string().min(1),
    sector: z.string().min(1),
    tokenGenerationEventDate: optional(z.string()),
    targetFdv: z.string().min(1).optional(),

    chain: z.object({ name: z.string().min(1), iconUrl: urlSchema() }),
    dataRoom: z.object({ backgroundImgUrl: urlSchema().optional(), url: urlSchema() }),
    liquidityPool: z.object({
      name: z.string().min(1),
      iconUrl: urlSchema(),
      lbpType: z.string().min(1),
      lockingPeriod: z.string().min(1),
    }),
    curator: z.object({
      avatarUrl: urlSchema(),
      fullName: z.string().min(1),
      position: z.string().min(1),
      socials: z.array(externalUrlSchema()),
    }),
    projectLinks: z.array(externalUrlSchema()),
    timeline: z.array(
      z.object({
        id: timelineEventsSchema(),
        date: dateSchema().nullable(),
        fallbackText: z.string().min(1).optional(),
        label: z.string().min(1),
      }),
    ),
    tiers: z.array(TierSchema).min(1),
  }),
})
export type ProjectModel = z.infer<typeof projectSchema>

export type CacheStoreModel = {
  cache_key: string
  created_at: string
  expires_at: string
  cache_data: string
}

export type GetExchangeResponse = {
  baseCurrency: string
  targetCurrency: string
  
  currentPrice: string
  
  quotedFrom?: string
  quotedAt?: string
  rawExchangeResponse?: unknown
}
export type GetPresignedUrlResponse = {
  signedUrl: string
  publicUrl: string
}
export type PaginationType = {
  page: number
  limit: number
  total: number
  totalPages: number
}
export type GetProjectsResponse = {
  projects: (ProjectModel & { investmentIntentSummary: InvestmentIntentSummary })[]
  pagination: PaginationType
}

export const AcceptTermsRequestSchema = z.object({
  publicKey: z.string(),
  message: z.string(),
  signature: z.array(z.number().int()),
})
export type AcceptTermsRequest = z.infer<typeof AcceptTermsRequestSchema>

export const InvestmentIntentRequestSchema = z.object({
  publicKey: z.string(),
  projectId: z.string(),
  amount: z.string(),
  message: z.string(),
  signature: z.array(z.number().int()),
})
export type InvestmentIntentRequest = z.infer<typeof InvestmentIntentRequestSchema>

export const InvestmentIntentSummarySchema = z.object({
  sum: z.number(),
  avg: z.number(),
  count: z.number(),
})
export type InvestmentIntentSummary = z.infer<typeof InvestmentIntentSummarySchema>

export type TokenAmountModel = {
  /**
   * Raw amount of tokens as a string, ignoring decimals
   */
  amount: string
  /**
   * Number of decimals configured for token's mint.
   */
  decimals: number
  /**
   * Token amount as a float, accounting for decimals.
   */
  uiAmount: string
  /**
   * Token amount value in USD
   */
  amountInUsd: string
  /**
   * Token price in USD
   */
  tokenPriceInUsd: string
}


export type SaleResultsResponse = {
  raiseTargetInUsd: string
  raiseTargetReached: boolean
  totalAmountRaised: TokenAmountModel
  averageDepositAmount: TokenAmountModel
  sellOutPercentage: string
  participantsCount: number
  marketCap: string
  fdv: string
}

export type UserInvestedRewardsResponse = {
  hasUserInvested: true
  lpPosition: {
    raisedTokenAmount: TokenAmountModel
    launchedTokenAmount: TokenAmountModel
  }
  rewards: {
    hasUserClaimedTotalAmount: boolean
    hasUserClaimedAvailableAmount: boolean
    hasRewardsDistributionStarted: boolean
    totalAmount: TokenAmountModel
    claimedAmount: TokenAmountModel
    claimableAmount: TokenAmountModel
    payoutSchedule: {
      date: string
      amount: number
      isClaimed: boolean
    }[]
  }
}

export type MyRewardsResponse = { hasUserInvested: false } | UserInvestedRewardsResponse

export type SaleResults = {
  raiseTargetInUsd: string
  raiseTargetReached: boolean
  totalAmountRaised: TokenAmountModel
  averageDepositAmount: TokenAmountModel
  participantsCount: number
  sellOutPercentage: number
  marketCap: number
  fdv: number
}

export type DepositStatus = {
  amountDeposited: TokenAmountModel
  minAmountAllowed: TokenAmountModel
  maxAmountAllowed: TokenAmountModel
  startTime: Date
}
