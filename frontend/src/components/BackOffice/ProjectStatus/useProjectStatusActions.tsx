import { toast } from "react-toastify"
import { ProjectModel, GetProjectsResponse } from "shared/models"
import { backendApi } from "@/data/backendApi"
import { sendTokenTo } from "../../../../shared/solana/sendTokenTo"
import { Transaction } from "@solana/web3.js"
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query"
import { UseFormSetValue } from "react-hook-form"

interface UseProjectStatusActionsProps {
  address: string
  signMessage: (message: string) => Promise<Uint8Array>
  signTransaction: (transaction: Transaction, walletType: "PHANTOM" | "BACKPACK" | "SOLFLARE") => Promise<Transaction | null>
  walletProvider: "PHANTOM" | "BACKPACK" | "SOLFLARE" | null
  isWalletConnected: boolean
  selectedProjectData: ProjectModel | null
  data: GetProjectsResponse | undefined
  nextProjectToGoLive: ProjectModel | null
  setValue: UseFormSetValue<{project: ProjectModel}>
  currentProjectIndex: number
  setCurrentProjectIndex: (index: number) => void
  upcomingProjects: ProjectModel[]
  setStatusResults: React.Dispatch<React.SetStateAction<Record<string, boolean | null>>>
  setCheckingStatus: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  checkingStatus: Record<string, boolean>
  setIsCreatingCollection: React.Dispatch<React.SetStateAction<boolean>>
  isCreatingCollection: boolean
  uploadedFiles: {
    collectionMetadata: boolean
    metadata: boolean
    image: boolean
  }
  setUploadedFiles: React.Dispatch<React.SetStateAction<{
    collectionMetadata: boolean
    metadata: boolean
    image: boolean
  }>>
  setLastNftTxSignature: React.Dispatch<React.SetStateAction<string | null>>
  setNftImageUrl: React.Dispatch<React.SetStateAction<string | null>>
  setModalType: React.Dispatch<React.SetStateAction<'collection' | 'nft' | 'image' | null>>
  setShowMetadataModal: React.Dispatch<React.SetStateAction<boolean>>
  refetch: (options?: RefetchOptions) => Promise<QueryObserverResult<GetProjectsResponse, Error>>
}

