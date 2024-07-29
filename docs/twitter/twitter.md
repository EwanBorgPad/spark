
# Twitter Followers Scraping

## Intro

As Twitter doesn't allow fetching followers with their free developer plan, we sought other solutions.  

[Rettiwt](https://github.com/Rishikant181/Rettiwt-API) seemed like a perfect solution, however the problem is that we're developing our app on CloudFlare Workers where the lib cannot work because of its reliance on NodeJS core APIs, for which the Workers do not have the full compatibility for. [Read more](https://developers.cloudflare.com/workers/runtime-apis/nodejs/).  

An [issue](https://github.com/Rishikant181/Rettiwt-API/issues/572) for this has been raised on GitHub.

Since we cannot fix this quickly, can't install the lib on CF Workers, we can reimplement the libs functionalities we're interested in.  

## Implementation

The functionality is implemented manually (no lib) using `fetch` to pull data from Twitter's internal APIs.

To authorize to the API we need three things (three headers):
- Authorization - bearer token
- Cookies
- x-csrf-token

The procedure to get those is the following: 
- Install Rettiwt lib `npm install -g rettiwt-api`
- Execute `rettiwt auth login "<email>" "<username>" "<password>"` to get api key
- run the script `NODE_DEBUG=http,https node scripts/rettiwt.mjs` with the api key to inspect network values
- extract Authorization, Cookie, and X-CSRF-Token headers' values
