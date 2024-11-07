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
    signature: string
  }>
  termsOfUse?: {
    acceptedAt: Date
    acceptedTextSigned: string
    countryOfOrigin: string
  }
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
    .regex(
      new RegExp(/^[A-Za-z0-9-]+$/),
      "Only letters, numbers, and dashes are allowed",
    )
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

  ///// project token info /////
  projectOwnerAddress: SolanaAddressSchema,

  launchedTokenMintAddress: SolanaAddressSchema,
  launchedTokenLpDistribution: z.number().int(),
  launchedTokenCap: z.number().int(),

  raisedTokenMintAddress: SolanaAddressSchema,
  raisedTokenMinCap: z.number().int(),
  raisedTokenMaxCap: z.number().int(),

  cliffDuration: z.number().int(),
  vestingDuration: z.number().int(),

  totalTokensForSale: z.number({ coerce: true }).int(),
  totalTokensForRewardDistribution: z.number({ coerce: true }).int(),
  tge: z.object({
    raiseTarget: z.number({ coerce: true }).int(),
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
    tweetUrl: z.string(),
  }),
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
  amount: z.number(),
  walletAddress: z.string(),
  projectId: z.string()
})
export const getUserDepositSchema = userDepositSchema.omit({
  transaction: true,
  amount: true
})
const SolanaClusterSchema = z.enum(['mainnet', 'devnet'])

export const projectSchema = z.object({
  cluster: SolanaClusterSchema.optional(),
  info: infoSchema,
  saleData: z
    .object({
      availableTokens: z.number({ coerce: true }).optional(),
      saleSucceeded: z.boolean().optional(),
      totalAmountRaised: z.number({ coerce: true }).optional(),
      sellOutPercentage: z.number({ coerce: true }).optional(),
      participantCount: z.number({ coerce: true }).optional(),
      averageInvestedAmount: z.number({ coerce: true }).optional(),
    })
    .optional(),
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
