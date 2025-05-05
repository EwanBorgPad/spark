import { SimpleModal } from "../SimpleModal"
import { twMerge } from "tailwind-merge"
import { Button } from "@/components/Button/Button"
import { useTranslation } from "react-i18next"
import { backendApi } from "@/data/backendApi"
import { useWalletContext } from "@/hooks/useWalletContext"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ReferralInputField } from "@/components/InputField/ReferralInputField"
import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import { Badge } from "@/components/Badge/Badge"
import { toast } from "react-toastify"
import { eligibilityStatusCacheBust } from "@/utils/cache-helper"
import { sendTransaction } from "../../../../shared/solana/sendTransaction"

type ProvideReferralCodeModalProps = {
  onClose: () => void
  onSignToU?: () => void
  initialReferralCode?: string
}

const ProvideReferralCodeModal = ({ onClose, onSignToU, initialReferralCode }: ProvideReferralCodeModalProps) => {
  const { t } = useTranslation()
  const { address, signMessage, signTransaction, walletProvider, isConnectedWithLedger } = useWalletContext()
  const { projectId } = useParams()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [hasAcceptedToU, setHasAcceptedToU] = useState<boolean | null>(null)
  const autoSubmitAttempted = useRef(false)

  // Check if user has signed Terms of Use
  const { data: eligibilityStatus } = useQuery({
    queryKey: ["getEligibilityStatus", address, projectId],
    queryFn: () => {
      if (!address || !projectId) return null
      return backendApi.getEligibilityStatus({ address, projectId })
    },
    enabled: !!address && !!projectId,
  })

  // Get user's existing referral code
  const { data: referralData } = useQuery({
    queryKey: ["getReferralCode", address],
    queryFn: () => backendApi.getReferralCode({ address: address || "", projectId: projectId || ""}),
    enabled: !!address,
  })

  const UsereferralCode = referralData?.code || ""

  // Initialize referral code from localStorage or initialReferralCode
  const [referralCode, setReferralCode] = useState<string | null>(() => {
    if (projectId) {
      const storedCode = localStorage.getItem(`referralCode_${projectId}`)
      return storedCode || initialReferralCode || null
    }
    return initialReferralCode || null
  })

  // Function to remove referral code from URL
  const removeReferralFromUrl = () => {
    const url = new URL(window.location.href)
    if (url.searchParams.has('referral')) {
      url.searchParams.delete('referral')
      navigate(`${url.pathname}${url.search}`, { replace: true })
    }
  }

  // Save referral code to localStorage when not signed in
  useEffect(() => {
    if (referralCode && projectId && hasAcceptedToU === false) {
      localStorage.setItem(`referralCode_${projectId}`, referralCode)
    }
  }, [referralCode, projectId, hasAcceptedToU])

  // Update mutation for submitting referral code
  const {
    mutate: updateReferral,
    isPending,
    isSuccess,
  } = useMutation({
    mutationFn: async (address: string) => {
      if (!address || !referralCode || !projectId) return
      const message = t("referral.provide.message", { referralCode })
      let signature: Uint8Array
      let isLedgerTransaction = false

      if (isConnectedWithLedger) {
        if (!walletProvider) throw new Error("No wallet provider selected")
        signature = await sendTransaction(message, address, signTransaction, walletProvider)
        isLedgerTransaction = true
      } else {
        signature = await signMessage(message)
      }

      const data = {
        referralCode: referralCode,
        projectId,
        publicKey: address,
        message,
        signature: Array.from(signature),
        isLedgerTransaction,
      }

      await backendApi.postReferralCode(data)
    },
    onSuccess: () => {
      // Immediately remove the referral code from URL to prevent infinite loops
      removeReferralFromUrl()
      
      // Clear stored referral code from localStorage
      if (projectId) {
        localStorage.removeItem(`referralCode_${projectId}`)
      }
      
      // Update eligibility status to reflect the completed referral
      eligibilityStatusCacheBust.invokeCacheBusting()
      queryClient.invalidateQueries({
        queryKey: ["getEligibilityStatus", address, projectId],
      })
      
      // Close the modal
      onClose()
    },
    onError: (error) => toast.error(error.message, { theme: "colored" }),
  })

  // Process eligibility status changes and check for ToU acceptance
  useEffect(() => {
    if (!eligibilityStatus) return

    const hasToU = eligibilityStatus.compliances?.some(
      compliance => compliance.type === "ACCEPT_TERMS_OF_USE" && compliance.isCompleted
    )
    
    setHasAcceptedToU(hasToU || false)
    
    // If user has accepted ToU and we have a valid code, and we haven't tried to submit yet
    if (hasToU && projectId && address && referralCode && !autoSubmitAttempted.current) {
      // Mark that we've attempted auto-submission to prevent multiple attempts
      autoSubmitAttempted.current = true
      
      // Make sure the code isn't the user's own code and is valid
      if (referralCode !== UsereferralCode && referralCode.length > 0) {
        // Slight delay to ensure states are updated
        setTimeout(() => {
          updateReferral(address)
        }, 300)
      }
    }
  }, [eligibilityStatus, address, projectId, referralCode, UsereferralCode])

  // Function to validate referral code
  function isValidReferralCode(referralCode: string): boolean {
    return referralCode.length > 0 && UsereferralCode !== referralCode
  }

  // Navigate to Terms of Use section while preserving referral code in URL
  const scrollToJoinThePool = () => {
    // Call the parent callback to notify we're signing ToU
    if (onSignToU) {
      onSignToU();
    } else {
      onClose();
    }
    
    // Build the path while preserving the referral code in URL
    let path = `/launch-pools/${projectId}`
    
    // Get current query parameters
    const referralFromUrl = searchParams.get('referral')
    
    // If we have a referral code, add it to the path
    if (referralFromUrl) {
      path += `?referral=${referralFromUrl}`
    } else if (referralCode) {
      path += `?referral=${referralCode}`
    }
    
    // Navigate while preserving the referral code
    navigate(path)
    
    // Scroll to the ToU section
    setTimeout(() => {
      const joinThePoolElement = document.getElementById('complianceHeading')
      if (joinThePoolElement) {
        joinThePoolElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } else {
        const headings = document.querySelectorAll('h2')
        for (const heading of headings) {
          if (heading.textContent?.includes('Join the Launch Pool')) {
            heading.scrollIntoView({ behavior: 'smooth', block: 'start' })
            break
          }
        }
      }
    }, 500)
  }

  return (
    <SimpleModal showCloseBtn={true} onClose={onClose} title={t("referral.provide.heading")}>
      <div className="flex w-full max-w-[460px] flex-col items-center justify-center max-sm:h-full">
        <div className={twMerge("flex w-full grow flex-col justify-start gap-4 px-4 pb-8 pt-3 md:px-10")}>
          {hasAcceptedToU === false ? (
            <>
              <p className="text-center text-base text-fg-tertiary mb-2">
                You need to sign the Terms of Use before you can use a referral code.
                {referralCode && " We'll save this referral code and apply it automatically after you sign."}
              </p>
              <Button
                btnText="Sign Terms of Use"
                onClick={scrollToJoinThePool}
              />
            </>
          ) : (
            <>
              <p className="text-left text-base text-fg-tertiary md:text-center">
                {t("referral.provide.description")}
              </p>

              <ReferralInputField
                value={referralCode ?? ""}
                onChange={(value: string | null | { target: { value: string } }) => {
                  if (typeof value === 'string' || value === null) {
                    setReferralCode(value);
                  } else if (value && 'target' in value) {
                    setReferralCode(value.target.value);
                  }
                }}
                placeholder={t("referral.register.placeholder")}
                error={referralCode && !isValidReferralCode(referralCode) ? t("referral.invalid") : undefined}
                containerClassName="max-w-full"
              />

              {isSuccess ? (
                <div className="flex w-full justify-center">
                  <Badge.Confirmation isConfirmed={true} label={t("done")} classNames="w-fit bg-transparent border-none" />
                </div>
              ) : (
                <Button
                  disabled={!referralCode || isPending || !isValidReferralCode(referralCode)}
                  isLoading={isPending}
                  btnText={t("referral.provide.button")}
                  onClick={() => {
                    updateReferral(address)
                    // Also remove referral from URL when clicking the button manually
                    removeReferralFromUrl()
                  }}
                />
              )}
            </>
          )}
        </div>
      </div>
    </SimpleModal>
  )
}

export default ProvideReferralCodeModal