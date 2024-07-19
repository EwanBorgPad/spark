import { z } from "zod"
import { Project, projectSchema } from "../../shared/models"

type ENV = {
  DB: D1Database
}
/**
 * Get request handler - returns a project by id
 * @param ctx
 */
export const onRequestGet: PagesFunction<ENV> = async (ctx) => {
  try {
    const url = ctx.request.url
    const id = new URL(url).searchParams.get("id")

    // validate request
    if (!id) {
      return jsonResponse({ message: 'Please provide id query param' }, 400)
    }

    const project = await getProjectById(ctx.env.DB, id)

    return jsonResponse(project)
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
    // parse request
    const requestJson = await ctx.request.json()
    const { error, data } = projectSchema.safeParse(requestJson)

    // validate request
    if (error) {
      return jsonResponse({
        message: 'Invalid request!',
        error,
      }, 400)
    }

    // check if exists
    const existingProject = await getProjectById(ctx.env.DB, data.id)
    if (existingProject) {
      return jsonResponse({
        message: 'Project with provided id already exists!',
      }, 409)
    }

    // persist in db
    await ctx.env.DB
      .prepare("INSERT INTO project (id, json) VALUES (?1, ?2)")
      .bind(data.id, JSON.stringify(data))
      .run()

    return jsonResponse({ message: 'Not implemented!' }, 501)
  } catch (e) {
    console.error(e)
    return jsonResponse({ message: 'Something went wrong...' }, 500)
  }
}

const getProjectById = async (db: D1Database, id: string): Promise<Project> => {
  const project = await db
    .prepare('SELECT * FROM project WHERE id = ?1')
    .bind(id)
    .first<{ id: string, json: Project }>()
  return project.json
}

const jsonResponse = (json?: Record<string, unknown> | null, statusCode?: number): Response => {
  const body = json ? JSON.stringify(json) : null
  const status = statusCode ?? 200
  return new Response(body, {
    status,
    headers: {
      'Content-Type': 'application/json'
    },
  })
}
