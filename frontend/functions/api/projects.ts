import { z } from "zod"
import { projectSchema } from "../../shared/models"

type ENV = {
  DB: D1Database
}
/**
 * Get request handler - returns a project by id
 * @param ctx
 */
export const onRequestGet: PagesFunction<ENV> = async (ctx) => {
  try {
    return jsonResponse({ message: 'Not implemented!' }, 501)
  } catch (e) {
    console.error(e)
    return jsonResponse({ message: 'Something went wrong...' }, 500)
  }
}
/**
 * Post request handler - creates a project
 * @param ctx
 */
export const onRequestPost: PagesFunction<ENV> = async (ctx) => {
  try {
    const { error } = projectSchema.safeParse(ctx.request.body)

    if (error) {
      return jsonResponse({
        message: 'Invalid request!',
        error,
      }, 400)
    }

    return jsonResponse({ message: 'Not implemented!' }, 501)
  } catch (e) {
    console.error(e)
    return jsonResponse({ message: 'Something went wrong...' }, 500)
  }
}


const jsonResponse = (json?: Record<string, unknown> | null, statusCode?: number): Response => {
  const body = json ? JSON.stringify(json) : null
  const status = statusCode ?? 200
  return new Response(body, { status })
}
