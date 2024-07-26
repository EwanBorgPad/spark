import {
  GetExchangeResponse,
  GetPresignedUrlResponse,
  GetWhitelistingResult,
  ProjectModel,
  projectSchema,
} from "../../shared/models.ts"

// const base_url = import.meta.env.VITE_API_BASE_URL ?? "/api"
const base_url = "http://localhost:8788/api"
const GET_WHITELISTING_STATUS_API = base_url + "/whitelisting"
const POST_CONFIRM_RESIDENCY_URL = base_url + "/confirmresidency"
const GET_PROJECT_API_URL = base_url + "/projects" // + '?id=id'
const GET_EXCHANGE_API_URL = base_url + "/exchange"
const GET_PRESIGNED_URL = base_url + "/presignedurl"

const getWhitelistingStatus = async ({ address }: { address: string }) => {
  const url = new URL(GET_WHITELISTING_STATUS_API, window.location.href)
  url.searchParams.set("address", address)

  const response = await fetch(url)
  const result = (await response.json()) as GetWhitelistingResult

  return result
}

const confirmResidency = async ({ address }: { address: string }) => {
  const url = new URL(POST_CONFIRM_RESIDENCY_URL, window.location.href)
  url.searchParams.set("address", address)

  await fetch(url, { method: "post" })
}

const getProject = async ({
  projectId,
}: {
  projectId: string
}): Promise<ProjectModel> => {
  const url = new URL(GET_PROJECT_API_URL, window.location.href)
  url.searchParams.set("id", projectId)

  const response = await fetch(url)
  const json = await response.json()
  try {
    const parsedJson = projectSchema.parse(json)
    return parsedJson
  } catch (e) {
    console.error("GET /projects validation error!")
    throw e
  }
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
}
const getPresignedUrl = async ({
  fileName,
}: GetPresignedUrlArgs): Promise<GetPresignedUrlResponse> => {
  const url = new URL(GET_PRESIGNED_URL, window.location.href)
  url.searchParams.set("fileName", fileName)

  const response = await fetch(url)
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
}: PutFileArgs): Promise<unknown> => {
  const url = new URL("", presignedUrl)
  console.log(url, presignedUrl)

  const response = await fetch(url, { method: "PUT", body: file })
  const json = await response.json()
  return json
}

export const backendApi = {
  getWhitelistingStatus,
  confirmResidency,
  getProject,
  getExchange,
  getPresignedUrl,
  uploadFileToBucket,
}
