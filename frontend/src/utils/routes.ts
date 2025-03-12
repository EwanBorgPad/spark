import { ProjectModel } from "shared/models"

export enum ROUTES {
  LANDING_PAGE = "/",
  GOAT_POOLS = "/goat-pools",
  BLITZ_POOLS = "/blitz-pools",
  DRAFT_PICKS = "/draft-picks",
  TERMS_OF_USE = "/terms-of-use",
  TERMS_AND_CONDITIONS = "/terms-and-conditions",
  DOCS = "https://docs.borgpad.com",
  BACK_OFFICE = "/back-office-dashboard-2025",
}

const projectTypeRoutes: Record<ProjectModel["info"]["projectType"], string> = {
  goat: `${ROUTES.GOAT_POOLS}`,
  blitz: `${ROUTES.BLITZ_POOLS}`,
  "draft-pick": `${ROUTES.DRAFT_PICKS}`,
}

export const getProjectRoute = (project: ProjectModel | undefined) => {
  if (!project) return ""
  return `${projectTypeRoutes[project.info.projectType]}/${project.id}`
}
