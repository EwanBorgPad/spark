
interface Env {

}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const method = context.request.method
  const url = context.request.url

  console.log({ url, method })
  console.log(`Api: ${method} ${url}`)

  return new Response('Hello world')
}
