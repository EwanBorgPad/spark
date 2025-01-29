import { SimpleModal } from "../SimpleModal"
import { twMerge } from "tailwind-merge"
import { Button } from "@/components/Button/Button"
import { useTranslation } from "react-i18next"
import { backendApi } from "@/data/backendApi.ts"
import { useWalletContext } from "@/hooks/useWalletContext.tsx"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CurrencyInputField } from "@/components/InputField/CurrencyInputField.tsx"
import React, { useState } from "react"
import { useParams } from "react-router-dom"
import { InvestmentIntentRequest } from "../../../../shared/models.ts"
import { Badge } from "@/components/Badge/Badge.tsx"
import { toast } from "react-toastify"
import { useProjectDataContext } from "@/hooks/useProjectData.tsx"

type ProvideInvestmentIntentModalProps = {
  onClose: () => void
}
const ProvideInvestmentIntentModal = ({ onClose }: ProvideInvestmentIntentModalProps) => {
  const { t } = useTranslation()
  const { address, signMessage } = useWalletContext()
  const { projectData } = useProjectDataContext()
  const { projectId } = useParams()
  const queryClient = useQueryClient()

  const [amount, setAmount] = useState<null | number>(null)

  const maxInvestment = projectData?.info.tiers[0].benefits.maxInvestment || 0

  const { data: investmentSummaryData } = useQuery({
    queryFn: () =>
      backendApi.getInvestmentIntentSummary({
        projectId: projectId!,
      }),
    queryKey: ["getInvestmentIntentSummary", projectId],
    enabled: Boolean(projectId),
    staleTime: 30 * 60 * 1000,
  })

  const {
    mutate: provideInvestmentIntent,
    isPending,
    isSuccess,
  } = useMutation({
    mutationFn: async (address: string) => {
      if (!projectId || !amount) return

      const message = t("investment.intent.quest.message", {
        amount,
        projectId,
      })

      const signature = await signMessage(message)

      const data: InvestmentIntentRequest = {
        // TODO no nonce or expiration, possibly a security concern
        publicKey: address,
        projectId,
        amount: String(amount),
        message,
        signature: Array.from(signature),
      }

      await backendApi.postInvestmentIntent(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["getEligibilityStatus", address, projectId],
      })
      queryClient.invalidateQueries({
        queryKey: ["getInvestmentIntentSummary", projectId],
      })
    },
    onError: (error) => toast.error(error.message, { theme: "colored" }),
  })

  return (
    <SimpleModal showCloseBtn={true} onClose={onClose} title={t("investment.intent.quest.heading")}>
      <div className="flex w-full max-w-[460px] flex-col items-center justify-center max-sm:h-full">
        {/* Body */}
        <div className={twMerge("flex w-full grow flex-col justify-start gap-4 px-4 pb-8 pt-3 md:px-10")}>
          <div>
            <p className="text-left text-base text-fg-tertiary md:text-center">
              {t("investment.intent.quest.description")}
            </p>
            <CurrencyInputField
              maxLength={12}
              containerClassName="max-w-[999px]"
              inputClassName="bg-emphasis text-white"
              placeholder={`Enter amount in USDC (e.g. ${maxInvestment})`}
              value={amount ?? undefined}
              maxValue={Number(maxInvestment)}
              onChange={(e) => setAmount(Number(e) || 0)}
            />
          </div>

          {/* average investment intent container */}
          <div className="flex flex-col items-center">
            <span className="w-full text-left text-sm text-fg-tertiary md:text-center">
              {t("average_commitment_from_users", {
                avg: investmentSummaryData?.avg.toFixed(2),
                count: investmentSummaryData?.count,
              })}
            </span>
          </div>

          {isSuccess ? (
            <div className="flex w-full justify-center">
              <Badge.Confirmation isConfirmed={true} label={t("done")} classNames="w-fit bg-transparent border-none" />
            </div>
          ) : (
            <Button
              disabled={!amount || isPending}
              isLoading={isPending}
              btnText={t("investment.intent.quest.modal.button")}
              onClick={() => provideInvestmentIntent(address)}
            />
          )}
        </div>
      </div>
    </SimpleModal>
  )
}

export default ProvideInvestmentIntentModal
