import { hasAdminAccess, jsonResponse, reportError } from "./cfPagesFunctionsUtils"

const borgPadTwitterId = '1791134718131408897' // @borgpadhq // https://x.com/borgpadhq
/**
 * This function should be set up as a cron job, currently an API endpoint
 */
type ENV = {
  DB: D1Database
  RETTIWT_API_KEY: string
  TWITTER_AUTH_BEARER: string
  TWITTER_AUTH_COOKIE: string
  TWITTER_AUTH_X_CSRF_TOKEN: string
  ADMIN_API_KEY_HASH: string
}
export const onRequestPost: PagesFunction<ENV> = async (ctx) => {
  const env = ctx.env
  const db = ctx.env.DB
  try {
    // check env variables
    if (!env.TWITTER_AUTH_BEARER || !env.TWITTER_AUTH_COOKIE || !env.TWITTER_AUTH_X_CSRF_TOKEN) {
      throw new Error('Twitter auth misconfigured!')
    }

    if (!env.ADMIN_API_KEY_HASH) {
      throw new Error('Env variables misconfigured!')
    }

    // authorize request
    if (!hasAdminAccess(ctx)) {
      return jsonResponse(null, 401)
    }

    // do stuff
    let cursor = undefined
    let subrequestCounter = 0
    do {
      console.log(`Calling API: cursor=${cursor}, subrequestCounter=${subrequestCounter}, now=${new Date().toISOString()}`)
      const res = await getFollowersForAccount(env, borgPadTwitterId, cursor)
      const users = res.list

      //// api may return zero users sometimes, maybe it's better to check for cursor
      // if (!users.length) {
      //   console.log('Users list is empty, finished.')
      //   break
      // }
      if (res.cursor.startsWith('0|')) {
        console.log('Detected end cursor, finished.')
        break
      }

      if (!users.length) {
        continue
      }

      // bulk insert
      const placeholders = []
      const values = []
      let index = 1
      for (const user of users) {
        placeholders.push(`($${index}, $${index + 1})`)
        values.push(user.id, JSON.stringify(user))
        index += 2
      }

      const query = `
        INSERT INTO follower (id, json)
        VALUES ${placeholders.join(', ')}
        ON CONFLICT DO NOTHING;
      `;

      await db.prepare(query).bind(...values).run()

      const sleepTime = getRandomNumber()
      await sleep(sleepTime)
      cursor = res.cursor

      subrequestCounter += 1
    } while (cursor)

    return jsonResponse({ message: "Ok!" }, 200)
  } catch (e) {
    await reportError(db, e)
    return jsonResponse({ message: "Something went wrong..." }, 500)
  }
}

