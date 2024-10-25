import {
  AcceptTermsRequest,
  GetExchangeResponse,
  GetPresignedUrlResponse,
  GetProjectsResponse,
  GetWhitelistingResult, InvestmentIntentRequest,
  ProjectModel,
  projectSchema,
} from "../../shared/models.ts"
import { EligibilityStatus } from "../../shared/eligibilityModel.ts"
import { z } from "zod"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api"
const GET_WHITELISTING_STATUS_API = API_BASE_URL + "/whitelisting"
const GET_ELIGIBILITY_STATUS_API = API_BASE_URL + "/eligibilitystatus"
const POST_ACCEPT_TERMS_OF_USE_API = API_BASE_URL + "/acceptterms"
const POST_INVESTMENT_INTENT_API = API_BASE_URL + "/investmentintent"
const GET_PROJECT_API_URL = API_BASE_URL + "/projects" // + '?id=id'
const POST_PROJECT_API_URL = API_BASE_URL + "/projects"
const GET_EXCHANGE_API_URL = API_BASE_URL + "/exchange"
const GET_PRESIGNED_URL = API_BASE_URL + "/presignedurl"

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
const getWhitelistingStatus = async ({ address }: { address: string }) => {
  const url = new URL(GET_WHITELISTING_STATUS_API, window.location.href)
  url.searchParams.set("address", address)

  const response = await fetch(url)
  const result = (await response.json()) as GetWhitelistingResult

  return result
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
  // try {
  // } catch (e) {
  //   console.error("GET /projects validation error!")
  //   throw e
  // }
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

export const backendApi = {
  getProject,
  getProjects,
  getExchange,
  createProject,
  getPresignedUrl,
  postAcceptTermsOfUse,
  postInvestmentIntent,
  uploadFileToBucket,
  getWhitelistingStatus,
  getEligibilityStatus,
}
