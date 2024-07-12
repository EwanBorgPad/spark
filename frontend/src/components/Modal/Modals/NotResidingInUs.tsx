import React, { useState } from "react"
import { SimpleModal } from "../SimpleModal"
import { twMerge } from "tailwind-merge"
import { Button } from "@/components/Button/Button"
import { Badge } from "@/components/Badge/Badge"
import { useTranslation } from "react-i18next"

type NotResidingInUsModalProps = {
  onClose: () => void
}

const NotResidingInUsModal = ({ onClose }: NotResidingInUsModalProps) => {
  const [acknowledged, setAcknowledgement] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { t } = useTranslation()

  const acknowledgeResidencyHandler = () => {
    setIsLoading(true)
    setTimeout(() => {
      setAcknowledgement(true)
      setIsLoading(false)
    }, 1000)
  }

  const resetAcknowledgment = () => {
    setAcknowledgement(false)
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
            {acknowledged ? (
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
                isLoading={isLoading}
                btnText={"I Acknowledge That I am Not a US Resident"}
                onClick={acknowledgeResidencyHandler}
              />
            )}
          </div>
        </>
      </div>
    </SimpleModal>
  )
}

export default NotResidingInUsModal
