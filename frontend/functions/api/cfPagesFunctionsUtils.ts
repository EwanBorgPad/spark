/**
 * Easier way to return response
 * @param json
 * @param statusCode
 */
export const jsonResponse = (
  json?: Record<string, unknown> | null,
  statusCode?: number,
): Response => {
  const body = json ? JSON.stringify(json) : null
  const status = statusCode ?? 200
  return new Response(body, {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  })
}
