import { TokenAmount } from "./SolanaWeb3"
import { z } from "zod"
/**
 * UserModel, user table in the database.
 */
export type UserModel = {
  wallet_address: string
  json: null | string
}
/**
 * UserModelJson, json column in user database.
 */
export type UserModelJson = {
  twitter?: {
    twitterId: string
    isFollowingOnX: boolean
  }
  residency?: {
    isNotUsaResident?: boolean
    isNotUsaResidentConfirmationTimestamp?: string
  }
}
/**
 * GET /whitelisting api response type
 */
export type GetWhitelistingResult = {
  balance: TokenAmount
  isFollowingOnX: boolean
  isNotUsaResident: boolean
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
const whitelistRequirementsSchema = () =>
  z.object({
    type: z.enum(["HOLD_BORG_IN_WALLET", "FOLLOW_ON_X", "DONT_RESIDE_IN_US"]),
    label: z.string().min(1),
    description: z.string(),
    isMandatory: z.boolean(),
    heldAmount: z.number({ coerce: true }).optional(),
  })
export type WhitelistRequirementModel = z.infer<
  ReturnType<typeof whitelistRequirementsSchema>
>

/**
 * Schema for project, type should be inferred from this.
 */

export const infoSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  logoUrl: urlSchema(),
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
  totalTokensForSale: z.number({ coerce: true }).int(),
  tge: z.object({
    raiseTarget: z.number({ coerce: true }).int(),
    projectCoin: z.object({
      iconUrl: urlSchema(),
      ticker: z.string().min(1),
    }),
    fixedCoinPriceInBorg: z.number({ coerce: true }),
    liquidityPool: z.object({
      name: z.string().min(1),
      iconUrl: urlSchema(),
      lbpType: z.string().min(1),
      lockingPeriod: z.string().min(1),
      unlockDate: dateSchema(),
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
      date: dateSchema(),
      label: z.string().min(1),
    }),
  ),
  whitelistRequirements: z.array(whitelistRequirementsSchema()).min(0),
})

// "distributionType" and "payoutInterval" enum alternative values to be discussed. They will require further logic on backend and programs.
export const rewardsSchema = z.object({
  distributionType: z.enum(["linear"]), // possible alternative - exponential
  description: z.string(),
  payoutInterval: z.enum(["monthly"]),
})

export const projectSchema = z.object({
  info: infoSchema,
  whitelistParticipants: z.number(),
  saleData: z.object({
    availableTokens: z.number({ coerce: true }).optional(),
    saleSucceeded: z.boolean().optional(),
    totalAmountRaised: z.number({ coerce: true }).optional(),
    sellOutPercentage: z.number({ coerce: true }).optional(),
    participantCount: z.number({ coerce: true }).optional(),
    averageInvestedAmount: z.number({ coerce: true }).optional(),
  }),
  rewards: rewardsSchema,
})
export type ProjectInfoModel = z.infer<typeof infoSchema>
export type ProjectRewardsModel = z.infer<typeof rewardsSchema>
export type ProjectModel = z.infer<typeof projectSchema>
export type DistributionType = ProjectRewardsModel["distributionType"]
export type PayoutInterval = ProjectRewardsModel["payoutInterval"]

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
