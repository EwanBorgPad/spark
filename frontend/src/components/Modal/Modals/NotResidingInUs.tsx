import React, { useState } from "react"
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
  const { address } = useWalletContext()
  const queryClient = useQueryClient()

  const {
    mutate: confirmResidency,
    isPending,
    isSuccess,
  }= useMutation({
    mutationFn: (address: string) => backendApi.confirmResidency({ address }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getWhitelistingStatus", address], })
    },
  })

  const resetAcknowledgment = () => {
    // TODO @acknowledgment reset if needed
  }

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
              <>
                <div className="flex w-full justify-center">
                  <Badge.Confirmation
                    isConfirmed={true}
                    label={"Location Confirmed"}
                    classNames="w-fit bg-transparent border-none"
                  />
                </div>
                <Button
                  color="plain"
                  size="xs"
                  btnText="Reset"
                  className="absolute right-4 top-4 px-2 py-1"
                  onClick={resetAcknowledgment}
                />
              </>
            ) : (
              <Button
                isLoading={isPending}
                btnText={"I Acknowledge That I am Not a US Resident"}
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
