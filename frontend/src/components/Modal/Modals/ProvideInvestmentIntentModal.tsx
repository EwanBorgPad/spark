import { SimpleModal } from "../SimpleModal"
import { twMerge } from "tailwind-merge"
import { Button } from "@/components/Button/Button"
import { useTranslation } from "react-i18next"
import { backendApi } from "@/data/backendApi.ts"
import { useWalletContext } from "@/hooks/useWalletContext.tsx"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CurrencyInputField } from "@/components/InputField/CurrencyInputField.tsx"
import { useState } from "react"
import { useParams } from "react-router-dom"
import { InvestmentIntentRequest } from "../../../../shared/models.ts"

type ProvideInvestmentIntentModalProps = {
  onClose: () => void
}
const ProvideInvestmentIntentModal = ({ onClose }: ProvideInvestmentIntentModalProps) => {
  const { t } = useTranslation()
  const { address, signMessage } = useWalletContext()
  const { projectId } = useParams()
  const queryClient = useQueryClient()

  const [amount, setAmount] = useState(0)

  const {
    mutate: provideInvestmentIntent,
    isPending,
  } = useMutation({
    mutationFn: async (address: string) => {
      if (!projectId) return

      const message = t('investment.intent.quest.message', { amount, projectId })

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
    },
  })

  return (
    <SimpleModal showCloseBtn={true} onClose={onClose}>
      <div className="flex w-full max-w-[460px] flex-col items-center justify-center max-sm:h-full">
        {/* Heading */}
        <div className="w-full p-4 text-center">
          <h1 className="text-body-xl-semibold text-white">
            {t('investment.intent.quest.heading')}
          </h1>
        </div>
        {/* Body */}
        <div
          className={twMerge(
            "flex w-full grow flex-col justify-start gap-5 px-10 pb-8 pt-3",
          )}
        >
          <p className="text-center text-base text-fg-tertiary">
            {t('investment.intent.quest.description')}
          </p>
          <CurrencyInputField
            maxLength={12}
            containerClassName='max-w-[999px]'
            inputClassName='bg-emphasis text-white'
            value={amount}
            onChange={(e) => setAmount(Number(e) || 0)}
          />
          <Button
            isLoading={isPending}
            btnText={t('investment.intent.quest.modal.button')}
            onClick={() => provideInvestmentIntent(address)}
          />
        </div>
      </div>
    </SimpleModal>
  )
}

export default ProvideInvestmentIntentModal
