import {
  CreateUsernameRequestSchema, // Make sure this schema is correctly imported
  GetTokensResponse,
  TokenModel,
  DaoModel,
  GetUserTokensResponse,
  GetTokenMarketResponse,
  GetTokenBalanceResponse,
  GetGovernanceDataResponse,
  AdminAuthFields
} from "../../../shared/models.ts"
import { GitHubScoreData } from "../../../shared/services/githubScore"
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
const GET_APPLICATIONS = API_BASE_URL + "/applications"
const GITHUB_SCORE = API_BASE_URL + "/github-score"
const IS_ADMIN_URL = API_BASE_URL + "/admin/isadmin"

type PostCreateUserStatusArgs = {
  address: string 
  // email: string
  username: string
}

const isAdmin = async (auth: AdminAuthFields): Promise<void> => {
  const url = new URL(IS_ADMIN_URL, window.location.href)

  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify(auth),
    headers: {
      "Content-Type": "application/json",
    },
  })
  const json = await response.json()
  if (!response.ok) throw new Error(json.message)
  return json
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

// Applications API Types
export type ApplicationResponse = {
  id: string
  projectId: string
  githubUsername: string
  githubId: string
  deliverableName: string
  requestedPrice: number
  estimatedDeadline: string
  featureDescription: string
  solanaWalletAddress: string
  status: string
  githubScore?: number
  createdAt: string
  updatedAt: string
}

export type GetApplicationsResponse = {
  applications: ApplicationResponse[]
}

export type SubmitApplicationRequest = {
  projectId: string
  githubUsername: string
  githubId: string
  deliverableName: string
  requestedPrice: number
  estimatedDeadline: string
  featureDescription: string
  solanaWalletAddress: string
  githubAccessToken?: string
}

// Applications API Functions
type GetApplicationsByProjectIdArgs = {
  projectId: string
}

const getApplicationsByProjectId = async ({ projectId }: GetApplicationsByProjectIdArgs): Promise<GetApplicationsResponse> => {
  const url = new URL(GET_APPLICATIONS)
  url.searchParams.set("projectId", projectId)
  
  const response = await fetch(url)
  
  if (!response.ok) {
    throw new Error("Failed to fetch applications")
  }
  
  const json = await response.json()
  return json
}

type GetAllApplicationsArgs = {
  sortBy?: string
  sortDirection?: string
}

const getAllApplications = async ({ sortBy, sortDirection }: GetAllApplicationsArgs = {}): Promise<GetApplicationsResponse> => {
  const url = new URL(GET_APPLICATIONS)
  
  if (sortBy) {
    url.searchParams.set("sortBy", sortBy)
  }
  if (sortDirection) {
    url.searchParams.set("sortDirection", sortDirection)
  }
  
  const response = await fetch(url)
  
  if (!response.ok) {
    throw new Error("Failed to fetch applications")
  }
  
  const json = await response.json()
  return json
}

const submitApplication = async (applicationData: SubmitApplicationRequest): Promise<{ success: boolean; applicationId: string; githubScore?: number; message: string }> => {
  const url = new URL(GET_APPLICATIONS)
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(applicationData),
  })
  
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Failed to submit application")
  }
  
  const json = await response.json()
  return json
}

// GitHub Score API Types
export type GenerateGitHubScoreRequest = {
  githubUsername: string
  githubAccessToken: string
  applicationId?: string
}

export type GenerateGitHubScoreResponse = {
  success: boolean
  githubScore?: number
  message: string
}

export type GetApplicationWithGitHubScoreResponse = {
  success: boolean
  application: ApplicationResponse
}

// GitHub Score API Functions
const generateGitHubScore = async (request: GenerateGitHubScoreRequest): Promise<GenerateGitHubScoreResponse> => {
  const url = new URL(GITHUB_SCORE)
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  })
  
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Failed to generate GitHub score")
  }
  
  const json = await response.json()
  return json
}

const getApplicationWithGitHubScore = async (applicationId: string): Promise<GetApplicationWithGitHubScoreResponse> => {
  const url = new URL(GITHUB_SCORE)
  url.searchParams.set("applicationId", applicationId)
  
  const response = await fetch(url)
  
  if (!response.ok) {
    throw new Error("Failed to fetch application with GitHub score")
  }
  
  const json = await response.json()
  return json
}

// Test GitHub API connectivity
const testGitHubApi = async (githubAccessToken: string): Promise<{ success: boolean; message: string; user?: { username: string; id: number; publicRepos: number } }> => {
  const url = new URL(`${API_BASE_URL}/test-github`)
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ githubAccessToken }),
  })
  
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Failed to test GitHub API")
  }
  
  const json = await response.json()
  return json
}

const testGitHubPermissions = async (githubAccessToken: string): Promise<{ success: boolean; message: string; results: Record<string, unknown> }> => {
  const url = new URL(`${API_BASE_URL}/test-github-permissions`)
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ githubAccessToken }),
  })
  
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Failed to test GitHub permissions")
  }
  
  const json = await response.json()
  return json
}

export type DaoResponse = {
  id: string
  name: string
  imageUrl: string | null
  dao: string
  tokenMint: string
}

export type GetDaosResponse = {
  daos: DaoResponse[]
}

const getDaos = async (): Promise<GetDaosResponse> => {
  const url = new URL(`${API_BASE_URL}/daos`, window.location.href)
  const response = await fetch(url)
  
  if (!response.ok) {
    throw new Error("Failed to fetch DAOs")
  }
  
  const json = await response.json()
  return json
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
  getApplicationsByProjectId,
  getAllApplications,
  submitApplication,
  getDaos,
  isAdmin,
  generateGitHubScore,
  getApplicationWithGitHubScore,
  testGitHubApi,
  testGitHubPermissions,
}