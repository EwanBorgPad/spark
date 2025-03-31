import {
  AcceptTermsRequest,
  CreateEmailRequest,
  DepositStatus,
  GetExchangeResponse,
  GetPresignedUrlResponse,
  GetProjectsResponse,
  InvestmentIntentRequest,
  InvestmentIntentSummary,
  MyRewardsResponse,
  ProjectModel,
  projectSchema,
  SaleResultsResponse,
  TokenAmountModel,
} from "../../shared/models.ts"
import {
  AnalysisSortBy,
  AnalysisSortDirection,
  analystSchema,
  GetListOfAnalysisResponse,
  NewAnalysisSchemaType,
} from "../../shared/schemas/analysis-schema.ts"
import { Analyst, Analysis } from "../../shared/drizzle-schema.ts"
import { EligibilityStatus } from "../../shared/eligibilityModel.ts"
import { eligibilityStatusCacheBust, investmentIntentSummaryCacheBust } from "@/utils/cache-helper.ts"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? `${window.location.origin}/api`
const GET_ELIGIBILITY_STATUS_API = API_BASE_URL + "/eligibilitystatus"
const POST_ACCEPT_TERMS_OF_USE_API = API_BASE_URL + "/acceptterms"
const POST_INVESTMENT_INTENT_API = API_BASE_URL + "/investmentintent"
const POST_REFERRAL_API = API_BASE_URL + "/referral"
const GET_PROJECT_API_URL = API_BASE_URL + "/projects" // + '?id=id'
const POST_PROJECT_API_URL = API_BASE_URL + "/projects"
const GET_EXCHANGE_API_URL = API_BASE_URL + "/exchange"
const GET_PRESIGNED_URL = API_BASE_URL + "/presignedurl"
const GET_INVESTMENT_INTENT_SUMMARY_URL = API_BASE_URL + "/investmentintentsummary"
const GET_DEPOSITS_URL = API_BASE_URL + "/deposits"
const GET_DEPOSIT_STATUS_URL = API_BASE_URL + "/depositstatus"
const GET_SALE_RESULTS_URL = API_BASE_URL + "/saleresults"
const GET_MY_REWARDS_URL = API_BASE_URL + "/myrewards"
export const BACKEND_RPC_URL = API_BASE_URL + "/rpcproxy"
const CREATE_DEPOSIT_TRANSACTION = API_BASE_URL + "/createdeposittransaction"
const CREATE_CLAIM_TRANSACTION = API_BASE_URL + "/createclaimtransaction"
const SEND_DEPOSIT_TRANSACTION = API_BASE_URL + "/senddeposittransaction"
const SEND_CLAIM_TRANSACTION = API_BASE_URL + "/sendclaimtransaction"
const POST_AFTER_SALE_UPDATE = API_BASE_URL + "/projects/after-sale-update"
const UPDATE_JSON = API_BASE_URL + "/projects/update-json"
const POST_CREATE_EMAIL = API_BASE_URL + "/createemail"

// analysis & analyst
const GET_TWITTER_AUTH_URL = API_BASE_URL + "/analyst/twitterauthurl"
const GET_ANALYST_URL = API_BASE_URL + "/analyst"
const POST_ANALYSIS = API_BASE_URL + "/analysis"
const GET_ANALYSIS_LIST = API_BASE_URL + "/analysis"

const failFastFetch = async (...args: Parameters<typeof fetch>): Promise<void> => {
  const response = await fetch(...args)

  if (response.status === 401) {
    throw new Error("Signature mismatch! Please make sure you are signing the message with the correct wallet address!")
  }

  if (!response.ok) {
    throw new Error("Something went wrong...")
  }
}

