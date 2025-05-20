import {

} from "../../../shared/models.ts"


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? `${window.location.origin}/api`

const POST_CREATE_USER = API_BASE_URL + "/user"

type PostCreateUserStatusArgs = {
  address: string
  email: string
  username: string
}
const postCreateUserStatus = async ({ address, email, username }: PostCreateUserStatusArgs): Promise<boolean> => {
  const url = new URL(POST_CREATE_USER, window.location.href)
  const body = JSON.stringify({
    address,
    email,
    username,
  })

  const response = await fetch(url, {
    method: "POST",
    body,
    headers: {
      "Content-Type": "application/json",
    },
  })
  const json = await response.json()
  if (!response.ok) throw new Error(json.message)
  return json
}


export const backendSparkApi = {
  postCreateUserStatus,
}
