# Cloudflare Workers

## Edge computing

[CloudFlare Workers](https://developers.cloudflare.com/workers/) are an example of [Edge Computing](https://en.wikipedia.org/wiki/Edge_computing), similar to:
- [Vercel Functions](https://vercel.com/docs/functions)
- [AWS Lambda@Edge](https://aws.amazon.com/lambda/edge/#Dynamic_Web_Application_at_the_Edge)

Features:
- Edge network
- No region selection

Much like a CDN caching static files to optimize content delivery, Edge Computing enables us to position servers closer to our users, enhancing performance and reducing latency.

## Limitations with Cloudflare Workers

- Serverless instead of serverful (like heroku) - this affects our whole infrastructure, forcing us to write cloud-specific code (we can't write usual server code).
    - Here's an example of how an api is handled https://developers.cloudflare.com/workers/runtime-apis/request/
    - Harder to test locally
    - More suitable for stateless applications (apps not storing data)
- CloudFlare Workers would force us to change architecture — it has significant limitations compared to the traditional servers regarding the runtime:
    - No Node.js compatibility — Node.js runtime is only partially supported https://developers.cloudflare.com/workers/runtime-apis/nodejs/
    - Deployment size limited to 1MB/10MB (Heroku's limit is 500MB), meaning we must carefully choose what libraries we use — the starter project artifact already exceeds 1MB, meaning this will be a challenge (https://developers.cloudflare.com/workers/platform/limits/)

# Advantages

- Pricing - serverless is generally much cheaper than traditional servers if used correctly
- Edge deployments - execute server code closer to our users

## Our case (content caching)

Even though we may centralize the server, we can still use CloudFlare CDN for the frontend, which is where most performance gain will come after all. This means consumers will get to the website fast, but may wait a little bit (~500ms) for the server response — this shouldn’t be too noticeble as I don’t imagine we’re going to use the server a lot, and we’re going to utilize the chain more this time, which is decentralized by design.

## Resources:

- [YouTube: Is "edge" computing really faster?](https://www.youtube.com/watch?v=yOP5-3_WFus)
- [Cloudflare wiki](https://en.wikipedia.org/wiki/Cloudflare)
- [Eliminating cold starts with Cloudflare Workers](https://blog.cloudflare.com/eliminating-cold-starts-with-cloudflare-workers)
- 
