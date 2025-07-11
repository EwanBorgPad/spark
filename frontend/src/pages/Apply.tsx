import { ScrollRestoration, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { twMerge } from "tailwind-merge"
import { Button } from "@/components/Button/Button"
import { Input } from "@/components/Input/Input"
import { Icon } from "@/components/Icon/Icon"
import { SimpleModal } from "@/components/Modal/SimpleModal"
import { backendApi, DaoResponse } from "@/data/api/backendApi"
import { ROUTES } from "@/utils/routes"
import { toast } from "react-toastify"
import Img from "@/components/Image/Img"
import { GitHubAuth, GitHubAuthData } from "@/utils/githubAuth"

type ApplicationFormData = {
  deliverableName: string
  requestedPrice: string
  estimatedDeadline: string
  featureDescription: string
  solanaWalletAddress: string
}

const Apply = () => {
  const navigate = useNavigate()
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false)
  const [selectedDao, setSelectedDao] = useState<DaoResponse | null>(null)
  const [applicationForm, setApplicationForm] = useState<ApplicationFormData>({
    deliverableName: "",
    requestedPrice: "",
    estimatedDeadline: "",
    featureDescription: "",
    solanaWalletAddress: "",
  })
  const [rulesAccepted, setRulesAccepted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [githubAuth, setGithubAuth] = useState<GitHubAuthData | null>(null)
  const [isHandlingCallback, setIsHandlingCallback] = useState(false)

  // Check if user is authenticated with GitHub
  const isGitHubAuthenticated = githubAuth !== null

  // Check for stored GitHub auth on component mount
  useEffect(() => {
    const storedAuth = GitHubAuth.getStoredAuth()
    if (storedAuth) {
      setGithubAuth(storedAuth)
    }
  }, [])

  // Handle OAuth callback
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      const state = urlParams.get('state')
      
      if (code && state) {
        setIsHandlingCallback(true)
        try {
          const authData = await GitHubAuth.handleCallback(code, state)
          setGithubAuth(authData)
          toast.success(`Welcome, ${authData.user.username}!`)
          
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname)
        } catch (error) {
          console.error('GitHub OAuth callback error:', error)
          toast.error((error as Error).message || 'GitHub authentication failed')
        } finally {
          setIsHandlingCallback(false)
        }
      }
    }

    handleOAuthCallback()
  }, [])

  // Fetch all DAOs
  const { data: daosData, isLoading: isLoadingDaos } = useQuery({
    queryKey: ['daos-for-apply'],
    queryFn: () => backendApi.getDaos(),
    enabled: true,
  })

  // Handle GitHub authentication
  const handleGitHubAuth = () => {
    GitHubAuth.login()
  }

  // Handle opening application modal
  const handleApplyClick = (dao: DaoResponse) => {
    if (!isGitHubAuthenticated) {
      toast.error("Please authenticate with GitHub first")
      return
    }
    setSelectedDao(dao)
    setIsApplicationModalOpen(true)
  }

  // Handle form input changes
  const handleInputChange = (field: keyof ApplicationFormData, value: string) => {
    setApplicationForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Handle form submission
  const handleSubmitApplication = async () => {
    if (!selectedDao || !isGitHubAuthenticated || !githubAuth) return
    
    // Validate form
    if (!applicationForm.deliverableName || 
        !applicationForm.requestedPrice || 
        !applicationForm.estimatedDeadline || 
        !applicationForm.featureDescription || 
        !applicationForm.solanaWalletAddress) {
      toast.error("Please fill in all required fields")
      return
    }

    if (!rulesAccepted) {
      toast.error("Please accept the required rules")
      return
    }

    setIsSubmitting(true)
    
    try {
      await backendApi.submitApplication({
        projectId: selectedDao.id,
        githubUsername: githubAuth.user.username,
        githubId: githubAuth.user.id,
        deliverableName: applicationForm.deliverableName,
        requestedPrice: parseFloat(applicationForm.requestedPrice),
        estimatedDeadline: applicationForm.estimatedDeadline,
        featureDescription: applicationForm.featureDescription,
        solanaWalletAddress: applicationForm.solanaWalletAddress,
      })

      toast.success("Application submitted successfully!")
      setIsApplicationModalOpen(false)
      resetForm()
    } catch (error) {
      console.error("Application submission error:", error)
      toast.error((error as Error).message || "Failed to submit application")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reset form
  const resetForm = () => {
    setApplicationForm({
      deliverableName: "",
      requestedPrice: "",
      estimatedDeadline: "",
      featureDescription: "",
      solanaWalletAddress: "",
    })
    setRulesAccepted(false)
  }

  // Handle modal close
  const handleModalClose = () => {
    setIsApplicationModalOpen(false)
    setSelectedDao(null)
    resetForm()
  }

  if (isHandlingCallback) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-accent">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-fg-primary text-lg">Completing GitHub authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-accent text-fg-primary">
      <ScrollRestoration />
      
      {/* Header */}
      <div className="bg-accent border-b border-fg-primary/10 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-brand-primary">Developer Applications</h1>
              <p className="text-fg-secondary">Apply to build for active DAOs and get funded</p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate(ROUTES.PROJECTS)}
                color="secondary"
                size="sm"
              >
                Back to Projects
              </Button>
              {!isGitHubAuthenticated ? (
                <Button
                  onClick={handleGitHubAuth}
                  className="bg-gray-800 hover:bg-gray-700 text-white"
                  size="sm"
                >
                  <Icon icon="SvgExternalLink" className="w-4 h-4 mr-2" />
                  Connect GitHub
                </Button>
              ) : (
                <div className="flex items-center gap-2 text-sm text-fg-secondary">
                  <Icon icon="SvgExternalLink" className="w-4 h-4" />
                  <span>Connected: {githubAuth?.user.username}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* GitHub Authentication Notice */}
        {!isGitHubAuthenticated && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-8">
            <div className="flex items-center gap-3">
              <Icon icon="SvgQuestionCircle" className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-yellow-500 font-medium">GitHub Authentication Required</p>
                <p className="text-fg-secondary text-sm">
                  You need to authenticate with GitHub to apply to DAOs. This helps us verify your developer credentials.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* DAOs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoadingDaos ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-bg-secondary rounded-lg p-6 animate-pulse">
                <div className="w-16 h-16 bg-fg-primary/10 rounded-lg mb-4"></div>
                <div className="h-4 bg-fg-primary/10 rounded mb-2"></div>
                <div className="h-3 bg-fg-primary/10 rounded mb-4"></div>
                <div className="h-8 bg-fg-primary/10 rounded"></div>
              </div>
            ))
          ) : (
            daosData?.daos?.map((dao) => (
              <div key={dao.id} className="bg-bg-secondary rounded-lg p-6 hover:bg-bg-secondary/80 transition-colors">
                <div className="flex items-center gap-4 mb-4">
                  <Img
                    src={dao.imageUrl || '/images/default-dao-logo.png'}
                    alt={dao.name}
                    imgClassName="w-16 h-16 rounded-lg"
                  />
                  <div>
                    <h3 className="font-semibold text-fg-primary">{dao.name}</h3>
                    <p className="text-sm text-fg-secondary">DeFi</p>
                  </div>
                </div>
                
                <p className="text-fg-secondary text-sm mb-4 line-clamp-3">
                  {dao.name} - An active DAO seeking talented developers to build innovative solutions
                </p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-fg-secondary">Available Funds:</span>
                    <span className="text-fg-primary font-medium">
                      $100,000
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-fg-secondary">Chain:</span>
                    <span className="text-fg-primary">Solana</span>
                  </div>
                </div>
                
                <Button
                  onClick={() => handleApplyClick(dao)}
                  className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white"
                  disabled={!isGitHubAuthenticated}
                >
                  Apply
                </Button>
              </div>
            ))
          )}
        </div>

        {daosData?.daos?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-fg-secondary text-lg">No active DAOs available for applications at the moment.</p>
          </div>
        )}
      </div>

      {/* Application Modal */}
      <SimpleModal
        isOpen={isApplicationModalOpen}
        onClose={handleModalClose}
        title={`Apply to ${selectedDao?.name}`}
        className="max-w-2xl"
      >
        <div className="space-y-6">
          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-fg-primary mb-2">
                Deliverable Name *
              </label>
              <Input
                value={applicationForm.deliverableName}
                onChange={(e) => handleInputChange('deliverableName', e.target.value)}
                placeholder="e.g., Mobile App, Web Dashboard, Smart Contract"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-fg-primary mb-2">
                Requested Price (USD) *
              </label>
              <Input
                type="number"
                value={applicationForm.requestedPrice}
                onChange={(e) => handleInputChange('requestedPrice', e.target.value)}
                placeholder="e.g., 50000"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-fg-primary mb-2">
                Estimated Deadline *
              </label>
              <Input
                value={applicationForm.estimatedDeadline}
                onChange={(e) => handleInputChange('estimatedDeadline', e.target.value)}
                placeholder="e.g., 3 months, 6 weeks, Q2 2024"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-fg-primary mb-2">
                Feature Description *
              </label>
              <textarea
                value={applicationForm.featureDescription}
                onChange={(e) => handleInputChange('featureDescription', e.target.value)}
                placeholder="Describe the features and functionality you plan to build..."
                className="w-full h-32 px-3 py-2 bg-bg-secondary border border-fg-primary/20 rounded-md text-fg-primary resize-none"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-fg-primary mb-2">
                Solana Wallet Address *
              </label>
              <Input
                value={applicationForm.solanaWalletAddress}
                onChange={(e) => handleInputChange('solanaWalletAddress', e.target.value)}
                placeholder="Your Solana wallet address for receiving payments"
                className="w-full"
              />
            </div>
          </div>

          {/* Rules Section */}
          <div className="bg-bg-secondary/50 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-fg-primary">Required Rules</h4>
            <div className="space-y-2 text-sm text-fg-secondary">
              <div className="flex items-start gap-2">
                <Icon icon="SvgCircledCheckmark" className="w-4 h-4 text-brand-primary mt-0.5" />
                <span>Code must be open source</span>
              </div>
              <div className="flex items-start gap-2">
                <Icon icon="SvgCircledCheckmark" className="w-4 h-4 text-brand-primary mt-0.5" />
                <span>You must host the product V1</span>
              </div>
              <div className="flex items-start gap-2">
                <Icon icon="SvgCircledCheckmark" className="w-4 h-4 text-brand-primary mt-0.5" />
                <span>Initial maintenance must be provided by the developer</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <input
                type="checkbox"
                id="rulesAccepted"
                checked={rulesAccepted}
                onChange={(e) => setRulesAccepted(e.target.checked)}
                className="w-4 h-4 text-brand-primary"
              />
              <label htmlFor="rulesAccepted" className="text-sm text-fg-primary">
                I accept and agree to follow all the required rules
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleModalClose}
              color="secondary"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitApplication}
              className="flex-1 bg-brand-primary hover:bg-brand-primary/90 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </div>
      </SimpleModal>
    </div>
  )
}

export default Apply 