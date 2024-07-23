import { dummyData } from "@/data/projectData.ts"
import { ProjectModel, projectSchema } from "../../shared/models.ts"
import { createContext, ReactNode, useCallback, useContext, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { backendApi } from "@/data/backendApi.ts"
import { useParams } from "react-router-dom"

type Context = {
  projectData: ProjectModel
  setProjectData: (data: ProjectModel) => void
}
const ProjectDataContext = createContext<Context | undefined>(undefined)

export function useProjectDataContext() {
  const context = useContext(ProjectDataContext)
  if (!context)
    throw new Error("Component is outside of the <ProjectDataProvider />")
  return context
}

export function ProjectDataProvider({ children }: { children: ReactNode }) {
  let { projectId } = useParams()
  projectId = projectId || ''

  const { data: projectData } = useQuery({
    queryFn: () => backendApi.getProject({ projectId }),
    queryKey: ['backendApi', 'getProject', projectId],
    enabled: Boolean(projectId),
    // TODO @hardcoded remove initialData/dummyData after implementing loading states
    initialData: dummyData,
  })

  const queryClient = useQueryClient()

  /**
   * TODO @qaTesting this is only for testing
   * @param data
   */
  const setProjectData = useCallback((data: ProjectModel) => {
    queryClient.setQueryData(['backendApi', 'getProject', projectId], data)
  }, [queryClient, projectId])

  return (
    <ProjectDataContext.Provider
      value={{
        projectData,
        setProjectData,
      }}
    >
      {children}
    </ProjectDataContext.Provider>
  )
}
