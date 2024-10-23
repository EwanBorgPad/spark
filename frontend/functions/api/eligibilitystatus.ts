import { jsonResponse } from "./cfPagesFunctionsUtils"

type ENV = {
  // DB: D1Database
}
const onRequestGet: PagesFunction<ENV> = async (ctx) => {
  // TODO @eligibility
  // load user from db
  // load project from db
  // check compliances
  // check all tiers/quests
  // decide which tier the user is

  try {
    return jsonResponse({
      compliances: [
        {
          type: 'COUNTRY_OF_RESIDENCE',
          isCompleted: true,
        },
        {
          type: 'ACCEPT_TERMS_OF_USE',
          isCompleted: false,
        },
        {
          type: 'PROVIDE_INVESTMENT_INTENT',
          isCompleted: false,
        }
      ],
      tiers: [
        {
          id: 'tier1',
          label: 'Tier1',
          isCompleted: true,
          quests: [
            {
              type: 'FOLLOW_ON_TWITTER',
              twitterHandle: '@borgpadhq',
              twitterLabel: 'BorgPad',
              isCompleted: true,
            },
            {
              type: 'HOLD_TOKEN',
              tokenName: 'BORG',
              tokenAmount: '10000',
              isCompleted: true,
            }
          ]
        },
        {
          id: 'tier2',
          label: 'Tier2',
          isCompleted: false,
          quests: [
            {
              type: 'HOLD_TOKEN',
              tokenName: 'BORG',
              tokenAmount: '20000',
              isCompleted: false,
            },
          ],
        },
      ],
    }, 200)
  } catch (e) {
    console.error(e)
    return jsonResponse({ message: "Something went wrong..." }, 500)
  }
}
