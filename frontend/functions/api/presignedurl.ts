import { AwsClient } from "aws4fetch"

type ENV = {
  R2_BUCKET_ACCOUNT_ID: string
  R2_BUCKET_NAME: string
  R2_ACCESS_KEY_ID: string
  R2_SECRET_ACCESS_KEY: string
  R2_PUBLIC_URL_BASE_PATH: string
}

export const onRequestGet: PagesFunction<ENV> = async (ctx) => {
  // This is just an example to demonstrating using aws4fetch to generate a presigned URL.
  // This Worker should not be used as-is as it does not authenticate the request, meaning
  // that anyone can upload to your bucket.
  //
  // Consider implementing authorization, such as a preshared secret in a request header.
  const pathUrl = ctx.request.url

  const fileName = new URL(pathUrl).searchParams.get("fileName")
  const projectId = new URL(pathUrl).searchParams.get("projectId")

  // const requestPathname = new URL(pathUrl).pathname
  // Cannot upload to the root of a bucket
  if (!fileName || !projectId) {
    return new Response("Missing a filepath", { status: 400 })
  }

  const bucketName = ctx.env.R2_BUCKET_NAME
  const accountId = ctx.env.R2_BUCKET_ACCOUNT_ID

  const url = new URL(`https://${accountId}.r2.cloudflarestorage.com`)

  url.pathname = `${bucketName}/images/${projectId}/${fileName}`

  // Specify a custom expiry for the presigned URL, in seconds
  url.searchParams.set("X-Amz-Expires", "3600")

  const r2 = new AwsClient({
    accessKeyId: ctx.env.R2_ACCESS_KEY_ID, // client ID
    secretAccessKey: ctx.env.R2_SECRET_ACCESS_KEY, // client secret
  })
  const signed = await r2.sign(
    new Request(url, {
      method: "PUT",
    }),
    {
      aws: { signQuery: true },
    },
  )

  // cloudflare doesn't return public URL when file is uploaded so we will construct it here
  const publicUrl = new URL(`${ctx.env.R2_PUBLIC_URL_BASE_PATH}`)
  publicUrl.pathname = `images/${projectId}/${fileName}`

  // Caller can now use this URL to upload to that object.
  return new Response(
    JSON.stringify({ signedUrl: signed.url, publicUrl: publicUrl.href }),
    {
      status: 200,
    },
  )
}
