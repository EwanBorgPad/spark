import { SimpleModal } from "../SimpleModal"
import { twMerge } from "tailwind-merge"
import { Button } from "@/components/Button/Button"
import { Badge } from "@/components/Badge/Badge"
import { useTranslation } from "react-i18next"
import { backendApi } from "@/data/backendApi.ts"
import { useWalletContext } from "@/hooks/useWalletContext.tsx"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import CheckboxField from "@/components/InputField/CheckboxField.tsx"
import { useState } from "react"
import { toast } from "react-toastify"
import { useParams } from "react-router-dom"
import { eligibilityStatusCacheBust } from "@/utils/cache-helper"

type AcceptTermsOfUseModalProps = {
  onClose: () => void
}
const AcceptTermsOfUseModal = ({ onClose }: AcceptTermsOfUseModalProps) => {
  const { t } = useTranslation()
  const { address, signMessage } = useWalletContext()
  const { projectId } = useParams()
  const queryClient = useQueryClient()

  const {
    mutate: acceptTermsOfUse,
    isPending,
    isSuccess,
  } = useMutation({
    mutationFn: async (address: string) => {
      const message = t("accept.terms.of.use.quest.message")
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
      eligibilityStatusCacheBust.invokeCacheBusting()
      queryClient.invalidateQueries({
        queryKey: ["getEligibilityStatus", address, projectId],
      })
      window.safary?.track({
        eventType: "accept-terms-of-use",
        eventName: "1-accept terms of use",
        parameters: {
          walletAddress: address as string,
          toProject: projectId as string,
        },
      })
      onClose()
    },
    onError: (error) => toast.error(error.message, { theme: "colored" }),
  })

  const [isConfirmed, setIsConfirmed] = useState(false)

  return (
    <SimpleModal showCloseBtn={true} onClose={onClose} title={t("accept.terms.of.use.quest.heading")}>
      <div className="relative flex w-full max-w-[520px] flex-col items-center justify-center max-sm:h-full">
        <>
          {/* Body */}
          <div className={twMerge("flex w-full grow flex-col justify-start gap-5 px-4 pb-8 pt-3 md:px-10")}>
            <p className="whitespace-pre-wrap text-center text-sm text-fg-tertiary md:text-base">
              No representation or warranty is made concerning any aspect of the BorgPad Protocol, including its
              suitability, quality, availability, accessibility, accuracy or safety. As more fully explained in the
              <a className="text-fg-success-primary" href={"/terms-of-use"} target="_blank" rel="noreferrer">
                {" "}
                Terms of Use
              </a>
              , your access to and use of the BorgPad Protocol through this Interface is entirely at your own risk and
              could lead to substantial losses, for which you take full responsibility.
              <br />
              <br />
              This Interface is not available to residents of Belarus, Burundi, the Central African Republic, the
              Democratic Republic of Congo, the Democratic People&#039;s Republic of Korea, the temporarily occupied
              regions of Ukraine, Cuba, Iran, Libya, the People&#039;s Republic of China, the Russian Federation,
              Somalia, Sudan, South Sudan, Syria, the United States of America, Venezuela, Yemen, and Zimbabwe or any
              other jurisdiction in which accessing or using the BorgPad Protocol is prohibited (“Prohibited
              Jurisdictions”). In using this Interface, you confirm that you are not located in, incorporated or
              otherwise established in, or resident of, a Prohibited Jurisdiction.
            </p>
            <CheckboxField
              inputClassName="text-white!"
              label={
                <p className="text-fg-secondary">
                  I confirm that I have read, understand and accept the{" "}
                  <a className="text-fg-success-primary" href={"/terms-of-use"} target="_blank" rel="noreferrer">
                    Terms of Use
                  </a>
                </p>
              }
              value={isConfirmed}
              onChange={setIsConfirmed}
            />
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
                disabled={!isConfirmed}
                isLoading={isPending}
                btnText={t("accept.terms.of.use.quest.modal.button")}
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
