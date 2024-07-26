import { AwsClient } from "aws4fetch"

type ENV = {
  VITE_BUCKET_ACCOUNT_ID: string
  VITE_BUCKET_NAME: string
}

// can we import env here?
const r2 = new AwsClient({
  accessKeyId: "tokeneaxmple", // client ID
  secretAccessKey: "O4wX5BZ6wpQncQOMFA7dCwDFKXZGte9xgCawagBk", // client secret
})

export const onRequestGet: PagesFunction<ENV> = async (ctx) => {
  // This is just an example to demonstrating using aws4fetch to generate a presigned URL.
  // This Worker should not be used as-is as it does not authenticate the request, meaning
  // that anyone can upload to your bucket.
  //
  // Consider implementing authorization, such as a preshared secret in a request header.
  const url = ctx.request.url

  // const  = new URL(url).searchParams.get("")

  const requestPath = new URL(url).pathname

  // Cannot upload to the root of a bucket
  if (requestPath === "/") {
    return new Response("Missing a filepath", { status: 400 })
  }

  const bucketName = ctx.env.VITE_BUCKET_NAME
  const accountId = ctx.env.VITE_BUCKET_ACCOUNT_ID

  const uploadUrl = new URL(
    `https://${accountId}.r2.cloudflarestorage.com/${bucketName}/${}`,
    //   `https://${bucketName}.${accountId}.r2.cloudflarestorage.com`//suggested in docs
  )

  // preserve the original path
  uploadUrl.pathname = requestPath

  // Specify a custom expiry for the presigned URL, in seconds
  uploadUrl.searchParams.set("X-Amz-Expires", "3600")

  const signed = await r2.sign(
    new Request(url, {
      method: "PUT",
    }),
    {
      aws: { signQuery: true },
    },
  )

  // Caller can now use this URL to upload to that object.
  return new Response(signed.url, { status: 200 })
}
