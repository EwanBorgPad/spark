import { SimpleModal } from "../SimpleModal"
import { twMerge } from "tailwind-merge"
import { Button } from "@/components/Button/Button"
import { Badge } from "@/components/Badge/Badge"
import { useTranslation } from "react-i18next"
import { backendApi } from "@/data/backendApi.ts"
import { useWalletContext } from "@/hooks/useWalletContext.tsx"
import { useMutation, useQueryClient } from "@tanstack/react-query"

type NotResidingInUsModalProps = {
  onClose: () => void
}

const NotResidingInUsModal = ({ onClose }: NotResidingInUsModalProps) => {
  const { t } = useTranslation()
  const { address, signMessage } = useWalletContext()
  const queryClient = useQueryClient()

  const message = "I Acknowledge That I am Not a US Resident"

  const {
    mutate: confirmResidency,
    isPending,
    isSuccess,
  } = useMutation({
    mutationFn: async (address: string) => {
      const signature = await signMessage(message)

      const data = {
        publicKey: address,
        // TODO no nonce or expiration, possibly a security concern
        message,
        signature: Array.from(signature),
      }

      await backendApi.confirmResidency(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["getWhitelistingStatus", address],
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
              {t("whitelisting.us_residency")}
            </h1>
          </div>
          {/* Body */}
          <div
            className={twMerge(
              "flex w-full grow flex-col justify-start gap-5 px-10 pb-8 pt-3",
            )}
          >
            <p className="text-center text-base text-fg-tertiary">
              {t("whitelisting.not_available_in_us")}
            </p>
            {isSuccess ? (
              <div className="flex w-full justify-center">
                <Badge.Confirmation
                  isConfirmed={true}
                  label={"Location Confirmed"}
                  classNames="w-fit bg-transparent border-none"
                />
              </div>
            ) : (
              <Button
                isLoading={isPending}
                btnText={message}
                onClick={() => confirmResidency(address)}
              />
            )}
          </div>
        </>
      </div>
    </SimpleModal>
  )
}

export default NotResidingInUsModal