type GetEligibilityStatusArgs = {
  address: string
  projectId: string
}
const getEligibilityStatus = async ({ address, projectId }: GetEligibilityStatusArgs): Promise<EligibilityStatus> => {
  const url = new URL(GET_ELIGIBILITY_STATUS_API, window.location.href)
  url.searchParams.set("address", address)
  url.searchParams.set("projectId", projectId)
  const cacheBustStatus = eligibilityStatusCacheBust.getCacheBustStatus()
  if (cacheBustStatus && cacheBustStatus === "1") {
    url.searchParams.set("cache-bust", Date.now().toString())
    eligibilityStatusCacheBust.removeCacheBustStatus()
  }

  const response = await fetch(url)
  const json = await response.json()

  return json
}
type GetDepositsRequest = {
  address: string
  projectId: string
}
type GetDepositsResponse = {
  deposits: {
    transactionId: string
    createdAt: string
    amountDeposited: string
    tokenAddress: string
    uiAmount: string
    decimalMultiplier: string
    transactionUrl: string
  }[]
  total: TokenAmountModel
}

const getMyRewards = async ({ address, projectId }: GetDepositsRequest): Promise<MyRewardsResponse> => {
  const url = new URL(GET_MY_REWARDS_URL, window.location.href)
  url.searchParams.set("address", address)
  url.searchParams.set("projectId", projectId)

  const response = await fetch(url)
  const json = await response.json()

  return json
}

const getDeposits = async ({ address, projectId }: GetDepositsRequest): Promise<GetDepositsResponse> => {
  const url = new URL(GET_DEPOSITS_URL, window.location.href)
  url.searchParams.set("address", address)
  url.searchParams.set("projectId", projectId)

  const response = await fetch(url)
  const json = await response.json()

  return json
}

const getDepositStatus = async ({ address, projectId }: GetDepositsRequest): Promise<DepositStatus> => {
  const url = new URL(GET_DEPOSIT_STATUS_URL, window.location.href)
  url.searchParams.set("address", address)
  url.searchParams.set("projectId", projectId)

  const response = await fetch(url)
  const json = await response.json()

  return json
}

const getSaleResults = async ({ projectId }: { projectId: string }): Promise<SaleResultsResponse> => {
  const url = new URL(GET_SALE_RESULTS_URL, window.location.href)
  url.searchParams.set("projectId", projectId)

  const response = await fetch(url)
  const json = await response.json()

  return json
}

type GetInvestmentIntentSummary = {
  projectId: string
}
const getInvestmentIntentSummary = async ({
  projectId,
}: GetInvestmentIntentSummary): Promise<InvestmentIntentSummary> => {
  const url = new URL(GET_INVESTMENT_INTENT_SUMMARY_URL, window.location.href)
  url.searchParams.set("projectId", projectId)
  const cacheBustStatus = investmentIntentSummaryCacheBust.getCacheBustStatus()
  if (cacheBustStatus && cacheBustStatus === "1") {
    url.searchParams.set("cache-bust", Date.now().toString())
    investmentIntentSummaryCacheBust.removeCacheBustStatus()
  }

  const response = await fetch(url)
  const json = await response.json()

  return json
}
export type PostUserDepositRequest = {
  transaction: string
  projectId: string
}
type AcceptTermsOfUseArgs = AcceptTermsRequest
const postAcceptTermsOfUse = async (args: AcceptTermsOfUseArgs): Promise<void> => {
  const url = new URL(POST_ACCEPT_TERMS_OF_USE_API, window.location.href)

  await failFastFetch(url, {
    body: JSON.stringify(args),
    method: "post",
  })
}
type PostInvestmentIntentArgs = InvestmentIntentRequest
const postInvestmentIntent = async (args: PostInvestmentIntentArgs): Promise<void> => {
  const url = new URL(POST_INVESTMENT_INTENT_API, window.location.href)

  await failFastFetch(url, {
    body: JSON.stringify(args),
    method: "post",
  })
}
type PostReferralArgs = {
  referrerTwitterHandle: string
  projectId: string

  publicKey: string
  message: string
  signature: number[]
}
const postReferral = async (args: PostReferralArgs): Promise<void> => {
  const url = new URL(POST_REFERRAL_API, window.location.href)

  await failFastFetch(url, {
    body: JSON.stringify(args),
    method: "post",
  })
}

