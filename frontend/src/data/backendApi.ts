import {
  GetExchangeResponse,
  GetWhitelistingResult,
  ProjectModel,
  projectSchema,
} from "../../shared/models.ts"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api"
const GET_WHITELISTING_STATUS_API = API_BASE_URL + "/whitelisting"
const POST_CONFIRM_RESIDENCY_URL = API_BASE_URL + "/confirmresidency"
const GET_PROJECT_API_URL = API_BASE_URL + "/projects" // + '?id=id'
const POST_PROJECT_API_URL = API_BASE_URL + "/projects"
const GET_EXCHANGE_API_URL = API_BASE_URL + "/exchange"

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

export type CreateProjectRequest = {
  formValues: ProjectModel
  adminKey: string
}
const createProject = async ({
  formValues,
  adminKey,
}: CreateProjectRequest) => {
  const url = new URL(POST_PROJECT_API_URL, window.location.href)
  const body = JSON.stringify(formValues)

  try {
    const response = await fetch(url, {
      method: "POST",
      body,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminKey}`,
      },
    })
    const json = await response.json()
    const parsedJson = JSON.parse(json)
    return parsedJson
  } catch (e) {
    console.error(e)
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
export const backendApi = {
  getWhitelistingStatus,
  confirmResidency,
  getProject,
  getExchange,
  createProject,
}
