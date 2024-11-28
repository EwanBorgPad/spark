import { useForm, SubmitHandler, Controller } from "react-hook-form"
import CurrencyInput from "react-currency-input-field"
import { useTranslation } from "react-i18next"

import { ConnectButton } from "@/components/Header/ConnectButton"
import { useWalletContext } from "@/hooks/useWalletContext"
import { formatCurrencyAmount } from "@/utils/format"
import { Button } from "@/components/Button/Button"
import { Icon } from "@/components/Icon/Icon"
import TokenRewards from "./TokenRewards"
import { TgeWrapper } from "./Wrapper"
import { RefObject } from "react"
import { toast } from "react-toastify"
import { BACKEND_RPC_URL, backendApi, PostUserDepositRequest } from "@/data/backendApi"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useQuery } from "@tanstack/react-query"
import { useParams } from "react-router-dom"
import { useProjectDataContext } from "@/hooks/useProjectData"
import { PublicKey } from "@solana/web3.js"
import { getSplTokenBalance } from "../../../../shared/SolanaWeb3.ts"

type FormInputs = {
  borgInputValue: string
}

const inputButtons = [
  { label: "25%", percentage: 25 },
  { label: "50%", percentage: 50 },
  { label: "100%", percentage: 100 },
]

type Props = {
  eligibilitySectionRef: RefObject<HTMLDivElement>
}

// input data for "getExchange"
const baseCurrency = "swissborg"
const targetCurrency = "usd"

