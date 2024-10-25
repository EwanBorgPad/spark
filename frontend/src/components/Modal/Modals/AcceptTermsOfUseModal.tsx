import { SimpleModal } from "../SimpleModal"
import { twMerge } from "tailwind-merge"
import { Button } from "@/components/Button/Button"
import { Badge } from "@/components/Badge/Badge"
import { useTranslation } from "react-i18next"
import { backendApi } from "@/data/backendApi.ts"
import { useWalletContext } from "@/hooks/useWalletContext.tsx"
import { useMutation, useQueryClient } from "@tanstack/react-query"

type AcceptTermsOfUseModalProps = {
  onClose: () => void
}
const AcceptTermsOfUseModal = ({ onClose }: AcceptTermsOfUseModalProps) => {
  const { t } = useTranslation()
  const { address, signMessage } = useWalletContext()
  const queryClient = useQueryClient()

  const {
    mutate: acceptTermsOfUse,
    isPending,
    isSuccess,
  } = useMutation({
    mutationFn: async (address: string) => {
      const message = t('accept.terms.of.use.quest.message')
      const signature = await signMessage(message)

      const data = {
        publicKey: address,
        // TODO no nonce or expiration, possibly a security concern
        message,
        signature: Array.from(signature),
      }

      await backendApi.postAcceptTermsOfUse(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["getEligibilityStatus", address],
      })
    },
  })

  return (
    <SimpleModal showCloseBtn={true} onClose={onClose}>
      <div className="flex w-full max-w-[460px] flex-col items-center justify-center max-sm:h-full">
        <>
          {/* Heading */}
          <div className="w-full p-4 text-center">
            <h1 className="text-body-xl-semibold text-white">
              {t("accept.terms.of.use.quest.heading")}
            </h1>
          </div>
          {/* Body */}
          <div
            className={twMerge(
              "flex w-full grow flex-col justify-start gap-5 px-10 pb-8 pt-3",
            )}
          >
            <p className="text-center text-base text-fg-tertiary">
              {t("accept.terms.of.use.quest.description")}
            </p>
            {isSuccess ? (
              <div className="flex w-full justify-center">
                <Badge.Confirmation
                  isConfirmed={true}
                  label={"Terms Accepted"}
                  classNames="w-fit bg-transparent border-none"
                />
              </div>
            ) : (
              <Button
                isLoading={isPending}
                btnText={t('accept.terms.of.use.quest.modal.button')}
                onClick={() => acceptTermsOfUse(address)}
              />
            )}
          </div>
        </>
      </div>
    </SimpleModal>
  )
}

export default AcceptTermsOfUseModal

// TODO search and remove getWhitelistingStatus from everywhere
