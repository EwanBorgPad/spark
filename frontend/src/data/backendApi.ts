import {
  GetWhitelistingResult,
  ProjectModel,
  projectSchema,
} from "../../shared/models.ts"

// const API_BASE_URL = 'https://feat-projects-connect-client.borgpad.pages.dev/api'
const API_BASE_URL = "/api"
const GET_WHITELISTING_STATUS_API = API_BASE_URL + "/whitelisting"
const POST_CONFIRM_RESIDENCY_URL = API_BASE_URL + "/confirmresidency"
const GET_PROJECT_API_URL = API_BASE_URL + "/projects" // + '?id=id'

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

export const backendApi = {
  getWhitelistingStatus,
  confirmResidency,
  getProject,
}
