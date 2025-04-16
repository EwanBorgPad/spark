import { SimpleModal } from "../SimpleModal"
import { twMerge } from "tailwind-merge"
import { Button } from "@/components/Button/Button"
import { useTranslation } from "react-i18next"
import { backendApi } from "@/data/backendApi"
import { useWalletContext } from "@/hooks/useWalletContext"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ReferralInputField } from "@/components/InputField/ReferralInputField"
import React, { useState } from "react"
import { useParams } from "react-router-dom"
import { Badge } from "@/components/Badge/Badge"
import { toast } from "react-toastify"
import { eligibilityStatusCacheBust } from "@/utils/cache-helper"
import { sendTransaction } from "../../../../shared/solana/sendTransaction"

type ProvideReferralCodeModalProps = {
  onClose: () => void
}

const ProvideReferralCodeModal = ({ onClose }: ProvideReferralCodeModalProps) => {
  const { t } = useTranslation()
  const { address, signMessage, signTransaction, walletProvider, isConnectedWithLedger } = useWalletContext()
  const { projectId } = useParams()
  const queryClient = useQueryClient()

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
        referrerTwitterHandle: referralCode,
        projectId,
        publicKey: address,
        message,
        signature: Array.from(signature),
        isLedgerTransaction,
      }

      await backendApi.postReferral(data)
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

  const [referralCode, setReferralCode] = useState<string | null>(null)


  function isValidReferralCode(referralCode: string): boolean {
    return referralCode.length > 0
  }

  return (
    <SimpleModal showCloseBtn={true} onClose={onClose} title={t("referral.provide.heading")}>
      <div className="flex w-full max-w-[460px] flex-col items-center justify-center max-sm:h-full">
        <div className={twMerge("flex w-full grow flex-col justify-start gap-4 px-4 pb-8 pt-3 md:px-10")}>
          <p className="text-left text-base text-fg-tertiary md:text-center">
            {t("referral.provide.heading")}
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
        </div>
      </div>
    </SimpleModal>
  )
}

export default ProvideReferralCodeModal 