const getProject = async ({ projectId }: { projectId: string }): Promise<ProjectModel> => {
  const url = new URL(`${GET_PROJECT_API_URL}/${projectId}`, window.location.href)

  const response = await fetch(url)
  const json = await response.json()
  try {
    const parsedJson = projectSchema.parse(json)
    return parsedJson
  } catch (e) {
    console.error("GET /projects/[id] validation error!")
    throw e
  }
}

const getProjects = async ({
  page,
  limit,
  projectType,
  completionStatus,
  sortBy,
  sortDirection,
  cacheBuster,
}: {
  page: number
  limit: number
  projectType?: ProjectModel["info"]["projectType"]
  completionStatus?: 'completed' | 'active' | 'all'
  sortBy?: 'name' | 'date' | 'raised' | 'fdv' | 'participants' | 'commitments' | 'sector'
  sortDirection?: 'asc' | 'desc'
  cacheBuster?: string // Optional cache busting parameter
}): Promise<GetProjectsResponse> => {
  const url = new URL(GET_PROJECT_API_URL, window.location.href)
  url.searchParams.set("page", page.toString())
  url.searchParams.set("limit", (limit || 10).toString())
  if (projectType) url.searchParams.set("projectType", projectType || "goat")
  if (completionStatus) url.searchParams.set("completionStatus", completionStatus)
  if (sortBy) url.searchParams.set("sortBy", sortBy)
  if (sortDirection) url.searchParams.set("sortDirection", sortDirection)
  if (cacheBuster) url.searchParams.set("_cb", cacheBuster) // Add cache buster if provided

  const response = await fetch(url)
  const json = await response.json()
  return json
}

export type CreateProjectRequest = {
  project: ProjectModel
  adminKey: string
}
const createProject = async ({ project, adminKey }: CreateProjectRequest) => {
  const url = new URL(POST_PROJECT_API_URL, window.location.href)
  const body = JSON.stringify(project)

  const response = await fetch(url, {
    method: "POST",
    body,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminKey}`,
    },
  })
  const json = await response.json()
  if (!response.ok) throw new Error(json.message)
  return json
}
type GetExchangeArgs = {
  baseCurrency: string
  targetCurrency: string
}
const getExchange = async ({ baseCurrency, targetCurrency }: GetExchangeArgs): Promise<GetExchangeResponse> => {
  const url = new URL(GET_EXCHANGE_API_URL, window.location.href)
  url.searchParams.set("baseCurrency", baseCurrency)
  url.searchParams.set("targetCurrency", targetCurrency)

  const response = await fetch(url)
  const json = await response.json()
  return json
}
type GetPresignedUrlArgs = {
  fileName: string
  projectId: string
  adminKey: string
}
const getPresignedUrl = async ({
  fileName,
  projectId,
  adminKey,
}: GetPresignedUrlArgs): Promise<GetPresignedUrlResponse> => {
  const url = new URL(GET_PRESIGNED_URL, window.location.href)
  url.searchParams.set("fileName", fileName)
  url.searchParams.set("projectId", projectId)

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminKey}`,
    },
  })
  const json = await response.json()
  return json
}

type PutFileArgs = {
  presignedUrl: string
  file: File
}
const uploadFileToBucket = async ({ presignedUrl, file }: PutFileArgs): Promise<undefined> => {
  const url = new URL("", presignedUrl)

  await fetch(url, {
    method: "PUT",
    body: file,
    headers: {
      // 'Authorization': `Bearer ${authToken}`,
      "Content-Type": "image/png", // Correct content type for a PNG image
      "Content-Length": file.size.toString(), // Optional but recommended
    },
  })
}

