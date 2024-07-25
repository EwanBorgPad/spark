import { jsonResponse, reportError } from "./cfPagesFunctionsUtils"
// @ts-expect-error
import { Rettiwt } from "rettiwt-api"
// require('http')

const borgPadTwitterId = '1791134718131408897' // @borgpadhq // https://x.com/borgpadhq
/**
 * This function should be set up as a cron job, currently an API endpoint
 */
type ENV = {
  RETTIWT_API_KEY: string
  DB: D1Database
}
export const onRequestPost: PagesFunction<ENV> = async (ctx) => {
  const db = ctx.env.DB
  try {
    // do stuff
    const rettiwt = new Rettiwt({ apiKey: ctx.env.RETTIWT_API_KEY })

    let cursor = undefined
    do {
      console.log('Calling api with cursor: ', cursor)
      const res = await rettiwt.user.followers(borgPadTwitterId, 100, cursor)
      const users = res.list

      if (!users.length) {
        console.log('Users list is empty, breaking...')
        break
      }

      // try bulk insert if performance becomes a problem
      for (const user of users) {
        await db
          .prepare('INSERT INTO follower (id, json) VALUES ($1, $2)' +
            ' ON CONFLICT DO NOTHING;')
          .bind(user.id, JSON.stringify(user))
          .run()
      }

      await sleep(200)
      cursor = res.next.value
    } while (cursor)

    return jsonResponse({ message: "Ok!" }, 200)
  } catch (e) {
    await reportError(db, e)
    return jsonResponse({ message: "Something went wrong..." }, 500)
  }
}

const sleep = (ms: number): Promise<void> => new Promise(r => setTimeout(r, ms));
