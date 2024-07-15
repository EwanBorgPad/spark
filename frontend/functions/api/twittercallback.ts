

export const onRequest: PagesFunction<{}> = async (context) => {
  try {
    const code = new URL(context.request.url).searchParams.get('code')

    console.log({ code })

    return new Response(null, {
      status: 302,
      headers: {
        'Location': 'https://example.org/?testkey=testvalue',
      }
    })
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
