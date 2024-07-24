/**
 * Easier way to return response
 * @param json
 * @param statusCode
 */
export const jsonResponse = (
  json?: string | Record<string, unknown> | null,
  statusCode?: number,
): Response => {
  const body = typeof json === 'object' ? JSON.stringify(json) : json
  const status = statusCode ?? 200
  return new Response(body, {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  })
}
