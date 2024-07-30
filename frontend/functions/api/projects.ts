import { ProjectModel, projectSchema } from "../../shared/models"
import { jsonResponse, reportError } from "./cfPagesFunctionsUtils"

type ENV = {
  DB: D1Database
}
/**
 * Get request handler - returns a project by id
 * @param ctx
 */
export const onRequestGet: PagesFunction<ENV> = async (ctx) => {
  const db = ctx.env.DB
  try {
    const url = ctx.request.url
    const id = new URL(url).searchParams.get("id")

    // validate request
    if (!id) {
      return jsonResponse({ message: "Please provide id query param" }, 400)
    }

    const project = await getProjectById(db, id)

    if (project) {
      return jsonResponse(project, 200)
    } else {
      return jsonResponse({ message: "Not found!" }, 404)
    }
  } catch (e) {
    await reportError(db, e)
    return jsonResponse({ message: "Something went wrong..." }, 500)
  }
}
/**
 * Post request handler - creates a project
 * @param ctx
 */
export const onRequestPost: PagesFunction<ENV> = async (ctx) => {
  const db = ctx.env.DB
  try {
    // parse request
    const requestJson = await ctx.request.json()
    const { error, data } = projectSchema.safeParse(requestJson)

    // validate request
    if (error) {
      return jsonResponse(
        {
          message: "Invalid request!",
          error,
        },
        400,
      )
    }

    // check if exists
    const existingProject = await getProjectById(db, data.id)
    if (existingProject) {
      return jsonResponse(
        {
          message: "Project with provided id already exists!",
        },
        409,
      )
    }

    // persist in db
    await db
      .prepare("INSERT INTO project (id, json) VALUES (?1, ?2)")
      .bind(data.id, JSON.stringify(data))
      .run()

    return jsonResponse({ message: "Created!" }, 201)
  } catch (e) {
    await reportError(db, e)
    return jsonResponse({ message: "Something went wrong..." }, 500)
  }
}

const getProjectById = async (
  db: D1Database,
  id: string,
): Promise<ProjectModel | null> => {
  const project = await db
    .prepare("SELECT * FROM project WHERE id = ?1")
    .bind(id)
    .first<{ id: string; json: ProjectModel }>()
  return project ? JSON.parse(project.json) : null
}
