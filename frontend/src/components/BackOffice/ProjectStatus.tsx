import React, { useMemo, useState } from "react"
import { JsonData, JsonEditor, githubDarkTheme } from "json-edit-react"
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
import { sendTokenTo } from "../../../shared/solana/sendTokenTo"

// schema & types
const formSchema = z.object({
  project: projectSchema,
})
type FormType = z.infer<typeof formSchema>

const StatusIcon = ({ isValid, isLoading }: { isValid: boolean | null; isLoading?: boolean }) => {
  if (isLoading) {
    return <span className="flex h-5 w-5 items-center justify-center animate-spin">⟳</span>
  }

  if (isValid === null) {
    return <span className="flex h-5 w-5 items-center justify-center text-gray-400">?</span>
  }

  return isValid ? (
    <span className="flex h-5 w-5 items-center justify-center text-green-500">✓</span>
  ) : (
    <span className="flex h-5 w-5 items-center justify-center text-red-500">✗</span>
  )
}

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

  const goToPreviousProject = () => {
    if (currentProjectIndex > 0) {
      const newIndex = currentProjectIndex - 1;
      setCurrentProjectIndex(newIndex);
      
      // Also select the project in the form
      const projectToSelect = upcomingProjects[newIndex];
      if (projectToSelect) {
        selectProject(projectToSelect.id);
      }
    }
  }

  const goToNextProject = () => {
    if (currentProjectIndex < upcomingProjects.length - 1) {
      const newIndex = currentProjectIndex + 1;
      setCurrentProjectIndex(newIndex);
      
      // Also select the project in the form
      const projectToSelect = upcomingProjects[newIndex];
      if (projectToSelect) {
        selectProject(projectToSelect.id);
      }
    }
  }

  const refreshData = async () => {
    await refetch()
    selectProject(nextProjectToGoLive.id)
    toast.success("Data refreshed -> Click on Select This Project", { theme: "colored" })
  }

  const selectProject = (projectId: string) => {
    if (!data) return
    const selectedProject = data.projects.find((project) => project.id === projectId)
    if (!selectedProject) return
    setValue("project", selectedProject, { shouldDirty: false, shouldTouch: false, shouldValidate: false })
    
    // Reset status checks when selecting a new project
    setStatusResults({
      lbpWalletSet: null,
      usdcTokenAccount: null,
      nftMetadataFiles: null,
      nftConfigSet: null,
      nftCollectionMinted: null,
      tiersHaveStartDates: null,
    })
  }

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

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A"
    try {
      const dateObj = date instanceof Date ? date : new Date(date)
      return dateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (_error) {
      return "Invalid date"
    }
  }

  const checkLbpWalletSet = () => {
    if (!selectedProjectData) return false
    return selectedProjectData.config.lbpWalletAddress !== null && 
           selectedProjectData.config.lbpWalletAddress !== undefined && 
           selectedProjectData.config.lbpWalletAddress !== ""
  }

  const checkUsdcTokenAccount = async () => {
    if (!selectedProjectData?.config.lbpWalletAddress) return false
    
    try {
      setCheckingStatus(prev => ({ ...prev, usdcTokenAccount: true }))
      
      // Call backend API to check if token account exists for the LBP wallet
      const tokenMint = selectedProjectData.config.raisedTokenData.mintAddress
      const walletAddress = selectedProjectData.config.lbpWalletAddress
      const projectId = selectedProjectData.id
      
      // Return false if tokenMint is null
      if (!tokenMint) {
        console.error("Token mint address is null")
        setCheckingStatus(prev => ({ ...prev, usdcTokenAccount: false }))
        return false
      }
      
      // This assumes you will implement a checkTokenAccount endpoint in your backend
      const response = await backendApi.checkTokenAccount({
        walletAddress,
        tokenMint,
        projectId,
      })
      
      setCheckingStatus(prev => ({ ...prev, usdcTokenAccount: false }))
      return response.exists
    } catch (error) {
      console.error("Error checking token account:", error)
      setCheckingStatus(prev => ({ ...prev, usdcTokenAccount: false }))
      return false
    }
  }

  const createUsdcTokenAccount = async () => {
    if (!selectedProjectData?.config.lbpWalletAddress || !isWalletConnected) return
    
    try {
      // Ensure lbpWalletAddress is not null with a type assertion
      const lbpAddress = selectedProjectData.config.lbpWalletAddress as string;
      
      // Handle potential null tokenMint
      const tokenMint = selectedProjectData.config.raisedTokenData.mintAddress;
      if (!tokenMint) {
        throw new Error("Token mint address is null");
      }
      
      // Ensure wallet provider is valid
      if (!walletProvider) {
        throw new Error("No wallet provider selected");
      }
      
      // Get the cluster from the project config
      const cluster = selectedProjectData.config.cluster || "mainnet";
      
      // Get the transaction for creating the token account and sending a minimum amount
      const signature = await sendTokenTo({
        walletAddress: address,
        destAddress: lbpAddress,
        tokenMint: tokenMint,
        amount: 1000000, // We're sending 1 USDC (1000000 = 1 USDC with 6 decimals)
        decimals: 6,
        signTransaction,
        walletProvider: walletProvider as "PHANTOM" | "BACKPACK" | "SOLFLARE",
        cluster: cluster as "mainnet" | "devnet"
      })
      
      // Show success message with signature and link to Solscan
      toast.success(
        <div>
          <p>Token account created successfully!</p>
          <p>
            Transaction: <a 
              href={`https://solscan.io/tx/${signature}${cluster === "devnet" ? "?cluster=devnet" : ""}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline"
            >
              {signature.slice(0, 8)}...{signature.slice(-8)}
            </a>
          </p>
        </div>, 
        { theme: "colored" }
      );
      
      // Re-check status after a short delay to allow the transaction to confirm
      setTimeout(async () => {
        const result = await checkUsdcTokenAccount();
        setStatusResults(prev => ({ ...prev, usdcTokenAccount: result }));
      }, 2000);
      
    } catch (error) {
      console.error("Error creating token account:", error)
      toast.error("Failed to create token account: " + (error as Error).message, { theme: "colored" })
    }
  }

  const checkNftMetadataFiles = async () => {
    if (!selectedProjectData) return false

    try {
      setCheckingStatus(prev => ({ ...prev, nftMetadataFiles: true }))
      const projectId = selectedProjectData.id
      const metadataUrl = `https://files.borgpad.com/${projectId}/nft-metadata/collection-metadata.json`

      const response = await fetch(metadataUrl, { method: 'HEAD' })
      setCheckingStatus(prev => ({ ...prev, nftMetadataFiles: false }))
      return response.ok
    } catch (error) {
      setCheckingStatus(prev => ({ ...prev, nftMetadataFiles: false }))
      console.error("Error checking NFT metadata files:", error)
      return false
    }
  }

  const checkNftConfigSet = () => {
    if (!selectedProjectData) return false
    const nftConfig = selectedProjectData.config.nftConfig
    // Check if nftConfig exists and if collection is defined and not empty
    return !!nftConfig
  }

  const checkNftCollectionMinted = () => {
    if (!selectedProjectData) return false
    const nftConfig = selectedProjectData.config.nftConfig
    // Check if nftConfig exists and if collection is defined and not empty
    return !!nftConfig && 
           !!nftConfig.collection && 
           nftConfig.collection.trim() !== ""
  }

  const createCollectionAddress = async () => {
    if (!selectedProjectData || !isWalletConnected) return

    try {
      setIsCreatingCollection(true)
      const message = "I confirm I am an admin by signing this message."
      const signature = Array.from(await signMessage(message))
      const auth = { address, message, signature }

      const projectId = selectedProjectData.id
      const nftConfig = selectedProjectData.config.nftConfig
      
      // Get the cluster from the project config
      const cluster = selectedProjectData.config.cluster || "mainnet";

      // Use backendApi.createNftCollection instead of direct import
      const result = await backendApi.createNftCollection({
        projectId,
        auth,
        nftConfig: {
          name: `${nftConfig?.name}`,
          symbol: `${nftConfig?.symbol}`,
          description: `${nftConfig?.description}`,
          imageUrl: `${nftConfig?.imageUrl}`,
          collection: ""  // This will be filled by the backend
        },
        cluster: cluster as "mainnet" | "devnet"
      })

      // Save the transaction signature for display
      setLastNftTxSignature(result.transactionSignature)

      // Update the project with the new collection address
      if (result.collectionAddress) {
        const updatedProject = { ...selectedProjectData }
        updatedProject.config.nftConfig = {
          name: `${nftConfig?.name}`,
          symbol: `${nftConfig?.symbol}`,
          description: `${nftConfig?.description}`,
          imageUrl: `${nftConfig?.imageUrl}`,
          collection: result.collectionAddress
        }

        setValue("project", updatedProject as ProjectModel, { shouldDirty: true })
        
        // Show success message with transaction link and warning if applicable
        toast.success(
          <div>
            <p>NFT collection created successfully!</p>
            <p>DON&apos;T FORGET TO UPDATE THE PROJECT</p>
          </div>,
          { theme: "colored" }
        )

        // Re-check status
        setStatusResults(prev => ({ ...prev, nftCollectionMinted: true }))
      }
    } catch (error) {
      console.error("Error creating NFT collection:", error)
      toast.error("Failed to create NFT collection: " + (error as Error).message, { theme: "colored" })
    } finally {
      setIsCreatingCollection(false)
    }
  }

  const checkTiersHaveStartDates = () => {
    if (!selectedProjectData) return false
    
    const tiers = selectedProjectData.info.tiers
    if (!tiers || tiers.length === 0) return false
    
    // Check that all tiers have benefits and benefits.startDate is set
    return tiers.every(tier => 
      tier.benefits && 
      tier.benefits.startDate !== null && 
      tier.benefits.startDate !== undefined
    )
  }

  const runAllChecks = async () => {
    if (!selectedProjectData) return

    // Check LBP wallet
    const lbpWalletSet = checkLbpWalletSet()
    setStatusResults(prev => ({ ...prev, lbpWalletSet }))

    // Check USDC token account
    const usdcTokenAccount = await checkUsdcTokenAccount()
    setStatusResults(prev => ({ ...prev, usdcTokenAccount }))

    // Check NFT metadata files
    const nftMetadataFiles = await checkNftMetadataFiles()
    setStatusResults(prev => ({ ...prev, nftMetadataFiles }))

    // Check NFT config
    const nftConfigSet = checkNftConfigSet()
    setStatusResults(prev => ({ ...prev, nftConfigSet }))

    // Check NFT collection
    const nftCollectionMinted = checkNftCollectionMinted()
    setStatusResults(prev => ({ ...prev, nftCollectionMinted }))

    checkNftCollectionMinted

    // Check tiers have start dates
    const tiersHaveStartDates = checkTiersHaveStartDates()
    setStatusResults(prev => ({ ...prev, tiersHaveStartDates }))
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
        <div className="w-full max-w-3xl bg-bg-secondary p-4 mb-4 rounded-lg border border-bd-secondary">
          <div className="flex justify-between items-center mb-2">
            <button 
              className={`p-2 rounded text-xl ${currentProjectIndex === 0 ? 'text-gray-500 cursor-not-allowed' : 'text-white hover:bg-bg-tertiary'}`}
              onClick={goToPreviousProject}
              disabled={currentProjectIndex === 0}
            >
              ←
            </button>
            <h2 className="text-xl font-medium">
              {`Upcoming Project ${currentProjectIndex + 1}/${upcomingProjects.length}`}
            </h2>
            <button 
              className={`p-2 rounded text-xl ${currentProjectIndex >= upcomingProjects.length - 1 ? 'text-gray-500 cursor-not-allowed' : 'text-white hover:bg-bg-tertiary'}`}
              onClick={goToNextProject}
              disabled={currentProjectIndex >= upcomingProjects.length - 1}
            >
              →
            </button>
          </div>
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Project:</span>
              <span>{nextProjectToGoLive.info.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Sale Opens:</span>
              <span>
                {(() => {
                  const saleOpensDate = nextProjectToGoLive.info.timeline.find(event => event.id === "SALE_OPENS")?.date;
                  if (!saleOpensDate) return "N/A";
                  const now = new Date()
                  return new Date(saleOpensDate) < now ? "LIVE" : formatDate(saleOpensDate);
                })()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Cluster:</span>
              <span>
                {nextProjectToGoLive.config.cluster || "Not set"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">LBP Wallet:</span>
              <span className="truncate">
                {nextProjectToGoLive.config.lbpWalletAddress ? (
                  <>
                    <a 
                      href={`https://solscan.io/account/${nextProjectToGoLive.config.lbpWalletAddress}?cluster=${nextProjectToGoLive.config.cluster || 'devnet'}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300"
                    >
                      {nextProjectToGoLive.config.lbpWalletAddress}
                    </a>
                  </>
                ) : (
                  "Not set"
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">NFT Collection:</span>
              <span className="truncate">
                {nextProjectToGoLive.config.nftConfig?.collection ? (
                  <a 
                    href={`https://solscan.io/token/${nextProjectToGoLive.config.nftConfig.collection}?cluster=${nextProjectToGoLive.config.cluster || 'devnet'}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    {nextProjectToGoLive.config.nftConfig.collection}
                  </a>
                ) : (
                  "Not set"
                )}
              </span>
            </div>
            <Button 
              btnText="Select This Project" 
              size="sm" 
              className="mt-2"
              onClick={() => selectProject(nextProjectToGoLive.id)}
            />
          </div>
        </div>
      )}

      <DropdownSelector
        baseColor="secondary"
        accentColor="tertiary"
        onChange={selectProject}
        selected={selectedProjectData?.id || ""}
        options={dropdownOptions}
      />
      
      {selectedProjectData && (
        <div className="w-full max-w-3xl bg-bg-secondary p-4 mb-4 rounded-lg border border-bd-secondary">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium">Project Readiness Checklist</h2>
            <Button 
              btnText="Run Checks" 
              size="sm"
              onClick={runAllChecks}
              disabled={!isWalletConnected}
            />
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <StatusIcon isValid={statusResults.lbpWalletSet} />
                <span>LBP Wallet Address Set</span>
              </div>
              {statusResults.lbpWalletSet === false && (
                <span className="text-sm text-red-400">Please set LBP wallet address in project config</span>
              )}
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <StatusIcon isValid={statusResults.usdcTokenAccount} isLoading={checkingStatus.usdcTokenAccount} />
                <span>USDC Token Account Created</span>
              </div>
              {statusResults.usdcTokenAccount === false && statusResults.lbpWalletSet && (
                <Button 
                  btnText="Create USDC Account" 
                  size="sm"
                  onClick={createUsdcTokenAccount}
                  disabled={!isWalletConnected}
                />
              )}
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <StatusIcon isValid={statusResults.nftMetadataFiles} isLoading={checkingStatus.nftMetadataFiles} />
                <span>NFT Metadata Files Available</span>
              </div>
              {statusResults.nftMetadataFiles === false && (
                <span className="text-sm text-red-400">
                  Missing files at <a 
                    href={selectedProjectData.config.cluster === "devnet" 
                      ? `https://files.staging.borgpad.com/${selectedProjectData.id}/nft-metadata/collection-metadata.json`
                      : `https://files.borgpad.com/${selectedProjectData.id}/nft-metadata/collection-metadata.json`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {selectedProjectData.config.cluster === "devnet" 
                      ? `https://files.staging.borgpad.com/${selectedProjectData.id}/nft-metadata/collection-metadata.json`
                      : `https://files.borgpad.com/${selectedProjectData.id}/nft-metadata/collection-metadata.json`}
                  </a>
                </span>
              )}
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <StatusIcon isValid={statusResults.nftConfigSet} />
                <span>NFT Config Set</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <StatusIcon isValid={statusResults.nftCollectionMinted} />
                <span>NFT Collection Minted ?</span>
              </div>
              {statusResults.nftCollectionMinted === false && (
                <Button 
                  btnText={isCreatingCollection ? "Creating..." : "Create Collection"}
                  size="sm"
                  onClick={createCollectionAddress}
                  disabled={!isWalletConnected || isCreatingCollection}
                  isLoading={isCreatingCollection}
                />
              )}
              {statusResults.nftCollectionMinted === true && selectedProjectData?.config.nftConfig?.collection && (
                <div className="flex items-center space-x-3">
                  <a 
                    href={`https://solscan.io/token/${selectedProjectData.config.nftConfig.collection}${selectedProjectData.config.cluster === "devnet" ? "?cluster=devnet" : ""}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm underline"
                  >
                    View on Solscan
                  </a>
                  <Button 
                    btnText={isCreatingCollection ? "Creating..." : "Create New"}
                    size="sm"
                    onClick={createCollectionAddress}
                    disabled={!isWalletConnected || isCreatingCollection}
                    isLoading={isCreatingCollection}
                  />
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <StatusIcon isValid={statusResults.tiersHaveStartDates} />
                <span>All Tiers Have Start Dates</span>
              </div>
              {statusResults.tiersHaveStartDates === false && (
                <span className="text-sm text-red-400">Please set startDate for all tiers</span>
              )}
            </div>

            {selectedProjectData.config.nftConfig?.collection && (
              <div className="mt-6 pt-4 border-t border-bd-secondary">
                <h3 className="text-lg font-medium mb-3">NFT Collection Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Collection Address:</span>
                    <a 
                      href={`https://solscan.io/token/${selectedProjectData.config.nftConfig.collection}${selectedProjectData.config.cluster === "devnet" ? "?cluster=devnet" : ""}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-sm break-all max-w-[350px]"
                    >
                      {selectedProjectData.config.nftConfig.collection}
                    </a>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Network:</span>
                    <span className="text-sm capitalize">{selectedProjectData.config.cluster || "mainnet"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Name:</span>
                    <span className="text-sm font-medium">{selectedProjectData.config.nftConfig.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Symbol:</span>
                    <span className="text-sm">{selectedProjectData.config.nftConfig.symbol}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Solscan:</span>
                    <a 
                      href={`https://solscan.io/token/${selectedProjectData.config.nftConfig.collection}${selectedProjectData.config.cluster === "devnet" ? "?cluster=devnet" : ""}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      View on Solscan
                    </a>
                  </div>
                  {lastNftTxSignature && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Last Transaction:</span>
                      <a 
                        href={`https://solscan.io/tx/${lastNftTxSignature}${selectedProjectData.config.cluster === "devnet" ? "?cluster=devnet" : ""}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-sm"
                      >
                        {lastNftTxSignature.slice(0, 8)}...{lastNftTxSignature.slice(-8)}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
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
    </main>
  )
}

export default UpdateProjectJson
