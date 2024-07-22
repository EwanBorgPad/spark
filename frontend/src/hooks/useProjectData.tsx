import { dummyData } from "@/data/projectData.ts"
import { ProjectModel } from "../../shared/models.ts"
import { createContext, ReactNode, useContext, useState } from "react"

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
  const [projectData, setProjectData] = useState<ProjectModel>(dummyData)

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