async function getFollowersForAccount(env: ENV, id: string, cursor?: string): Promise<GetFollowersResult> {
  const variables = encodeURIComponent(JSON.stringify({
    userId: id,
    count: 100,
    includePromotedContent: false,
    cursor,
  }))
  const features = '%7B%22rweb_lists_timeline_redesign_enabled%22%3Atrue%2C%22responsive_web_graphql_exclude_directive_enabled%22%3Atrue%2C%22verified_phone_label_enabled%22%3Atrue%2C%22creator_subscriptions_tweet_preview_api_enabled%22%3Atrue%2C%22responsive_web_graphql_timeline_navigation_enabled%22%3Atrue%2C%22responsive_web_graphql_skip_user_profile_image_extensions_enabled%22%3Afalse%2C%22tweetypie_unmention_optimization_enabled%22%3Atrue%2C%22responsive_web_edit_tweet_api_enabled%22%3Atrue%2C%22graphql_is_translatable_rweb_tweet_is_translatable_enabled%22%3Atrue%2C%22view_counts_everywhere_api_enabled%22%3Atrue%2C%22longform_notetweets_consumption_enabled%22%3Atrue%2C%22responsive_web_twitter_article_tweet_consumption_enabled%22%3Afalse%2C%22tweet_awards_web_tipping_enabled%22%3Afalse%2C%22freedom_of_speech_not_reach_fetch_enabled%22%3Atrue%2C%22standardized_nudges_misinfo%22%3Atrue%2C%22tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled%22%3Atrue%2C%22longform_notetweets_rich_text_read_enabled%22%3Atrue%2C%22longform_notetweets_inline_media_enabled%22%3Atrue%2C%22responsive_web_media_download_video_enabled%22%3Afalse%2C%22responsive_web_enhance_cards_enabled%22%3Afalse%7D'
  const url = `https://x.com/i/api/graphql/6y5TB_HrwQM0FBGDiNfoEA/Followers?variables=${variables}&features=${features}`
  // const url = 'https://x.com/i/api/graphql/6y5TB_HrwQM0FBGDiNfoEA/Followers?variables=%7B%22userId%22%3A%221791134718131408897%22%2C%22count%22%3A100%2C%22includePromotedContent%22%3Afalse%7D&features=%7B%22rweb_lists_timeline_redesign_enabled%22%3Atrue%2C%22responsive_web_graphql_exclude_directive_enabled%22%3Atrue%2C%22verified_phone_label_enabled%22%3Atrue%2C%22creator_subscriptions_tweet_preview_api_enabled%22%3Atrue%2C%22responsive_web_graphql_timeline_navigation_enabled%22%3Atrue%2C%22responsive_web_graphql_skip_user_profile_image_extensions_enabled%22%3Afalse%2C%22tweetypie_unmention_optimization_enabled%22%3Atrue%2C%22responsive_web_edit_tweet_api_enabled%22%3Atrue%2C%22graphql_is_translatable_rweb_tweet_is_translatable_enabled%22%3Atrue%2C%22view_counts_everywhere_api_enabled%22%3Atrue%2C%22longform_notetweets_consumption_enabled%22%3Atrue%2C%22responsive_web_twitter_article_tweet_consumption_enabled%22%3Afalse%2C%22tweet_awards_web_tipping_enabled%22%3Afalse%2C%22freedom_of_speech_not_reach_fetch_enabled%22%3Atrue%2C%22standardized_nudges_misinfo%22%3Atrue%2C%22tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled%22%3Atrue%2C%22longform_notetweets_rich_text_read_enabled%22%3Atrue%2C%22longform_notetweets_inline_media_enabled%22%3Atrue%2C%22responsive_web_media_download_video_enabled%22%3Afalse%2C%22responsive_web_enhance_cards_enabled%22%3Afalse%7D'

  const response = await fetch(url, {
    headers: {
      'Authorization': 'Bearer ' + env.TWITTER_AUTH_BEARER,
      'Cookie': env.TWITTER_AUTH_COOKIE,
      'X-CSRF-Token': env.TWITTER_AUTH_X_CSRF_TOKEN,
    }
  })

  if (!response.ok) {
    const message = `Twitter scraping error! Status code=${response.status}`
    throw new Error(message)
  }

  const json = await response.json()
  // TimelineAddEntries is where the response actually is (users + pagination cursor)
  const timeline = (json as any).data.user.result.timeline.timeline.instructions
    .find(entry => entry.type === 'TimelineAddEntries')
  const topCursor = timeline.entries.find(entry => entry?.content?.cursorType === 'Top').content.value
  const bottomCursor = timeline.entries.find(entry => entry?.content?.cursorType === 'Bottom').content.value
  const users = timeline
    .entries
    .filter(entry => Boolean(entry.content?.itemContent?.user_results))
    .map(entry => entry.content.itemContent.user_results.result)
    .map(user => ({
      id: user.rest_id,
      name: user.legacy?.name ?? null,
      screenName: user.legacy?.screen_name ?? null,
      createdAt: user.legacy?.created_at ?? null,
    }))

  //// rate limit check
  const rateLimitHeaders = {
    xRateLimitLimit: response.headers.get('x-rate-limit-limit'),
    xRateLimitReset: response.headers.get('x-rate-limit-reset'),
    xRateLimitRemaining: response.headers.get('x-rate-limit-remaining'),
  }
  console.log({ rateLimitHeaders })
  console.log({ topCursor, bottomCursor, usersCount: users?.length })

  // if the rate limit is reached, sleep until the reset, then return
  if (Number(rateLimitHeaders.xRateLimitRemaining) === 0) {
    const rateLimitResetEpochMs = Number(rateLimitHeaders.xRateLimitReset) * 1000
    const nowEpochMs = Date.now()
    const deltaMs = (rateLimitResetEpochMs - nowEpochMs) + 10_000 // add 10s just in case
    console.log(`Rate limit reached! Sleeping for ${deltaMs}ms (from ${new Date(nowEpochMs).toISOString()} until ${(new Date(rateLimitResetEpochMs)).toISOString()} UTC).`)
    await sleep(deltaMs)
  }

  return {
    list: users,
    cursor: bottomCursor,
  }
}

const sleep = (ms: number): Promise<void> => new Promise(r => setTimeout(r, ms))

function getRandomNumber(min = 500, max = 1500) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

type TwitterUser = {
  id: string
  [others: string]: unknown
}
type GetFollowersResult = {
  list: TwitterUser[]
  cursor: string
}
