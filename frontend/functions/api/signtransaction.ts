import { jsonResponse } from "./cfPagesFunctionsUtils"

type ENV = {
  DB: D1Database
}
export const onRequestPost: PagesFunction<ENV> = async (ctx) => {
  try {
    // do stuff

    return jsonResponse({ message: "Ok!" }, 200)
  } catch (e) {
    console.error(e)
    return jsonResponse({ message: "Something went wrong..." }, 500)
  }
}
