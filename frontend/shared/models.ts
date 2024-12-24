import { z } from "zod"
import { TierSchema } from "./eligibilityModel.ts"
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
const urlSchema = () => z.string().optional() // @TODO - remove optionality when file upload is finished
const iconTypeSchema = () =>
  z.enum(["WEB", "LINKED_IN", "X_TWITTER", "MEDIUM", "OUTER_LINK"])
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

const idSchema = () =>
  z
    .string()
    .min(1)
    .regex(new RegExp(/^[A-Za-z0-9-]+$/), "Only letters, numbers, and dashes are allowed")
export const SolanaAddressSchema = z.string().regex(/[1-9A-HJ-NP-Za-km-z]{32,44}/)
/**
 * Schemas for project, type should be inferred from this.
 */
export const infoSchema = z.object({
  id: idSchema(),

  ///// project metadata info /////
  title: z.string().min(1),
  subtitle: z.string().min(1),
  logoUrl: urlSchema(),
  thumbnailUrl: urlSchema().optional(),
  chain: z.object({ name: z.string().min(1), iconUrl: urlSchema() }),
  origin: z.string().min(1),
  sector: z.string().min(1),
  curator: z.object({
    avatarUrl: urlSchema(),
    fullName: z.string().min(1),
    position: z.string().min(1),
    socials: z.array(externalUrlSchema()),
  }),
  projectLinks: z.array(externalUrlSchema()),

  tokenContractUrl: z.string().optional(),
  poolContractUrl: z.string().optional(),

  ///// project token info /////

  // below 3 fields are most important, move them into an object 'lp' or something like that
  launchedTokenMintAddress: SolanaAddressSchema.nullable(),
  raisedTokenMintAddress: SolanaAddressSchema,
  lbpWalletAddress: SolanaAddressSchema.nullable(),

  // make this an enum which describes lpType (might be more than 2 in the future, boolean isn't scalable in this sense)
  lpPositionToBeBurned: z.boolean().optional(),

  // non-negative minimums, max safe integer maximums
  totalTokensForSale: z.number({ coerce: true }).min(0).max(Number.MAX_SAFE_INTEGER).int(), // total tokens for LP positions
  totalTokensForRewardDistribution: z.number({ coerce: true }).min(0).max(Number.MAX_SAFE_INTEGER).int(),

  // link for claiming rewards (currently doing airdrops with streamflow, but could be anything)
  claimUrl: z.string().optional().nullable(),

  tge: z.object({
    raiseTarget: z.number({ coerce: true }).max(Number.MAX_SAFE_INTEGER).int(),
    projectCoin: z.object({
      iconUrl: urlSchema(),
      ticker: z.string().min(1),
    }),
    fixedTokenPriceInUSD: z.number({ coerce: true }),
    tokenGenerationEventDate: z.string().optional(),
    fdv: z.number().int().optional(),
    liquidityPool: z.object({
      name: z.string().min(1),
      iconUrl: urlSchema(),
      lbpType: z.string().min(1),
      lockingPeriod: z.string().min(1),
      unlockDate: dateSchema().nullable(),
      url: z.string().min(1),
    }),
    // move somewhere else
    tweetUrl: z.string(),
  }),
  // move data room also , not critical data
  dataRoom: z.object({
    backgroundImgUrl: urlSchema(),
    url: z.string().min(1),
  }),
  timeline: z.array(
    z.object({
      id: timelineEventsSchema(),
      date: dateSchema().nullable(),
      label: z.string().min(1),
    }),
  ),
  tiers: z.array(TierSchema).min(1),
  // TODO @prodRush @finalSnapshotTimestamp make this mandatory to avoid null checks
  finalSnapshotTimestamp: dateSchema().optional(),
})

// "distributionType" and "payoutInterval" enum alternative values to be discussed. They will require further logic on backend and programs.
export const rewardsSchema = z.object({
  distributionType: z.enum(["linear"]), // possible alternative - exponential
  description: z.string(),
  payoutInterval: z.enum(["monthly"]),
})

export const userDepositSchema = z.object({
  transaction: z.string(),
  projectId: z.string()
})

const SolanaClusterSchema = z.enum(['mainnet', 'devnet'])

/**
 * Refactor this:
 *  - better structure (first structure wasn't designed at all, it was just built-upon)
 *  - default cluster (mainnet)
 * Calculate dynamically everything that can be, don't duplicate data in json:
 *  - token price
 */
export const projectSchema = z.object({
  cluster: SolanaClusterSchema,
  info: infoSchema,
  rewards: rewardsSchema.optional(),
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
  currentPrice: number
  marketCap: number
  fullyDilutedValuation: number
  quotedFrom?: string
  cache?: unknown
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
  projects: ProjectModel[]
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

// TODO search all 'whitelist' in project and check if the naming is ok (isCompliant, isEligible, isWhitelisted)

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
