
const allowedUrl = 'https://api.twitter.com'

export const onRequest: PagesFunction<{}> = async (context) => {
  try {
    const urlParam = new URL(context.request.url).searchParams.get('url')

    if (!urlParam || !urlParam.startsWith(allowedUrl)) {
      return new Response(null, { status: 409 })
    }

    const request = new Request(urlParam, {
      method: context.request.method,
      headers: context.request.headers,
    })

    const response = await fetch(request)

    return response
  } catch (e) {
    console.error(e)
    return new Response(
      JSON.stringify({
        message: "Something went wrong...",
      }),
      { status: 500 },
    )
  }
}
