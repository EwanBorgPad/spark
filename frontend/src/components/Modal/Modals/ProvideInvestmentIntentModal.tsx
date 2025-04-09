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
import { eligibilityStatusCacheBust, investmentIntentSummaryCacheBust } from "@/utils/cache-helper.ts"
import { Icon } from "@/components/Icon/Icon.tsx"
import Img from "@/components/Image/Img.tsx"
import telegramBorgpadOGs from "@/assets/telegram-borgpad-ogs.jpg"
import { BORGPAD_TELEGRAM_URL } from "@/utils/constants.ts"

type ProvideInvestmentIntentModalProps = {
  onClose: () => void
}
export const ProvideInvestmentIntentModal = ({ onClose }: ProvideInvestmentIntentModalProps) => {
  const { t } = useTranslation()
  const { address, signMessage } = useWalletContext()
  const { projectData } = useProjectDataContext()
  const { projectId } = useParams()
  const queryClient = useQueryClient()

  const [amount, setAmount] = useState<null | number>(null)
  const [showJoinCommunityCta, setShowJoinCommunityCta] = useState(false)
  const [userExpressedInterest, setUserExpressedInterest] = useState(false)

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

  const investmentIntentSuccessHandler = () => {
    eligibilityStatusCacheBust.invokeCacheBusting()
    investmentIntentSummaryCacheBust.invokeCacheBusting()
    queryClient.invalidateQueries({
      queryKey: ["getEligibilityStatus", address, projectId],
    })
    queryClient.invalidateQueries({
      queryKey: ["getInvestmentIntentSummary", projectId],
    })
  }

  const onCloseHandler = () => {
    if (userExpressedInterest) {
      investmentIntentSuccessHandler()
    }
    onClose()
  }

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
      setUserExpressedInterest(true)
      const userAlreadyClickedOnTelegramUrl = localStorage.getItem("clickedOnTelegramUrl")
      if (!userAlreadyClickedOnTelegramUrl) {
        setShowJoinCommunityCta(true)
      }
      window.safary?.track({
        eventType: "investment-confirmation",
        eventName: "3-confirm investment",
        parameters: {
          walletAddress: address as string,
          toProject: projectId as string,
          amount: amount as number,
          currency: "USDC",
        },
      })
    },
    onError: (error) => toast.error(error.message, { theme: "colored" }),
  })

  return (
    <SimpleModal
      showCloseBtn={!showJoinCommunityCta}
      onClose={onCloseHandler}
      title={showJoinCommunityCta ? "Your Next Step Starts Here" : t("investment.intent.quest.heading")}
      className="bg-default"
      headerClass={twMerge("bg-default", showJoinCommunityCta && "pt-8 grid-cols-1 px-4 md:px-8")}
    >
      {!showJoinCommunityCta ? (
        <div className="flex w-full  flex-col items-center justify-center max-sm:h-full">
          {/* Body */}
          <div className={twMerge("flex w-full grow flex-col justify-start gap-4 px-4 pb-8 pt-3 md:px-10")}>
            <div>
              <p className="text-left text-base text-fg-tertiary md:text-center">
                <span>{t("investment.intent.quest.description")}</span>
              </p>
              <CurrencyInputField
                maxLength={12}
                containerClassName="max-w-[999px]"
                inputClassName="bg-emphasis text-white"
                placeholder={`Enter amount in USDC (e.g. ${maxInvestment})`}
                value={amount ?? undefined}
                maxValue={Number(maxInvestment)}
                onChange={(e) => setAmount(e ? Number(e) : null)}
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
                <Badge.Confirmation
                  isConfirmed={true}
                  label={t("done")}
                  classNames="w-fit bg-transparent border-none"
                />
              </div>
            ) : (
              <Button
                disabled={!amount || isPending}
                isLoading={isPending}
                btnText={t("investment.intent.quest.modal.button")}
                onClick={() => provideInvestmentIntent(address)}
                className="plausible-event-name=3-ConfirmInvestment"
              />
            )}
          </div>
        </div>
      ) : (
        <JoinUsOnTelegram onCloseHandler={onCloseHandler} address={address} projectId={projectId} />
      )}
    </SimpleModal>
  )
}

const JoinUsOnTelegram = ({ onCloseHandler, address, projectId }: { onCloseHandler: () => void, address: string, projectId: string | undefined }) => {
  const joinTelegramHandler = () => {
    localStorage.setItem("clickedOnTelegramUrl", "true")
    window.open(BORGPAD_TELEGRAM_URL, "_blank")
    window.safary?.track({
      eventType: "telegram-join",
      eventName: "4-join telegram",
      parameters: {
        walletAddress: address as string,
        toProject: projectId as string,
      },
    })
  }

  return (
    <div className="flex w-full max-w-[460px] flex-col items-center justify-center gap-6 p-4 pb-6 pt-0 max-sm:h-full md:p-8 md:pb-6 md:pt-0">
      <span className="w-full text-center text-sm font-medium text-fg-secondary">
        Get exclusive insights. Chat with project founders. Join our Telegram now!
      </span>
      <div className="mt-2 flex w-full max-w-[332px] flex-col items-center gap-4 rounded-lg bg-secondary p-4 ring-[1px] ring-bd-secondary">
        <Img src={telegramBorgpadOGs} customClass="h-[60px] w-[60px] rounded-full" />
        <span className="text-xl font-medium text-fg-primary">BorgPad OGs</span>
        <Button
          btnText="Join Us In Telegram"
          onClick={joinTelegramHandler}
          prefixElement={<Icon icon={"SvgTelegram"} className={"text-2xl leading-none plausible-event-name=4-JoinTelegram"} />}
        />
      </div>

      <Button btnText="Close" color="plain" className="text-sm" onClick={onCloseHandler} />
    </div>
  )
}
