import { GetUserInvestmentsResponse } from "../../shared/types/user-types"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? `${window.location.origin}/api`
const GET_USER_INVESTMENTS = API_BASE_URL + "/user/allinvestments"

type GetUsersInvestmentsReq = {
  address: string
}
const getUsersInvestments = async ({ address }: GetUsersInvestmentsReq): Promise<GetUserInvestmentsResponse> => {
  const url = new URL(GET_USER_INVESTMENTS, window.location.href)
  url.searchParams.set("address", address)

  const response = await fetch(url)
  if (!response.ok) throw new Error("FE: Response error!")
  const json = (await response.json()) as GetUserInvestmentsResponse

  return json
}

export const userApi = {
  getUsersInvestments,
}