const LiveNowExchange = ({ eligibilitySectionRef }: Props) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { projectId } = useParams()

  const { projectData } = useProjectDataContext()
  const { walletState, signTransaction , address, walletProvider } = useWalletContext()

  const cluster = projectData.cluster ?? 'devnet'
  const rpcUrl = BACKEND_RPC_URL + '?cluster=' + cluster
  const tokenMintAddress = projectData.info.raisedTokenMintAddress

  const {
    mutate: userDepositFunction,
    isPending,
  } = useMutation({
    mutationFn: async (payload: PostUserDepositRequest) => {
      await backendApi.postUserDeposit(payload)
    },
    onSuccess: async () => {
      console.log("Successful user deposit!")
      toast(`Deposited successfully!`)
      await queryClient.invalidateQueries({ queryKey: ["getDeposits"] })
      await queryClient.invalidateQueries({ queryKey: ["getBalance"] })
    },
    onError: async () => {
      console.log("Transaction failed!")
      toast.error("Deposit was unsuccessful!")
    }
  })

  const { data: balance } = useQuery({
    queryFn: () => {
      if (!address || !projectId) return
      return getSplTokenBalance({
        address,
        tokenAddress: projectData.info.raisedTokenMintAddress,
        rpcUrl,
      })
    },
    queryKey: ["getBalance", address, tokenMintAddress],
    enabled: Boolean(address) && Boolean(tokenMintAddress),
  })

  const { data } = useQuery({
    queryFn: () => {
      if (!address || !projectId) return
      return backendApi.getEligibilityStatus({ address, projectId })
    },
    queryKey: ["getEligibilityStatus", address, projectId],
    enabled: Boolean(address) && Boolean(projectId),
  })
  const isUserEligible = data?.isEligible

  const { data: exchangeData } = useQuery({
    queryFn: () =>
      backendApi.getExchange({
        baseCurrency,
        targetCurrency,
      }),
    queryKey: ["getExchange", baseCurrency, targetCurrency],
  })
  const borgPriceInUSD = exchangeData?.currentPrice || null
  const tokenPriceInUSD = projectData.info.tge.fixedTokenPriceInUSD
  const tokenPriceInBORG = !borgPriceInUSD ? null : tokenPriceInUSD / borgPriceInUSD

  const {
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormInputs>()

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    try {
      const tokenAmount = parseFloat(data.borgInputValue.replace(",", ""))
      if (walletProvider === "") throw new Error("No wallet provider!")
      if (walletState === "CONNECTED") {
        const transaction = await signTransaction({
          rpcUrl,
          tokenAmount,
          tokenMintAddress: new PublicKey(tokenMintAddress),
          walletType: walletProvider,
        })
        userDepositFunction({
          projectId: projectId ?? "",
          transaction,
        })
      } else {
        toast.error("Wallet error. Please try again or contact our support.")
      }
    } catch (error) {
      console.log(error)
    }
  }

  const clickProvideLiquidityBtn = (balancePercentage: number) => {
    if (!balance) return
    const floatValue = (balancePercentage / 100) * Number(balance.uiAmountString)
    setValue("borgInputValue", floatValue.toString(), {
      shouldValidate: true,
      shouldDirty: true,
    })
  }

  const borgCoinInput = watch("borgInputValue")

  const scrollToWhitelistRequriements = () => {
    const top = eligibilitySectionRef.current?.getBoundingClientRect().top ?? 0
    window.scrollBy({
      behavior: "smooth",
      top: top - 100,
    })
  }

  return (
    <TgeWrapper.Inner className="gap-0">
      <form
        className={"relative flex h-full w-full flex-col items-center bg-transparent"}
        onSubmit={handleSubmit(onSubmit)}
      >
        <span className="w-full pb-2.5 text-center text-base font-semibold">{t("tge.provide_liquidity")}</span>
        <div className="re relative flex w-full max-w-[400px] flex-col items-center gap-2.5 rounded-t-2xl border border-bd-primary bg-secondary px-3 py-4">
          <span className="w-full text-left text-xs opacity-50">{t("tge.youre_paying")}</span>
          <div className="flex w-full flex-col justify-between gap-2">
            <div className="grid w-full grid-cols-borg-input gap-x-2">
              <div className="flex flex-col">
                <Controller
                  control={control}
                  name="borgInputValue"
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <CurrencyInput
                      value={value}
                      allowNegativeValue={false}
                      placeholder="0"
                      maxLength={16}
                      autoFocus
                      className={"max-w-[242px] bg-transparent text-2xl focus:outline-none"}
                      decimalsLimit={6}
                      onValueChange={onChange}
                    />
                  )}
                />
                {errors?.borgInputValue && <span className="text-fg-error-primary">{t("tge.please_input_value")}</span>}
              </div>
              <div className="flex h-fit items-center gap-2 rounded-full bg-default p-1 pr-3 text-sm font-medium">
                <Icon icon="SvgBorgCoin" className="text-2xl" />
                <span>BORG</span>
              </div>
            </div>
            {balance !== null && (
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-2">
                  {inputButtons.map((btn) => (
                    <Button
                      key={btn.percentage}
                      size="xs"
                      color="secondary"
                      btnText={btn.label}
                      className="h-[24px] px-1"
                      textClassName="text-[12px] leading-none text-fg-tertiary font-normal"
                      onClick={() => clickProvideLiquidityBtn(btn.percentage)}
                    />
                  ))}
                </div>
                <p className="text-left text-xs opacity-50">
                  {t("tge.balance")}: <span>{formatCurrencyAmount(Number(balance?.uiAmountString), false)}</span>
                </p>
              </div>
            )}
          </div>
          <div className="absolute -bottom-3.5 left-0 right-0 z-10 ml-auto mr-auto h-7 w-7 rounded-full border border-bd-primary bg-secondary p-[5px] text-brand-primary">
            <Icon icon="SvgArrowDown" className="text-base" />
          </div>
        </div>
        <div className="border-t-none relative mb-4 flex w-full max-w-[400px] flex-col items-center gap-2 rounded-b-2xl border border-t-0 border-bd-primary bg-secondary px-2 pb-2 pt-3">
          <span className="w-full pl-1 text-left text-xs opacity-50">{t("tge.to_receive")}</span>

          <TokenRewards
            borgCoinInput={borgCoinInput}
            tokenPriceInBORG={tokenPriceInBORG}
            borgPriceInUSD={borgPriceInUSD}
          />
        </div>
        <div className="flex w-full flex-col items-center gap-4">
          {walletState === "CONNECTED" ? (
            <>
              <Button
                type="submit"
                size="lg"
                btnText="Supply $BORG"
                disabled={!isUserEligible}
                isLoading={isPending}
                className={"w-full"}
              />
              <a className="w-full" href="https://jup.ag/swap/SOL-BORG" target="_blank" rel="noopener noreferrer">
                <Button size="md" color="secondary" btnText="Buy $BORG" className="w-full py-2" />
              </a>
            </>
          ) : (
            <div className="flex w-full flex-col rounded-xl bg-brand-primary/10">
              <span className="max-w-full text-wrap py-3 text-center">{t("tge.live_now.connect_wallet_to_see")}</span>
              <ConnectButton btnClassName="text-base py-3" customBtnText={t("tge.select_wallet")} />
            </div>
          )}
        </div>
      </form>
      {!isUserEligible && (
        <div className="absolute bottom-0 left-0 right-0 top-10 z-10 flex w-full flex-col items-center justify-center rounded-3xl bg-default/20 backdrop-blur-sm">
          <div className="flex w-full max-w-[340px] flex-col items-center rounded-lg bg-default p-4 shadow-sm shadow-white/5">
            <span className="text-fg-error-primary">Your Wallet was not whitelisted for this deal</span>
            <Button
              onClick={scrollToWhitelistRequriements}
              size="md"
              color="plain"
              btnText="See Whitelist Requirements"
              className="text-sm font-normal"
            ></Button>
          </div>
        </div>
      )}
    </TgeWrapper.Inner>
  )
}

export default LiveNowExchange
