import React from "react"
import { JsonData, JsonEditor } from "json-edit-react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { DropdownSelector } from "../Dropdown/Dropdown"
import { useWalletContext } from "@/hooks/useWalletContext"
import { GetProjectsProjectResponse, GetProjectsResponse, ProjectModel, projectSchema } from "shared/models"
import { backendApi, UpdateJsonArgs } from "@/data/backendApi"
import { toast } from "react-toastify"
import { SubmitHandler, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "../Button/Button"

// schema & types
const formSchema = z.object({
  project: projectSchema,
})
type FormType = z.infer<typeof formSchema>

const UpdateProjectJson = () => {
  const { address, signMessage, isWalletConnected } = useWalletContext()

  const { data, refetch } = useQuery<GetProjectsResponse>({
    queryFn: () => backendApi.getProjects({ page: 1, limit: 999 }),
    queryKey: ["getProjects", "all"],
  })

  const {
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { isDirty },
  } = useForm<FormType>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
  })
  const projectResponse = watch()?.project as GetProjectsProjectResponse | undefined
  const selectedProjectData = projectResponse
    ? { id: projectResponse?.id, config: projectResponse?.config, info: projectResponse?.info }
    : null

  const dropdownOptions = data ? data.projects.map((project) => ({ label: project.info.title, value: project.id })) : []

  const selectProject = (projectId: string) => {
    if (!data) return
    const selectedProject = data.projects.find((project) => project.id === projectId)
    if (!selectedProject) return
    setValue("project", selectedProject, { shouldDirty: false, shouldTouch: false, shouldValidate: false })
  }

  // create project - api
  const { mutate: updateJson, isPending } = useMutation({
    mutationFn: async (payload: UpdateJsonArgs) => backendApi.updateJson(payload),
    onSuccess: async (_, _variables) => {
      toast.success("Project updated!")
      await refetch()
      //   if (selectedProject) reset(selectedProject.info)
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const onSubmit: SubmitHandler<FormType> = async (formValues) => {
    const message = "I confirm I am an admin by signing this message."
    const signature = Array.from(await signMessage(message))
    const auth = { address, message, signature }

    updateJson({
      projectId: selectedProjectData!.id,
      project: formValues.project,
      auth,
    })
  }

  const resetJson = () => {
    if (!selectedProjectData) return
    const projectId = selectedProjectData.id
    const selectedProject = data?.projects.find((project) => project.id === projectId)
    if (!selectedProject) return
    reset({ project: selectedProject })
  }

  const setData = (updatedProject: JsonData) => {
    setValue("project", updatedProject as ProjectModel, { shouldDirty: true })
  }

  return (
    <main className="z-[10] flex h-full w-full max-w-full flex-col items-center gap-10 py-[100px] font-normal text-fg-primary lg:py-[20px]">
      <h1>Update Project JSON</h1>
      <DropdownSelector
        baseColor="secondary"
        accentColor="tertiary"
        onChange={selectProject}
        selected={selectedProjectData?.id || ""}
        options={dropdownOptions}
      />
      <form className="flex w-full justify-center" onSubmit={handleSubmit(onSubmit)}>
        {selectedProjectData && <JsonEditor data={selectedProjectData} rootName="json" setData={setData} />}
        {selectedProjectData && (
          <div className="flex flex-col px-4">
            <div style={{ position: "sticky" }} className="top-[120px] flex w-full flex-col gap-4">
              <Button
                btnText="Reset"
                color="secondary"
                size="md"
                className="px-10 disabled:cursor-default"
                disabled={!isDirty || !isWalletConnected}
                isLoading={isPending}
                onClick={resetJson}
              />
              <Button
                btnText="Update Project"
                type="submit"
                size="md"
                className="px-10"
                disabled={!isDirty || !isWalletConnected}
                isLoading={isPending}
              />
            </div>
          </div>
        )}
      </form>
    </main>
  )
}

export default UpdateProjectJson
