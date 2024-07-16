import { TokenAmount } from "./SolanaWeb3"

export type UserModel = {
  wallet_address: string
  twitter_id: string
  json: null | string
}

export type UserModelJson = {
  isFollowingOnX?: boolean
  isNotUsaResident?: boolean
  isNotUsaResidentConfirmationTimestamp?: string
}

export type GetWhitelistingResult = UserModelJson & {
  balance: TokenAmount
}
