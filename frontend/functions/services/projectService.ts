import { ProjectModel } from "../../shared/models"

type FindProjectByIdArgs = {
  db: D1Database
  id: string
}
const findProjectById = async ({ db, id }: FindProjectByIdArgs): Promise<ProjectModel | null> => {
  const project = await db
    .prepare("SELECT * FROM project WHERE id = ?1")
    .bind(id)
    .first<{ id: string; json: ProjectModel}>()
  return project ? (JSON.parse(project.json) as ProjectModel) : null
}
const findProjectByIdOrFail = async (args: FindProjectByIdArgs): Promise<ProjectModel> => {
  const project = await findProjectById(args)
  if (!project) throw new Error(`Project (id=${args.id}) not found!`)
  return project
}

export const ProjectService = {
  findProjectById,
  findProjectByIdOrFail,
}
