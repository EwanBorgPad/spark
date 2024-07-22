import { dummyData } from "@/data/projectData.ts"
import { ProjectModel, projectSchema } from "../../shared/models.ts"
import { createContext, ReactNode, useContext, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { backendApi } from "@/data/backendApi.ts"

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
  // TODO @hardcoded puffer-finance , should be pulled from url or smth
  const id = 'puffer-finance'
  const { data: projectData } = useQuery({
    queryFn: () => backendApi.getProject({ id }),
    queryKey: ['backendApi', 'getProject', id],
    // TODO @hardcoded remove initialData/dummyData after implementing loading states
    initialData: dummyData,
  })

  const queryClient = useQueryClient()

  /**
   * TODO @testing this is only for testing
   * @param data
   */
  const setProjectData = (data: ProjectModel) => {
    queryClient.setQueryData(
      ['backendApi', 'getProject', id],
      data,
    )
  }

  /////////////////////////////////////////////////////////////////
  // @TODO - add GET api for project data and remove state above //
  /////////////////////////////////////////////////////////////////

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
