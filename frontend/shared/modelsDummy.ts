import { timelineEvents } from "@/utils/constants"
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
const iconTypeSchema = () =>
  z.enum(["WEB", "LINKED_IN", "X_TWITTER", "MEDIUM", "OUTER_LINK"])
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
  info: z.object({
    id: z.string(),
    title: z.string(),
    subtitle: z.string(),
    logoUrl: z.string(),
    chain: z.object({ name: z.string(), iconUrl: urlSchema() }),
    origin: z.string(),
    sector: z.string(),
    curator: z.object({
      avatarUrl: urlSchema(),
      fullName: z.string(),
      position: z.string(),
      socials: z.array(externalUrlSchema()),
    }),
    projectLinks: z.array(externalUrlSchema()),
    totalTokensForSale: z.number().int(),
    tge: z.object({
      raiseTarget: z.number().int(),
      projectCoin: z.object({
        iconUrl: urlSchema(),
        ticker: z.string(),
      }),
      fixedCoinPriceInBorg: z.number(),
      liquidityPool: z.object({
        name: z.string(),
        iconUrl: urlSchema(),
        lbpType: z.string(),
        lockingPeriod: z.string(),
        unlockDate: dateSchema(),
        url: z.string(),
      }),
      tweetUrl: urlSchema(),
    }),
    dataRoom: z.object({
      backgroundImgUrl: urlSchema(),
      url: urlSchema(),
    }),
    timeline: z.array(
      z.object({
        id: z.enum(timelineEvents),
        date: dateSchema(),
        label: z.string(),
      }),
    ),
  }),
  whitelistParticipants: z.number(),
  saleData: z.object({
    availableTokens: z.boolean(),
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
}
