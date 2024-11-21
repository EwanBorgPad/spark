import { useState } from "react"
import { TextField } from "../InputField/TextField"
import { twMerge } from "tailwind-merge"
import { Button } from "../Button/Button"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { backendApi } from "@/data/backendApi.ts"
import { toast } from "react-toastify"
import { useParams } from "react-router-dom"
import { useWalletContext } from "@/hooks/useWalletContext.tsx"
import { useTranslation } from "react-i18next"

const EnterReferralCode = () => {
  const { t } = useTranslation()
  const { projectId } = useParams()
  const { address, signMessage } = useWalletContext()
  const queryClient = useQueryClient()

  const [twitterHandle, setTwitterHandle] = useState("")
  const [isFocused, setIsFocused] = useState(false)

  const {
    mutate: submitReferral,
    isPending,
  } = useMutation({
    mutationFn: async () => {
      if (!projectId || !twitterHandle) return

      const message = t("referral.message", {
        projectId,
        twitterHandle,
      })

      const signature = await signMessage(message)

      const data = {
        referrerTwitterHandle: `@${twitterHandle}`,
        projectId,

        publicKey: address,
        message,
        signature: Array.from(signature),
      }

      await backendApi.postReferral(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["getEligibilityStatus", address, projectId],
      })
    },
    onError: (error) => toast.error(error.message, { theme: "colored" }),
  })

  const isBtnDisplayed = isFocused || twitterHandle

  return (
    <div className="mt-2 flex items-center gap-2">
      <div className="relative flex w-full">
        <TextField
          containerClassName=""
          inputClassName={isBtnDisplayed ? "pl-[21px]" : ""}
          value={twitterHandle}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={(e) => setTwitterHandle(e.target.value)}
          placeholder={!isFocused ? "Enter your referrer's X handle" : ""}
        />
        <div
          className={twMerge(
            "absolute left-2 top-0 hidden h-10 items-center text-fg-primary transition-opacity",
            isBtnDisplayed && "flex",
          )}
        >
          @
        </div>
      </div>
      {
        <Button
          onClick={() => submitReferral()}
          isLoading={isPending}
          disabled={isBtnDisplayed ? false : true}
          className={twMerge(
            isBtnDisplayed ? "opacity-100" : "!hover:cursor-default !cursor-default opacity-0 hover:opacity-0",
          )}
          btnText="Submit"
          size="sm"
        />
      }
    </div>
  )
}

export default EnterReferralCode
