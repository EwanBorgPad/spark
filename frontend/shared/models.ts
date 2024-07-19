import { TokenAmount } from "./SolanaWeb3"
import { z } from "zod"
/**
 * UserModel, user table in the database.
 */
export type UserModel = {
  wallet_address: string
  twitter_id: string
  json: null | string
}
/**
 * UserModelJson, json column in user database.
 */
export type UserModelJson = {
  isFollowingOnX?: boolean
  isNotUsaResident?: boolean
  isNotUsaResidentConfirmationTimestamp?: string
}
/**
 * GET /whitelisting api response type
 */
export type GetWhitelistingResult = UserModelJson & {
  balance: TokenAmount
}
/**
 * Represents url type
 * Not sure what we wanna validate there ATM, so leave it as string for now.
 */
const urlSchema = () => z.string()
const iconTypeSchema = () => z.enum(['WEB', 'LINKED_IN', 'X_TWITTER', 'MEDIUM'])
/**
 * Schema for project, type should be inferred from this.
 */
export const projectSchema = z.object({
  id: z.string(),
  createdAt: z.string().datetime(),
  title: z.string(),
  subtitle: z.string(),
  origin: z.string(),
  lbpType: z.string(),
  chain: z.object({ name: z.string(), iconUrl: urlSchema() }),
  curator: z.object({
    avatarUrl: urlSchema(),
    fullName: z.string(),
    position: z.string(),
    socials: z.array(z.object({
      url: urlSchema(),
      iconType: iconTypeSchema(),
      label: z.string(),
    }))
  }),
  // TODO @projects add missing data here
})