export type PostCreateDepositTxArgs = {
  userWalletAddress: string
  tokenAmount: number
  projectId: string
}
export type PostCreateClaimTxArgs = PostCreateDepositTxArgs

type CreateDepositTxReturnType = {
  transaction: string
}
type CreateClaimTxReturnType = CreateDepositTxReturnType

const postCreateDepositTx = async ({
  userWalletAddress,
  tokenAmount,
  projectId,
}: PostCreateDepositTxArgs): Promise<CreateDepositTxReturnType> => {
  const url = new URL(CREATE_DEPOSIT_TRANSACTION, window.location.href)
  const requestObject = {
    userWalletAddress,
    tokenAmount,
    projectId,
  }
  const request = JSON.stringify(requestObject)
  const response = await fetch(url, {
    method: "POST",
    body: request,
    headers: {
      "Content-Type": "application/json",
    },
  })
  const json = await response.json()
  if (!response.ok) throw new Error(json.message)
  return json
}

const postCreateClaimTx = async ({
  userWalletAddress,
  tokenAmount,
  projectId,
}: PostCreateDepositTxArgs): Promise<CreateClaimTxReturnType> => {
  const url = new URL(CREATE_CLAIM_TRANSACTION, window.location.href)
  const requestObject = {
    userWalletAddress,
    tokenAmount,
    projectId,
  }
  const request = JSON.stringify(requestObject)
  const response = await fetch(url, {
    method: "POST",
    body: request,
    headers: {
      "Content-Type": "application/json",
    },
  })
  const json = await response.json()
  if (!response.ok) throw new Error(json.message)
  return json
}

export type PostSendDepositTransactionArgs = {
  serializedTx: string
  projectId: string
}
export type postSendClaimTransactionArgs = PostSendDepositTransactionArgs

const postSendDepositTransaction = async ({
  serializedTx,
  projectId,
}: PostSendDepositTransactionArgs): Promise<CreateDepositTxReturnType> => {
  const url = new URL(SEND_DEPOSIT_TRANSACTION, window.location.href)
  const requestObject = {
    serializedTx,
    projectId,
  }
  const request = JSON.stringify(requestObject)
  const response = await fetch(url, {
    method: "POST",
    body: request,
    headers: {
      "Content-Type": "application/json",
    },
  })
  const json = await response.json()
  if (!response.ok) throw new Error(json.message)
  return json
}

const postSendClaimTransaction = async ({
  serializedTx,
  projectId,
}: PostSendDepositTransactionArgs): Promise<CreateClaimTxReturnType> => {
  const url = new URL(SEND_CLAIM_TRANSACTION, window.location.href)
  const requestObject = {
    serializedTx,
    projectId,
  }
  const request = JSON.stringify(requestObject)
  const response = await fetch(url, {
    method: "POST",
    body: request,
    headers: {
      "Content-Type": "application/json",
    },
  })
  const json = await response.json()
  if (!response.ok) throw new Error(json.message)
  return json
}

export type PostAfterSaleUpdateArgs = {
  projectId: string
  info: {
    claimUrl: string
    tweetUrl: string
    tokenContractUrl: string
    poolContractUrl: string
  }
  auth: {
    address: string
    message: string
    signature: number[]
  }
}
const postAfterSaleUpdate = async (args: PostAfterSaleUpdateArgs): Promise<void> => {
  const url = new URL(POST_AFTER_SALE_UPDATE, window.location.href)
  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify(args),
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (response.status === 404) throw new Error("Project not found!")
  if (response.status === 401) throw new Error("Unauthorized!")
  if (!response.ok) throw new Error("Project update error!")
}

export type UpdateJsonArgs = {
  projectId: string
  project: ProjectModel
  auth: {
    address: string
    message: string
    signature: number[]
  }
}
const updateJson = async (args: UpdateJsonArgs): Promise<void> => {
  const url = new URL(UPDATE_JSON, window.location.href)
  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify(args),
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (response.status === 404) throw new Error("Project not found!")
  if (response.status === 401) throw new Error("Unauthorized!")
  if (!response.ok) throw new Error("Project update error!")
}

