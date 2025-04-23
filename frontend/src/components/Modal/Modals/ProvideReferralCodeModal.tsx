import { SimpleModal } from "../SimpleModal"
import { twMerge } from "tailwind-merge"
import { Button } from "@/components/Button/Button"
import { useTranslation } from "react-i18next"
import { backendApi } from "@/data/backendApi"
import { useWalletContext } from "@/hooks/useWalletContext"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ReferralInputField } from "@/components/InputField/ReferralInputField"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Badge } from "@/components/Badge/Badge"
import { toast } from "react-toastify"
import { eligibilityStatusCacheBust } from "@/utils/cache-helper"
import { sendTransaction } from "../../../../shared/solana/sendTransaction"
import { useProjectDataContext } from "@/hooks/useProjectData"

type ProvideReferralCodeModalProps = {
  onClose: () => void
  initialReferralCode?: string
}

const ProvideReferralCodeModal = ({ onClose, initialReferralCode }: ProvideReferralCodeModalProps) => {
  const { t } = useTranslation()
  const { address, signMessage, signTransaction, walletProvider, isConnectedWithLedger } = useWalletContext()
  const { projectId } = useParams()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { projectData } = useProjectDataContext()
  const projectType = projectData?.info.projectType || "goat"
  const [hasAcceptedToU, setHasAcceptedToU] = useState<boolean | null>(null)

  // Check if user has signed Terms of Use
  const { data: eligibilityStatus } = useQuery({
    queryKey: ["getEligibilityStatus", address, projectId],
    queryFn: () => {
      if (!address || !projectId) return null
      return backendApi.getEligibilityStatus({ address, projectId })
    },
    enabled: !!address && !!projectId,
  })

  useEffect(() => {
    if (eligibilityStatus) {
      const hasToU = eligibilityStatus.compliances?.some(
        compliance => compliance.type === "ACCEPT_TERMS_OF_USE" && compliance.isCompleted
      )
      setHasAcceptedToU(hasToU || false)
    }
  }, [eligibilityStatus])

  const scrollToJoinThePool = () => {
    onClose()
    navigate(`/${projectType}-pools/${projectId}`)
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
      eligibilityStatusCacheBust.invokeCacheBusting()
      queryClient.invalidateQueries({
        queryKey: ["getEligibilityStatus", address, projectId],
      })
      onClose()
    },
    onError: (error) => toast.error(error.message, { theme: "colored" }),
  })

  const { data: referralData } = useQuery({
    queryKey: ["getReferralCode", address],
    queryFn: () => backendApi.getReferralCode({ address: address || "" , projectId: projectId || ""}),
    enabled: !!address,
  })

  const UsereferralCode = referralData?.code || ""

  const [referralCode, setReferralCode] = useState<string | null>(initialReferralCode || null)


  function isValidReferralCode(referralCode: string): boolean {
    return referralCode.length > 0 && UsereferralCode!==referralCode
  }

  return (
    <SimpleModal showCloseBtn={true} onClose={onClose} title={t("referral.provide.heading")}>
      <div className="flex w-full max-w-[460px] flex-col items-center justify-center max-sm:h-full">
        <div className={twMerge("flex w-full grow flex-col justify-start gap-4 px-4 pb-8 pt-3 md:px-10")}>
          {hasAcceptedToU === false ? (
            <>
              <p className="text-center text-base text-fg-tertiary mb-2">
                You need to sign the Terms of Use before you can use a referral code.
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
                  onClick={() => updateReferral(address)}
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