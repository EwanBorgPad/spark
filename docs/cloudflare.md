
# Cloudflare

## Cloudflare Pages

Cloudflare Pages offers developers free hosting for static websites and web applications, integrating seamlessly with popular Git repositories like GitHub, GitLab, and Bitbucket.

### Preview deployments

Preview deployments allow you to preview new versions of your project without deploying it to production.

Every time you open a new pull request on your GitHub repository, Cloudflare Pages will create a unique preview URL, which will stay updated as you continue to push new commits to the branch. This is only true when pull requests originate from the repository itself.

- [Preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/)
- [Control access to your project's Preview deployments with Cloudflare Access](https://www.cloudflare.com/en-gb/zero-trust/products/access/)

### Staging setup

- [Add a custom domain to a branch](https://developers.cloudflare.com/pages/how-to/custom-branch-aliases/)
- [How to create staging environment on Cloudflare Pages](https://dev.to/phanect/how-to-create-staging-environment-on-cloudflare-pages-7ha)

### Other

- [Announcing Pages support for monorepos, wrangler.toml, database integrations and more!](https://blog.cloudflare.com/pages-workers-integrations-monorepos-nextjs-wrangler)
- [Download existing project configuration](https://developers.cloudflare.com/pages/functions/wrangler-configuration/#projects-without-existing-wranglertoml-file)
- [Build watch paths](https://developers.cloudflare.com/pages/configuration/build-watch-paths/#:~:text=To%20configure%20which%20paths%20are,paths%20to%20nothing%20(%20%5B%5D%20).)
- [TypeScript Configuration](https://developers.cloudflare.com/pages/functions/typescript/)

### Commands

- `npx wrangler pages --help`
- `npx wrangler pages dev` - start local server
- `npx wrangler pages dev --local-protocol=https` - start local https server
- `npx wrangler pages project list` - list projects
- `npx wrangler pages deployment list` - list deployments

## Cloudflare Workers

[CloudFlare Workers](https://developers.cloudflare.com/workers/) are an example of [Edge Computing](https://en.wikipedia.org/wiki/Edge_computing), similar to:
- [Vercel Functions](https://vercel.com/docs/functions)
- [AWS Lambda@Edge](https://aws.amazon.com/lambda/edge/#Dynamic_Web_Application_at_the_Edge)

Features:
- Edge network
- No region selection

Much like a CDN caching static files to optimize content delivery, Edge Computing enables us to position servers closer to our users, enhancing performance and reducing latency.

### Workers architecture

- [Eliminating cold starts with Cloudflare Workers](https://blog.cloudflare.com/eliminating-cold-starts-with-cloudflare-workers)
- [Cloud Computing without Containers](https://blog.cloudflare.com/cloud-computing-without-containers/)

### Resources

- [YouTube: Is "edge" computing really faster?](https://www.youtube.com/watch?v=yOP5-3_WFus)
- [Cloudflare wiki](https://en.wikipedia.org/wiki/Cloudflare)
- [Create Cloudflare CLI](https://developers.cloudflare.com/pages/get-started/c3)
- [wrangler.toml](https://developers.cloudflare.com/workers/wrangler/configuration/)
- [D1 Get started](https://developers.cloudflare.com/d1/get-started/)
- [Using Cloudflare workers as your only backend](https://www.youtube.com/watch?v=1tM_d3CH0N0)
- [Monorepos](https://developers.cloudflare.com/pages/configuration/monorepos/)
- [Reddit: Vercel vs Cloudflare Pages/Workers](https://www.reddit.com/r/nextjs/comments/s3ec29/vercel_vs_cloudflare_pages_workers/)
- [Compatibility Flags](https://developers.cloudflare.com/workers/configuration/compatibility-dates/#compatibility-flags)

## Other Cloudflare services

- [Cloudflare Image Optimization](https://developers.cloudflare.com/images/)

