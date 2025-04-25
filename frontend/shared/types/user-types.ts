import { ProjectModel } from "../models"

export type UserInvestmentByProjects = {
  projectId: string
  project: ProjectModel
  totalInvestmentInUSD: number
}
export type GetUserInvestmentsResponse = { investments: UserInvestmentByProjects[]; sumInvestments: number }
