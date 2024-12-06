import {
  AcceptTermsRequest,
  GetExchangeResponse,
  GetPresignedUrlResponse,
  GetProjectsResponse,
  InvestmentIntentRequest, InvestmentIntentSummary,
  ProjectModel,
  projectSchema,
} from "../../shared/models.ts"
import { EligibilityStatus } from "../../shared/eligibilityModel.ts"

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
export const BACKEND_RPC_URL = API_BASE_URL + "/rpcproxy"
const CREATE_DEPOSIT_TRANSACTION = API_BASE_URL + "/createdeposittransaction"
const CREATE_CLAIM_TRANSACTION = API_BASE_URL + "/createclaimtransaction"
const SEND_DEPOSIT_TRANSACTION = API_BASE_URL + "/senddeposittransaction"
const SEND_CLAIM_TRANSACTION = API_BASE_URL + "/sendclaimtransaction"

type GetEligibilityStatusArgs = {
  address: string
  projectId: string
}
const getEligibilityStatus = async ({ address, projectId, }: GetEligibilityStatusArgs): Promise<EligibilityStatus> => {
  const url = new URL(GET_ELIGIBILITY_STATUS_API, window.location.href)
  url.searchParams.set("address", address)
  url.searchParams.set("projectId", projectId)

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
}
const getDeposits = async ({ address, projectId, }: GetDepositsRequest): Promise<GetDepositsResponse> => {
  const url = new URL(GET_DEPOSITS_URL, window.location.href)
  url.searchParams.set("address", address)
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

  const response = await fetch(url)
  const json = await response.json()

  return json
}
export type PostUserDepositRequest = {
  transaction: string,
  projectId: string
}
type AcceptTermsOfUseArgs = AcceptTermsRequest
const postAcceptTermsOfUse = async (args: AcceptTermsOfUseArgs) => {
  const url = new URL(POST_ACCEPT_TERMS_OF_USE_API, window.location.href)

  await fetch(url, {
    body: JSON.stringify(args),
    method: "post",
  })
}
type PostInvestmentIntentArgs = InvestmentIntentRequest
const postInvestmentIntent = async (args: PostInvestmentIntentArgs) => {
  const url = new URL(POST_INVESTMENT_INTENT_API, window.location.href)

  await fetch(url, {
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
const postReferral = async (args: PostReferralArgs) => {
  const url = new URL(POST_REFERRAL_API, window.location.href)

  await fetch(url, {
    body: JSON.stringify(args),
    method: "post",
  })
}

const getProject = async ({
  projectId,
}: {
  projectId: string
}): Promise<ProjectModel> => {
  const url = new URL(
    `${GET_PROJECT_API_URL}/${projectId}`,
    window.location.href,
  )

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
}: {
  page: number
  limit: number
}): Promise<GetProjectsResponse> => {
  const url = new URL(GET_PROJECT_API_URL, window.location.href)
  url.searchParams.set("page", page.toString())
  url.searchParams.set("limit", (limit || 10).toString())

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
const getExchange = async ({
  baseCurrency,
  targetCurrency,
}: GetExchangeArgs): Promise<GetExchangeResponse> => {
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
const uploadFileToBucket = async ({
  presignedUrl,
  file,
}: PutFileArgs): Promise<undefined> => {
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

const postUserDeposit = async ({
  projectId, transaction
}: PostUserDepositRequest): Promise<any> => {
  const url = new URL(USER_DEPOSIT_URL, window.location.href)
  const requestObject = {
    projectId,
    transaction
  }
  const request = JSON.stringify(requestObject)
  const response = await fetch(url, {
    method: "POST",
    body: request,
    headers: {
      "Content-Type": "application/json",
    }
  })
  const json = await response.json()
  if (!response.ok) throw new Error(json.message)
  return json
}

export type PostCreateDepositTxArgs = {
  userWalletAddress: string,
  tokenAmount: number,
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
  projectId
}: PostCreateDepositTxArgs): Promise<CreateDepositTxReturnType> => {
  const url = new URL(CREATE_DEPOSIT_TRANSACTION, window.location.href)
  const requestObject = {
    userWalletAddress,
    tokenAmount,
    projectId
  }
  const request = JSON.stringify(requestObject)
  const response = await fetch(url, {
    method: 'POST',
    body: request,
    headers: {
      "Content-Type": "application/json",
    }
  })
  const json = await response.json()
  if (!response.ok) throw new Error(json.message)
  return json
}

const postCreateClaimTx = async ({
  userWalletAddress,
  tokenAmount,
  projectId
}: PostCreateDepositTxArgs): Promise<CreateClaimTxReturnType> => {
  const url = new URL(CREATE_CLAIM_TRANSACTION, window.location.href)
  const requestObject = {
    userWalletAddress,
    tokenAmount,
    projectId
  }
  const request = JSON.stringify(requestObject)
  const response = await fetch(url, {
    method: 'POST',
    body: request,
    headers: {
      "Content-Type": "application/json",
    }
  })
  const json = await response.json()
  if (!response.ok) throw new Error(json.message)
  return json
}

export type PostSendDepositTransactionArgs = {
  serializedTx: string,
  projectId: string
}
export type postSendClaimTransactionArgs = PostSendDepositTransactionArgs

const postSendDepositTransaction = async ({
  serializedTx,
  projectId
}: PostSendDepositTransactionArgs): Promise<CreateDepositTxReturnType> => {
  const url = new URL(SEND_DEPOSIT_TRANSACTION, window.location.href)
  const requestObject = {
    serializedTx,
    projectId
  }
  const request = JSON.stringify(requestObject)
  const response = await fetch(url, {
    method: 'POST',
    body: request,
    headers: {
      "Content-Type": "application/json",
    }
  })
  const json = await response.json()
  if (!response.ok) throw new Error(json.message)
  return json
}

const postSendClaimTransaction = async ({
  serializedTx,
  projectId
}: PostSendDepositTransactionArgs): Promise<CreateClaimTxReturnType> => {
  const url = new URL(SEND_CLAIM_TRANSACTION, window.location.href)
  const requestObject = {
    serializedTx,
    projectId
  }
  const request = JSON.stringify(requestObject)
  const response = await fetch(url, {
    method: 'POST',
    body: request,
    headers: {
      "Content-Type": "application/json",
    }
  })
  const json = await response.json()
  if (!response.ok) throw new Error(json.message)
  return json
}



export const backendApi = {
  postUserDeposit,
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
  postCreateDepositTx,
  postSendDepositTransaction,
  postCreateClaimTx,
  postSendClaimTransaction
}
