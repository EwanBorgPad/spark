import {
  CreateUsernameRequestSchema, // Make sure this schema is correctly imported
  GetTokensResponse,
  TokenModel,
  DaoModel,
  GetUserTokensResponse,
  GetTokenMarketResponse,
  GetTokenBalanceResponse,
  GetGovernanceDataResponse
} from "../../../shared/models.ts"
import { deduplicateRequest, createRequestKey } from "../../utils/requestDeduplication"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `${window.location.origin}/api`

const POST_CREATE_USER = API_BASE_URL + "/user"
const GET_USER = API_BASE_URL + "/user"
const GET_TOKENS = API_BASE_URL + "/tokens"
const GET_TOKEN = API_BASE_URL + "/token"
const CREATE_DAO = API_BASE_URL + "/createdao"
const GET_DAO = API_BASE_URL + "/getdao"
const GET_USER_TOKENS = API_BASE_URL + "/getusertokens"
const GET_TOKEN_MARKET = API_BASE_URL + "/gettokenmarket"
const GET_TOKEN_BALANCE = API_BASE_URL + "/gettokenbalance"
const GET_GOVERNANCE_DATA = API_BASE_URL + "/getgovernancedata"

type PostCreateUserStatusArgs = {
  address: string 
  // email: string
  username: string
}

const postCreateUserStatus = async ({ address, username }: PostCreateUserStatusArgs): Promise<boolean> => {
  // Create complete URL for the request
  const url = new URL(POST_CREATE_USER)
  
  const body = JSON.stringify({
    publicKey: address, // Make sure this matches the expected schema on the server
    // email,
    username,
  })

  const response = await fetch(url, {
    method: "POST",
    body,
    headers: {
      "Content-Type": "application/json",
    },
    // Use 'same-origin' instead of 'include' if not crossing domains
    credentials: "same-origin"
  })
  
  if (!response.ok) {
    const json = await response.json().catch(() => ({ message: "Unknown error" }))
    throw new Error(json.message || "Request failed")
  }
  
  const json = await response.json()
  return json
}

type GetUserArgs = {
  address: string
}

type UserModelJson = {
  address: string
  username: string
}

const getUser = async ({ address }: GetUserArgs): Promise<UserModelJson> => {
  const url = new URL(GET_USER)
  url.searchParams.set("address", address)
  const response = await fetch(url)
  const json = await response.json()
  return json
}

type GetTokensArgs = {
  isGraduated: string
}

const getTokens = async ({ isGraduated }: GetTokensArgs): Promise<GetTokensResponse> => {
  const url = new URL(GET_TOKENS)
  url.searchParams.set("isGraduated", isGraduated)
  const response = await fetch(url)
  const json = await response.json()
  return json
}

type GetTokenArgs = {
  mint: string
}

type GetTokenResponse = {
  token: TokenModel
}

const getToken = async ({ mint }: GetTokenArgs): Promise<GetTokenResponse> => {
  const url = new URL(GET_TOKEN)
  url.searchParams.set("mint", mint)
  console.log(url)
  const response = await fetch(url)
  const json = await response.json()
  return json
}

type CreateDaoArgs = {
  name: string
  communityTokenMint: string
  minCommunityWeightToCreateGovernance?: number
  communityTokenType?: "liquid" | "membership" | "dormant"
  councilTokenType?: "liquid" | "membership" | "dormant"
  councilTokenMint?: string
  communityMintMaxVoterWeightSourceType?: "absolute" | "supplyFraction"
  communityMintMaxVoterWeightSourceValue?: number
  communityApprovalThreshold?: number
  councilApprovalThreshold?: number
  minCouncilWeightToCreateProposal?: number
  minTransactionHoldUpTime?: number
  votingBaseTime?: number
  votingCoolOffTime?: number
  depositExemptProposalCount?: number
  communityVoteTipping?: "disabled" | "early" | "strict"
  councilVoteTipping?: "disabled" | "early" | "strict"
  communityVetoVoteThreshold?: "disabled" | "enabled"
  councilVetoVoteThreshold?: "disabled" | "enabled"
}

type CreateDaoResponse = {
  success: boolean
  txSignature2?: string
  realmAddress?: string
  governanceAddress?: string
  message?: string
  transaction?: string
  realmName?: string
}

const createDao = async (args: CreateDaoArgs): Promise<CreateDaoResponse> => {
  const url = new URL(CREATE_DAO)
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
  })
  
  if (!response.ok) {
    const json = await response.json().catch(() => ({ message: "Unknown error" }))
    throw new Error(json.message || "DAO creation failed")
  }
  
  const json = await response.json()
  return json
}

type GetDaoArgs = {
  address: string
}

type GetDaoResponse = {
  dao: DaoModel
}

const getDao = async ({ address }: GetDaoArgs): Promise<GetDaoResponse> => {
  const url = new URL(GET_DAO)
  url.searchParams.set("address", address)
  const response = await fetch(url)
  const json = await response.json()
  return json
}

type GetUserTokensArgs = {
  address: string
}

const getUserTokens = async ({ address }: GetUserTokensArgs): Promise<GetUserTokensResponse> => {
  const url = new URL(GET_USER_TOKENS)
  url.searchParams.set("address", address)
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch user tokens: ${response.statusText}`)
  }
  const json = await response.json()
  return json
}

type GetTokenMarketArgs = {
  address: string
}

const getTokenMarket = async ({ address }: GetTokenMarketArgs): Promise<GetTokenMarketResponse> => {
  const url = new URL(GET_TOKEN_MARKET)
  url.searchParams.set("address", address)
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch token market data: ${response.statusText}`)
  }
  const json = await response.json()
  return json
}

type GetTokenBalanceArgs = {
  userAddress: string
  tokenMint: string
  cluster?: string
}

const getTokenBalance = async ({ userAddress, tokenMint, cluster = "mainnet" }: GetTokenBalanceArgs): Promise<GetTokenBalanceResponse> => {
  const requestKey = createRequestKey("getTokenBalance", { userAddress, tokenMint, cluster })
  
  return deduplicateRequest(requestKey, async () => {
    const url = new URL(GET_TOKEN_BALANCE)
    url.searchParams.set("userAddress", userAddress)
    url.searchParams.set("tokenMint", tokenMint)
    url.searchParams.set("cluster", cluster)
    
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch token balance: ${response.statusText}`)
    }
    const json = await response.json()
    return json
  })
}

type GetGovernanceDataArgs = {
  userAddress: string
  realmAddress: string
  tokenMint: string
  cluster?: string
}

const getGovernanceData = async ({ userAddress, realmAddress, tokenMint, cluster = "mainnet" }: GetGovernanceDataArgs): Promise<GetGovernanceDataResponse> => {
  const requestKey = createRequestKey("getGovernanceData", { userAddress, realmAddress, tokenMint, cluster })
  
  return deduplicateRequest(requestKey, async () => {
    const url = new URL(GET_GOVERNANCE_DATA)
    url.searchParams.set("userAddress", userAddress)
    url.searchParams.set("realmAddress", realmAddress)
    url.searchParams.set("tokenMint", tokenMint)
    url.searchParams.set("cluster", cluster)
    
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch governance data: ${response.statusText}`)
    }
    const json = await response.json()
    return json
  })
}

export const backendSparkApi = {
  postCreateUserStatus,
  getUser,
  getTokens,
  createDao,
  getToken,
  getDao,
  getUserTokens,
  getTokenMarket,
  getTokenBalance,
  getGovernanceData,
}