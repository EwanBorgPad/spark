import { z } from "zod"
import { idSchema } from "../models"
import { Analyst, Analysis } from "shared/drizzle-schema"


const analystRoleSchema = z.enum(["FREE_WRITER", "TEAM_MEMBER", "SPONSORED_ANALYST"], {
  errorMap: () => ({ message: "Please select a valid role" }),
})
export type AnalystRoleEnum = z.infer<typeof analystRoleSchema>

// NOTE: if you change this schema, be sure to sync with analystTable in drizzle-schema.ts
export const analystSchema = z.object({
  id: idSchema(),
  twitterId: z.string(),
  twitterUsername: z.string(),
  twitterName: z.string(),
  twitterAvatar: z.string().url(),
})
export type AnalystSchemaType = z.infer<typeof analystSchema>

export const postNewAnalysisSchema = z.object({
  analystId: z.string(),
  twitterId: z.string(),
  analystRole: analystRoleSchema,
  projectId: z.string().min(1),
  articleUrl: z.string().trim().url({ message: "Please enter a valid URL" }).min(4),
})
export type NewAnalysisSchemaType = z.infer<typeof postNewAnalysisSchema>

export type GetListOfAnalysisResponse = { analysisList: { analysis: Analysis; analyst: Analyst }[] }