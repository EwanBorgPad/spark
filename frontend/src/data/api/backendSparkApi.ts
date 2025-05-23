import {
  CreateUsernameRequestSchema, // Make sure this schema is correctly imported
  GetTokensResponse
} from "../../../shared/models.ts"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `${window.location.origin}/api`

const POST_CREATE_USER = API_BASE_URL + "/user"
const GET_USER = API_BASE_URL + "/user"
const GET_TOKENS = API_BASE_URL + "/tokens"
const CREATE_DAO = API_BASE_URL + "/createdao"

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

type CreateDaoArgs = {
  tokenName: string
  tokenSymbol: string
  tokenAddress: string
}

const createDao = async ({ tokenName, tokenSymbol, tokenAddress }: CreateDaoArgs): Promise<boolean> => {
  const url = new URL(CREATE_DAO)
  const response = await fetch(url, {
    method: "POST",
    // body: JSON.stringify({ tokenName, tokenSymbol, tokenAddress }),
  })
  const json = await response.json()
  return json
}


export const backendSparkApi = {
  postCreateUserStatus,
  getUser,
  getTokens,
  createDao,
}