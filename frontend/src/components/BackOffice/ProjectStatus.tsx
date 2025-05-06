import React, { useMemo, useState } from "react"
import { JsonData, JsonEditor, githubDarkTheme } from "json-edit-react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { DropdownSelector } from "../Dropdown/Dropdown"
import { useWalletContext } from "@/hooks/useWalletContext"
import { GetProjectsProjectResponse, GetProjectsResponse, ProjectModel, projectSchema } from "shared/models"
import { backendApi, UpdateJsonArgs } from "@/data/api/backendApi"
import { toast } from "react-toastify"
import { SubmitHandler, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "../Button/Button"
import { MetadataModal } from "./ProjectStatus/MetadataModal"
import { ProjectReadinessChecklist } from "./ProjectStatus/ProjectReadinessChecklist"
import { UpcomingProjectCard } from "./ProjectStatus/UpcomingProjectCard"
import { useProjectStatusActions } from "./ProjectStatus/useProjectStatusActions"
import { useProjectStatusUtils } from "./ProjectStatus/useProjectStatusUtils"

// schema & types
const formSchema = z.object({
  project: projectSchema,
})
type FormType = z.infer<typeof formSchema>

const UpdateProjectJson = () => {
  const { address, signMessage, signTransaction, walletProvider, isWalletConnected } = useWalletContext()
  const [checkingStatus, setCheckingStatus] = useState<Record<string, boolean>>({})
  const [statusResults, setStatusResults] = useState<Record<string, boolean | null>>({
    lbpWalletSet: null,
    usdcTokenAccount: null,
    nftMetadataFiles: null,
    nftConfigSet: null,
    tiersHaveStartDates: null,
  })
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0)
  const [lastNftTxSignature, setLastNftTxSignature] = useState<string | null>(null)
  const [isCreatingCollection, setIsCreatingCollection] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState({
    collectionMetadata: false,
    metadata: false,
    image: false
  })
  const [nftImageUrl, setNftImageUrl] = useState<string | null>(null)
  const [showMetadataModal, setShowMetadataModal] = useState(false)
  const [modalType, setModalType] = useState<'collection' | 'nft' | 'image' | null>(null)
  const [fileInputRef, setFileInputRef] = useState<React.RefObject<HTMLInputElement>>(React.createRef());

  const { data, refetch, isLoading: isLoadingProjects } = useQuery<GetProjectsResponse>({
    queryFn: () => backendApi.getProjects({ page: 1, limit: 999 }),
    queryKey: ["getProjects", "all"],
  })

  const {
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { isDirty, errors },
  } = useForm<FormType>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
  })
  const projectResponse = watch()?.project as GetProjectsProjectResponse | undefined
  const selectedProjectData = projectResponse
    ? { id: projectResponse?.id, config: projectResponse?.config, info: projectResponse?.info }
    : null

  const dropdownOptions = data ? data.projects.map((project) => ({ label: project.info.title, value: project.id })) : []

  const upcomingProjects = useMemo(() => {
    if (!data?.projects) return []

    const now = new Date()

    // Filter projects that have a SALE_OPENS event in the future
    return data.projects
      .filter(project => {
        const saleOpensEvent = project.info.timeline.find(event => event.id === "SALE_CLOSES")

        return saleOpensEvent &&
          saleOpensEvent.date &&
          new Date(saleOpensEvent.date) > now
      })
      .sort((a, b) => {
        const aDate = new Date(a.info.timeline.find(event => event.id === "SALE_OPENS")?.date || 0)
        const bDate = new Date(b.info.timeline.find(event => event.id === "SALE_OPENS")?.date || 0)
        return bDate.getTime() - aDate.getTime()
      })
  }, [data])

  const nextProjectToGoLive = useMemo(() => {
    return upcomingProjects[currentProjectIndex] || null
  }, [upcomingProjects, currentProjectIndex])

  const { formatDate } = useProjectStatusUtils()
  
  const {
    selectProject,
    goToNextProject,
    goToPreviousProject,
    refreshData,
    runAllChecks,
    createUsdcTokenAccount,
    createCollectionAddress,
    updateNftConfig,
    uploadCollectionMetadataJson,
    uploadNftMetadataJson,
    uploadLocalImage,
    openMetadataModal
  } = useProjectStatusActions({
    address,
    signMessage,
    signTransaction,
    walletProvider: walletProvider as "PHANTOM" | "BACKPACK" | "SOLFLARE" | null,
    isWalletConnected,
    selectedProjectData,
    data,
    nextProjectToGoLive,
    setValue,
    currentProjectIndex,
    setCurrentProjectIndex,
    upcomingProjects,
    setStatusResults,
    setCheckingStatus,
    checkingStatus,
    setIsCreatingCollection,
    isCreatingCollection,
    uploadedFiles,
    setUploadedFiles,
    setLastNftTxSignature,
    setNftImageUrl,
    setModalType,
    setShowMetadataModal,
    refetch
  })
  
  // create project - api
  const { mutate: updateJson, isPending } = useMutation({
    mutationFn: async (payload: UpdateJsonArgs) => backendApi.updateJson(payload),
    onSuccess: async (_, _variables) => {
      toast.success("Project updated!", { theme: "colored" })
      await refetch()
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
      <div className="flex w-full max-w-3xl justify-between items-center">
        <h1 className="text-center text-2xl font-semibold mx-auto">Project Status</h1>
        <Button
          btnText={isLoadingProjects ? "Refreshing..." : "Refresh Data"}
          size="sm"
          onClick={refreshData}
          disabled={isLoadingProjects}
          className="ml-4"
        />
      </div>

      {nextProjectToGoLive && (
        <UpcomingProjectCard
          nextProjectToGoLive={nextProjectToGoLive}
          currentProjectIndex={currentProjectIndex}
          upcomingProjects={upcomingProjects}
          goToPreviousProject={goToPreviousProject}
          goToNextProject={goToNextProject}
          selectProject={selectProject}
          formatDate={formatDate}
        />
      )}

      <DropdownSelector
        baseColor="secondary"
        accentColor="tertiary"
        onChange={selectProject}
        selected={selectedProjectData?.id || ""}
        options={dropdownOptions}
      />

      {selectedProjectData && (
        <ProjectReadinessChecklist
          selectedProjectData={selectedProjectData}
          statusResults={statusResults}
          checkingStatus={checkingStatus}
          uploadedFiles={uploadedFiles}
          runAllChecks={runAllChecks}
          isWalletConnected={isWalletConnected}
          createUsdcTokenAccount={createUsdcTokenAccount}
          updateNftConfig={updateNftConfig}
          openMetadataModal={openMetadataModal}
          createCollectionAddress={createCollectionAddress}
          isCreatingCollection={isCreatingCollection}
          lastNftTxSignature={lastNftTxSignature}
        />
      )}

      <form className="flex w-full justify-center" onSubmit={handleSubmit(onSubmit)}>
        {selectedProjectData && (
          <div className="flex-[5]">
            <JsonEditor
              data={selectedProjectData}
              rootName="json"
              setData={setData}
              enableClipboard
              className="w-full !max-w-[100%] ring-[1px] ring-white/50"
              theme={githubDarkTheme}
            />
          </div>
        )}
        {selectedProjectData && (
          <div className="flex max-w-[300px] flex-[1] flex-col px-4">
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
              {errors?.project && (
                <p className="w-full max-w-[300px] text-wrap text-bd-danger">
                  <span>Error hint:</span>
                  <br />
                  <span className="whitespace-pre-line">
                    {JSON.stringify(errors.project).replaceAll('":{"', '":\n"').replaceAll('","', '",\n"')}
                  </span>
                </p>
              )}
            </div>
          </div>
        )}
      </form>
      {showMetadataModal && (
        <MetadataModal
          showMetadataModal={showMetadataModal}
          selectedProjectData={selectedProjectData}
          modalType={modalType}
          fileInputRef={fileInputRef}
          isWalletConnected={isWalletConnected}
          setShowMetadataModal={setShowMetadataModal}
          setModalType={setModalType}
          uploadLocalImage={uploadLocalImage}
          uploadCollectionMetadataJson={uploadCollectionMetadataJson}
          uploadNftMetadataJson={uploadNftMetadataJson}
        />
      )}
    </main>
  )
}

export default UpdateProjectJson
