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
const urlSchema = () => z.string()
const iconTypeSchema = () => z.enum(["WEB", "LINKED_IN", "X_TWITTER", "MEDIUM"])
const externalUrlSchema = () =>
  z.object({
    url: urlSchema(),
    iconType: iconTypeSchema(),
    label: z.string(),
  })
const dateSchema = () => z.coerce.date()
/**
 * Schema for project, type should be inferred from this.
 */
export const projectSchema = z.object({
  id: z.string(),
  createdAt: dateSchema(),
  title: z.string(),
  subtitle: z.string(),
  logoUrl: z.string(),
  origin: z.string(),
  lbpType: z.string(),
  chain: z.object({ name: z.string(), iconUrl: urlSchema() }),
  curator: z.object({
    avatarUrl: urlSchema(),
    fullName: z.string(),
    position: z.string(),
    socials: z.array(externalUrlSchema()),
  }),
  projectLinks: z.array(externalUrlSchema()),
  tokensAvailability: z.object({
    available: z.number().int(),
    total: z.number().int(),
  }),
  tge: z.object({
    raiseTarget: z.number().int(),
    projectCoin: z.object({
      iconUrl: urlSchema(),
      ticker: z.string(),
    }),
    fixedCoinPriceInBorg: z.number(),
    registrations: z.number(),
    liquidityPool: z.object({
      name: z.string(),
      iconUrl: urlSchema(),
      lbpType: z.string(),
      lockingPeriod: z.string(),
      unlockDate: dateSchema(),
    }),
    tweetUrl: urlSchema(),
  }),
  dataRoom: z.object({
    backgroundImgUrl: urlSchema(),
    url: urlSchema(),
  }),
  timeline: z.array(
    z.object({
      id: z.enum([
        "REGISTRATION_OPENS",
        "SALE_OPENS",
        "SALE_CLOSES",
        "REWARD_DISTRIBUTION",
        "DISTRIBUTION_OVER",
      ]),
      date: dateSchema(),
      label: z.string(),
    }),
  ),
  saleResults: z.object({
    saleSucceeded: z.boolean(),
    totalAmountRaised: z.number(),
    sellOutPercentage: z.number(),
    participantCount: z.number(),
    averageInvestedAmount: z.number(),
  }),
  rewards: z.object({
    distributionType: z.string(),
    description: z.string(),
    payoutInterval: z.string(),
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
  currentPrice: number
  marketCap: number
  fullyDilutedValuation: number
  cache?: unknown
}
export type GetPresignedUrlResponse = {
  signedUrl: string
  publicUrl: string
}