export const useProjectStatusActions = ({
  address,
  signMessage,
  signTransaction,
  walletProvider,
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
  setIsCreatingCollection,
  uploadedFiles,
  setUploadedFiles,
  setLastNftTxSignature,
  setNftImageUrl,
  setModalType,
  setShowMetadataModal,
  refetch
}: UseProjectStatusActionsProps) => {
  
  const goToPreviousProject = () => {
    if (currentProjectIndex > 0) {
      const newIndex = currentProjectIndex - 1
      setCurrentProjectIndex(newIndex)

      // Also select the project in the form
      const projectToSelect = upcomingProjects[newIndex]
      if (projectToSelect) {
        selectProject(projectToSelect.id)
      }
    }
  }

  const goToNextProject = () => {
    if (currentProjectIndex < upcomingProjects.length - 1) {
      const newIndex = currentProjectIndex + 1
      setCurrentProjectIndex(newIndex)

      // Also select the project in the form
      const projectToSelect = upcomingProjects[newIndex]
      if (projectToSelect) {
        selectProject(projectToSelect.id)
      }
    }
  }

  const refreshData = async () => {
    const result = await refetch()
    if (result.data && nextProjectToGoLive) {
      selectProject(nextProjectToGoLive.id)
    }
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
      const lbpAddress = selectedProjectData.config.lbpWalletAddress as string

      // Handle potential null tokenMint
      const tokenMint = selectedProjectData.config.raisedTokenData.mintAddress
      if (!tokenMint) {
        throw new Error("Token mint address is null")
      }

      // Ensure wallet provider is valid
      if (!walletProvider) {
        throw new Error("No wallet provider selected")
      }

      // Get the cluster from the project config
      const cluster = selectedProjectData.config.cluster || "mainnet"

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
      )

      // Re-check status after a short delay to allow the transaction to confirm
      setTimeout(async () => {
        const result = await checkUsdcTokenAccount()
        setStatusResults(prev => ({ ...prev, usdcTokenAccount: result }))
      }, 2000)

    } catch (error) {
      console.error("Error creating token account:", error)
      toast.error("Failed to create token account: " + (error as Error).message, { theme: "colored" })
    }
  }

  // Add this function to manually verify the NFT files
  const verifyNftFiles = async () => {
    if (!selectedProjectData) return

    const hasMetadataFiles = await checkNftMetadataFiles()
    setStatusResults(prev => ({ ...prev, nftMetadataFiles: hasMetadataFiles }))

    if (hasMetadataFiles) {
      toast.success("All NFT files verified successfully!", { theme: "colored" })
    } else {
      // More specific error message about which files are missing
      const missingFiles = []
      if (!uploadedFiles.collectionMetadata) missingFiles.push("collection-metadata.json")
      if (!uploadedFiles.metadata) missingFiles.push("metadata.json")
      if (!uploadedFiles.image) missingFiles.push("image.png")
      
      toast.error(`Some NFT files are missing: ${missingFiles.join(", ")}`, { theme: "colored" })
    }
  }

  const checkNftMetadataFiles = async () => {
    if (!selectedProjectData) return false

    try {
      setCheckingStatus(prev => ({ ...prev, nftMetadataFiles: true }))
      const projectId = selectedProjectData.id
      const isDevnet = selectedProjectData.config.cluster === "devnet"
      const baseDomain = isDevnet ? 'files.staging.borgpad.com' : 'files.borgpad.com'
      const baseUrl = `https://${baseDomain}/${projectId}/nft-metadata/`
      
      // Check all three required files
      const collectionMetadataUrl = `${baseUrl}collection-metadata.json`
      const nftMetadataUrl = `${baseUrl}metadata.json`
      const imageUrl = `${baseUrl}image.png`
      
      console.log("Checking files:", collectionMetadataUrl, nftMetadataUrl, imageUrl)
      
      // For JSON files, try multiple methods
      const checkJsonWithFetch = async (url: string, description: string) => {
        try {
          // Simple fetch without problematic headers
          const response = await fetch(url, { 
            method: 'GET',
            cache: 'no-store'
          })
          console.log(`${description} check with fetch:`, response.ok)
          return response.ok
        } catch (err) {
          console.log(`${description} check error with fetch:`, err)
          return false
        }
      }
      
      // For collection metadata
      const collectionPromise = checkJsonWithFetch(
        collectionMetadataUrl + `?nocache=${Date.now()}`, 
        "Collection metadata"
      )
      
      // For NFT metadata
      const metadataPromise = checkJsonWithFetch(
        nftMetadataUrl + `?nocache=${Date.now()}`, 
        "NFT metadata"
      )
      
      // For images, use Image loading (keep this as is)
      const imagePromise = new Promise<boolean>((resolve) => {
        const img = new Image()
        img.onload = () => resolve(true)
        img.onerror = () => {
          console.log("Image check error - file not found")
          resolve(false)
        }
        // Add timestamp to bypass cache
        img.src = `${imageUrl}?t=${Date.now()}`
      })
      
      // Wait for all checks to complete
      const [collectionExists, metadataExists, imageExists] = await Promise.all([
        collectionPromise,
        metadataPromise,
        imagePromise
      ])
      
      // Log direct URLs for manual verification if needed
      console.log("Direct URLs for verification:")
      console.log("- Collection metadata:", collectionMetadataUrl)
      console.log("- NFT metadata:", nftMetadataUrl)
      console.log("- Image:", imageUrl)
      
      // Update uploaded files status based on responses
      setUploadedFiles({
        collectionMetadata: collectionExists,
        metadata: metadataExists,
        image: imageExists
      })
      
      const allFilesExist = collectionExists && metadataExists && imageExists
      
      // Log results for debugging
      console.log("File check results:", {
        collectionMetadata: collectionExists,
        metadata: metadataExists,
        image: imageExists,
        allFilesExist
      })
      
      setCheckingStatus(prev => ({ ...prev, nftMetadataFiles: false }))
      return allFilesExist
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

      if (!nftConfig) {
        throw new Error("NFT config is not set. Please set up NFT config first.")
      }

      // Get the cluster from the project config
      const cluster = selectedProjectData.config.cluster || "mainnet"

      // Ensure all fields are strings
      const safeNftConfig = {
        name: String(nftConfig.name || ""),
        symbol: String(nftConfig.symbol || ""),
        description: String(nftConfig.description || ""),
        imageUrl: String(nftConfig.imageUrl || ""),
        collection: ""  // This will be filled by the backend
      }

      // Check values
      if (!safeNftConfig.name) {
        throw new Error("NFT name is required")
      }
      if (!safeNftConfig.symbol) {
        throw new Error("NFT symbol is required")
      }
      if (!safeNftConfig.imageUrl) {
        throw new Error("NFT image URL is required")
      }

      console.log("Creating NFT collection with config:", safeNftConfig)

      // Use backendApi.createNftCollection with properly formatted data
      const result = await backendApi.createNftCollection({
        projectId,
        auth,
        nftConfig: safeNftConfig,
        cluster: cluster as "mainnet" | "devnet"
      })

      // Save the transaction signature for display
      setLastNftTxSignature(result.transactionSignature)

      // Update the project with the new collection address
      if (result.collectionAddress) {
        const updatedProject = { ...selectedProjectData }
        updatedProject.config.nftConfig = {
          name: safeNftConfig.name,
          symbol: safeNftConfig.symbol,
          description: safeNftConfig.description,
          imageUrl: safeNftConfig.imageUrl,
          collection: result.collectionAddress
        }

        setValue("project", updatedProject, { shouldDirty: true })

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

    // Check tiers have start dates
    const tiersHaveStartDates = checkTiersHaveStartDates()
    setStatusResults(prev => ({ ...prev, tiersHaveStartDates }))
  }

  // New function to update NFT config after uploads
  const updateNftConfig = () => {
    if (!selectedProjectData) return

    try {
      // Create NFT config if it doesn't exist
      const updatedProject = { ...selectedProjectData }

      // Construct the image URL based on the cluster
      const isDevnet = selectedProjectData.config.cluster === "devnet"
      const baseDomain = isDevnet ? 'files.staging.borgpad.com' : 'files.borgpad.com'
      const baseUrl = `https://${baseDomain}/${selectedProjectData.id}/nft-metadata/`

      const imageUrl = baseUrl + "image.png"
      const ticker = selectedProjectData.config.launchedTokenData.ticker || "TOKEN"
      const projectTitle = selectedProjectData.info.title || "Project"

      if (!updatedProject.config.nftConfig) {
        updatedProject.config.nftConfig = {
          name: `${ticker} Liquidity Provider`,
          symbol: `bp${ticker}`,
          description: `You enabled ${projectTitle} to launch via BorgPad. This NFT is your proof, hold it to claim your rewards.`,
          imageUrl: imageUrl,
          collection: ""
        }
      } else {
        // Update the existing config
        updatedProject.config.nftConfig.name = `${ticker} Liquidity Provider`
        updatedProject.config.nftConfig.symbol = `bp${ticker}`
        updatedProject.config.nftConfig.description = `You enabled ${projectTitle} to launch via BorgPad. This NFT is your proof, hold it to claim your rewards.`
        updatedProject.config.nftConfig.imageUrl = imageUrl
      }

      // Update the form value
      setValue("project", updatedProject, { shouldDirty: true })
      setNftImageUrl(imageUrl)

      toast.info("NFT config updated - don't forget to save changes!", { theme: "colored" })

      // Re-run checks
      runAllChecks()
    } catch (error) {
      console.error("Error updating NFT config:", error)
      toast.error("Failed to update NFT config", { theme: "colored" })
    }
  }

  // Generate collection metadata JSON from NFT config
  const generateCollectionMetadata = (nftConfig: ProjectModel['config']['nftConfig']) => {
    if (!nftConfig) return null

    return {
      name: nftConfig.name,
      symbol: nftConfig.symbol,
      description: nftConfig.description,
      image: nftConfig.imageUrl,
      isCollection: true
    }
  }

  // Generate NFT metadata JSON from NFT config
  const generateNftMetadata = (nftConfig: ProjectModel['config']['nftConfig']) => {
    if (!nftConfig) return null

    return {
      name: nftConfig.name,
      symbol: nftConfig.symbol,
      description: nftConfig.description,
      image: nftConfig.imageUrl
    }
  }

  // Upload collection metadata JSON
  const uploadCollectionMetadataJson = async () => {
    if (!selectedProjectData || !isWalletConnected) return

    try {
      const nftConfig = selectedProjectData.config.nftConfig

      if (!nftConfig) {
        toast.error("NFT config not set. Please set up NFT config first.", { theme: "colored" })
        return
      }

      // Generate metadata JSON
      const metadataJson = generateCollectionMetadata(nftConfig)
      if (!metadataJson) {
        toast.error("Could not generate metadata JSON", { theme: "colored" })
        return
      }

      // Convert to JSON string and then to base64
      const jsonString = JSON.stringify(metadataJson, null, 2)
      const fileData = btoa(jsonString)

      // Get auth signature
      const message = "I confirm I am an admin by signing this message."
      const signature = Array.from(await signMessage(message))
      const auth = { address, message, signature }

      // Get the cluster from the project config
      const cluster = selectedProjectData.config.cluster || "mainnet"

      // Upload using direct R2 upload
      const response = await backendApi.uploadOnR2({
        projectId: selectedProjectData.id,
        auth,
        fileData,
        fileName: "collection-metadata.json",
        contentType: "application/json",
        folder: "nft-metadata",
        cluster: cluster as "mainnet" | "devnet",
      })

      toast.success("Collection metadata JSON uploaded successfully", { theme: "colored" })
      setUploadedFiles(prev => ({ ...prev, collectionMetadata: true }))

      // Verify files after upload
      setTimeout(() => verifyNftFiles(), 1000)
    } catch (error: unknown) {
      console.error("Error uploading collection metadata:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      toast.error(`Upload failed: ${errorMessage}`, { theme: "colored" })
    }
  }

  // Upload NFT metadata JSON
  const uploadNftMetadataJson = async () => {
    if (!selectedProjectData || !isWalletConnected) return

    try {
      const nftConfig = selectedProjectData.config.nftConfig

      if (!nftConfig) {
        toast.error("NFT config not set. Please set up NFT config first.", { theme: "colored" })
        return
      }

      // Generate metadata JSON
      const metadataJson = generateNftMetadata(nftConfig)
      if (!metadataJson) {
        toast.error("Could not generate metadata JSON", { theme: "colored" })
        return
      }

      // Convert to JSON string and then to base64
      const jsonString = JSON.stringify(metadataJson, null, 2)
      const fileData = btoa(jsonString)

      // Get auth signature
      const message = "I confirm I am an admin by signing this message."
      const signature = Array.from(await signMessage(message))
      const auth = { address, message, signature }

      // Get the cluster from the project config
      const cluster = selectedProjectData.config.cluster || "mainnet"

      // Upload using direct R2 upload
      const response = await backendApi.uploadOnR2({
        projectId: selectedProjectData.id,
        auth,
        fileData,
        fileName: "metadata.json",
        contentType: "application/json",
        folder: "nft-metadata",
        cluster: cluster as "mainnet" | "devnet",
      })

      toast.success("NFT metadata JSON uploaded successfully", { theme: "colored" })
      setUploadedFiles(prev => ({ ...prev, metadata: true }))

      // Verify files after upload
      setTimeout(() => verifyNftFiles(), 1000)
    } catch (error: unknown) {
      console.error("Error uploading NFT metadata:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      toast.error(`Upload failed: ${errorMessage}`, { theme: "colored" })
    }
  }

  // Create a new function for local file upload
  const uploadLocalImage = async (file: File) => {
    if (!selectedProjectData || !isWalletConnected) return

    try {
      if (!file) {
        toast.error("No file selected", { theme: "colored" })
        return
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File too large. Maximum size is 5MB", { theme: "colored" })
        return
      }

      // Convert to base64
      const base64 = await new Promise<string | ArrayBuffer | null>((resolve) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onloadend = () => resolve(reader.result)
      })

      if (!base64 || typeof base64 !== 'string') {
        throw new Error('Failed to convert image to base64')
      }

      toast.info("Uploading image...", { theme: "colored" })

      // Get auth signature
      const message = "I confirm I am an admin by signing this message."
      const signature = Array.from(await signMessage(message))
      const auth = { address, message, signature }

      // Get the cluster from the project config
      const cluster = selectedProjectData.config.cluster || "mainnet"

      // Upload using direct R2 upload
      const response = await backendApi.uploadOnR2({
        projectId: selectedProjectData.id,
        auth,
        fileData: base64,
        fileName: "image.png",
        contentType: file.type,
        folder: "nft-metadata",
        cluster: cluster as "mainnet" | "devnet",
      })

      toast.success("NFT image uploaded successfully", { theme: "colored" })
      setUploadedFiles(prev => ({ ...prev, image: true }))

      // Update the NFT config with the uploaded image URL
      const isDevnet = selectedProjectData.config.cluster === "devnet"
      const baseDomain = isDevnet ? 'files.staging.borgpad.com' : 'files.borgpad.com'
      const baseUrl = `https://${baseDomain}/${selectedProjectData.id}/nft-metadata/`

      const imageUrl = baseUrl + "image.png"

      // Clone the project data for modification
      const updatedProject = { ...selectedProjectData }

      // If NFT config doesn't exist, create it using the template
      if (!updatedProject.config.nftConfig) {
        const ticker = updatedProject.config.launchedTokenData.ticker || "TOKEN"
        const projectTitle = updatedProject.info.title || "Project"

        updatedProject.config.nftConfig = {
          name: `${ticker} Liquidity Provider`,
          symbol: `bp${ticker}`,
          description: `You enabled ${projectTitle} to launch via BorgPad. This NFT is your proof, hold it to claim your rewards.`,
          imageUrl: imageUrl,
          collection: ""
        }

        toast.success("NFT config created from template!", { theme: "colored" })
      } else {
        // If NFT config exists, just update the image URL
        updatedProject.config.nftConfig.imageUrl = imageUrl
      }

      // Update the form value
      setValue("project", updatedProject, { shouldDirty: true })
      setNftImageUrl(imageUrl)
      toast.info("NFT config updated - don't forget to save changes!", { theme: "colored" })

      // Verify files after upload
      setTimeout(() => verifyNftFiles(), 1000)
    } catch (error: unknown) {
      console.error("Error uploading image:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      toast.error(`Upload failed: ${errorMessage}`, { theme: "colored" })
    }
  }

  // Add function to open the modal
  const openMetadataModal = (type: 'collection' | 'nft' | 'image') => {
    setModalType(type)
    setShowMetadataModal(true)
  }

  return {
    selectProject,
    goToNextProject,
    goToPreviousProject,
    refreshData,
    runAllChecks,
    checkLbpWalletSet,
    checkUsdcTokenAccount,
    createUsdcTokenAccount,
    checkNftMetadataFiles,
    verifyNftFiles,
    checkNftConfigSet,
    checkNftCollectionMinted,
    createCollectionAddress,
    checkTiersHaveStartDates,
    updateNftConfig,
    generateCollectionMetadata,
    generateNftMetadata,
    uploadCollectionMetadataJson,
    uploadNftMetadataJson,
    uploadLocalImage,
    openMetadataModal
  }
} 