type CreateEmailArgs = CreateEmailRequest
const postCreateEmail = async (args: CreateEmailArgs): Promise<void> => {
  const url = new URL(POST_CREATE_EMAIL, window.location.href)

  await failFastFetch(url, {
    body: JSON.stringify(args),
    method: "post",
  })
}

const getTwitterAuthUrl = async (): Promise<{ twitterAuthUrl: string }> => {
  const url = new URL(GET_TWITTER_AUTH_URL, window.location.href)

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
  })
  const json = await response.json()
  return json
}
const getAnalyst = async ({ analystId }: { analystId: string }): Promise<Analyst> => {
  const url = new URL(`${GET_ANALYST_URL}/${analystId}`, window.location.href)

  const response = await fetch(url)
  const json = await response.json()
  try {
    const parsedJson = analystSchema.parse(json)
    return parsedJson
  } catch (e) {
    console.error("GET /analysts/[id] validation error!")
    throw e
  }
}
const postNewAnalysis = async ({ newAnalysis }: { newAnalysis: NewAnalysisSchemaType }): Promise<Analysis> => {
  const url = new URL(POST_ANALYSIS, window.location.href)
  const request = JSON.stringify(newAnalysis)
  const response = await fetch(url, {
    method: "POST",
    body: request,
    headers: {
      "Content-Type": "application/json",
    },
  })
  const json = await response.json()
  if (!response.ok) throw new Error(json.message)
  return json
}

export type UpdateAnalysisApproval = {
  analysisId: string
  action: "decline" | "approve"
  auth: {
    address: string
    message: string
    signature: number[]
  }
}
const updateAnalysisApproval = async ({ analysisId, ...rest }: UpdateAnalysisApproval): Promise<void> => {
  const url = new URL(`${POST_ANALYSIS}/${analysisId}`, window.location.href)
  const request = JSON.stringify({ isApproved: rest.action === "approve", ...rest })
  const response = await fetch(url, {
    method: "POST",
    body: request,
    headers: {
      "Content-Type": "application/json",
    },
  })
  if (!response.ok) throw new Error("Analysis update error!")
}
export type GetListOfAnalysisRequest = {
  projectId?: string
  isApproved?: boolean
  sortDirection?: AnalysisSortDirection
  sortBy?: AnalysisSortBy
}
const getAnalysisList = async ({
  projectId,
  isApproved,
  sortBy,
  sortDirection,
}: GetListOfAnalysisRequest): Promise<GetListOfAnalysisResponse> => {
  const url = new URL(GET_ANALYSIS_LIST, window.location.href)

  // search params
  projectId && url.searchParams.set("projectId", projectId)
  sortBy && url.searchParams.set("sortBy", sortBy)
  sortDirection && url.searchParams.set("sortDirection", sortDirection)
  if (typeof isApproved === "boolean") {
    url.searchParams.set("isApproved", String(isApproved))
  }

  const response = await fetch(url)
  const json = await response.json()

  return json
}

export const backendApi = {
  getProject,
  getProjects,
  getExchange,
  createProject,
  getPresignedUrl,
  postAcceptTermsOfUse,
  postInvestmentIntent,
  postReferral,
  uploadFileToBucket,
  getEligibilityStatus,
  getInvestmentIntentSummary,
  getDeposits,
  getDepositStatus,
  getMyRewards,
  getSaleResults,
  postCreateDepositTx,
  postSendDepositTransaction,
  postCreateClaimTx,
  postSendClaimTransaction,
  postAfterSaleUpdate,
  updateJson,
  postCreateEmail,
  getTwitterAuthUrl,
  getAnalyst,
  postNewAnalysis,
  getAnalysisList,
  updateAnalysisApproval,
}
