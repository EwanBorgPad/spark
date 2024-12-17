import { useForm, SubmitHandler, Controller } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { ConnectButton } from "@/components/Header/ConnectButton"
import { useWalletContext } from "@/hooks/useWalletContext"
import { formatCurrencyAmount } from "shared/utils/format"
import { Button } from "@/components/Button/Button"
import { Icon } from "@/components/Icon/Icon"
import TokenRewards from "./TokenRewards"
import { TgeWrapper } from "./Wrapper"
import { RefObject } from "react"
import { toast } from "react-toastify"
import { BACKEND_RPC_URL, backendApi, PostCreateDepositTxArgs, PostSendDepositTransactionArgs } from "@/data/backendApi"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useQuery } from "@tanstack/react-query"
import { useParams } from "react-router-dom"
import { useProjectDataContext } from "@/hooks/useProjectData"
import { getSplTokenBalance } from "../../../../shared/SolanaWeb3.ts"
import LiveNowInput from "@/components/InputField/LiveNowInput.tsx"
import { Transaction } from "@solana/web3.js"
import { isBefore } from "date-fns/isBefore"
import { formatDateForTimer } from "@/utils/date-helpers.ts"
import { twMerge } from "tailwind-merge"

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
  scrollToTiers: () => void
}

// input data for "getExchange"
const baseCurrency = "swissborg"
const targetCurrency = "usd"

const LiveNowExchange = ({ eligibilitySectionRef, scrollToTiers }: Props) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { projectId } = useParams()

  const { projectData } = useProjectDataContext()
  const { walletState, signTransaction, address, walletProvider } = useWalletContext()

  const cluster = projectData?.cluster ?? "devnet"
  const rpcUrl = BACKEND_RPC_URL + "?cluster=" + cluster
  const tokenMintAddress = projectData?.info.raisedTokenMintAddress

  const { mutateAsync: makeDepositTransaction, isPending: isPendingMakeDepositTransaction } = useMutation({
    mutationFn: async (payload: PostCreateDepositTxArgs) => {
      return (await backendApi.postCreateDepositTx(payload)).transaction
    },
    onSuccess: async () => {
      console.log("Sucess!")
      await queryClient.invalidateQueries({ queryKey: ["getDeposits"] })
      await queryClient.invalidateQueries({ queryKey: ["getBalance"] })
    },
    onError: async () => {
      await queryClient.invalidateQueries({ queryKey: ["saleResults", projectId] })
      toast.error("Fail!")
    },
  })

  const { mutateAsync: sendTransaction, isPending: isPendingSendTransaction } = useMutation({
    mutationFn: async (payload: PostSendDepositTransactionArgs) => {
      return await backendApi.postSendDepositTransaction(payload)
    },
    onSuccess: async () => {
      toast("Transaction was successful!")
      console.log("Transaction Sent!")
      await queryClient.invalidateQueries({ queryKey: ["getDeposits"] })
      await queryClient.invalidateQueries({ queryKey: ["getBalance"] })
      await queryClient.invalidateQueries({ queryKey: ["saleResults", projectId] })
    },
    onError: async () => {
      await queryClient.invalidateQueries({ queryKey: ["saleResults", projectId] })
      toast("Transaction failed!")
      console.log("Transaction failed!")
    },
  })

  const { data: balance } = useQuery({
    queryFn: () => {
      if (!address || !projectId || !tokenMintAddress) return
      return getSplTokenBalance({
        address,
        tokenAddress: tokenMintAddress,
        rpcUrl,
      })
    },
    queryKey: ["getBalance", address, tokenMintAddress],
    enabled: Boolean(address) && Boolean(tokenMintAddress) && Boolean(tokenMintAddress),
  })

  const { data } = useQuery({
    queryFn: () => {
      if (!address || !projectId) return
      return backendApi.getEligibilityStatus({ address, projectId })
    },
    queryKey: ["getEligibilityStatus", address, projectId],
    enabled: Boolean(address) && Boolean(projectId),
  })
  const { data: depositStatus } = useQuery({
    queryFn: () => {
      if (!address || !projectId) return
      return backendApi.getDepositStatus({ address, projectId })
    },
    queryKey: ["getEligibilityStatus", address, projectId],
    enabled: Boolean(address) && Boolean(projectId),
  })

  const isUserEligible = data?.isEligible
  const tierBenefits = data?.eligibilityTier?.benefits
  const minInvestment = tierBenefits?.minInvestment || ""
  const maxInvestment = depositStatus?.maxAmountAllowed.amountInUsd || ""
  const isEligibleTierActive = tierBenefits ? isBefore(tierBenefits.startDate, new Date()) : false

  const { data: exchangeData } = useQuery({
    queryFn: () =>
      backendApi.getExchange({
        baseCurrency,
        targetCurrency,
      }),
    queryKey: ["getExchange", baseCurrency, targetCurrency],
  })
  const borgPriceInUSD = exchangeData?.currentPrice || null
  const tokenPriceInUSD = projectData?.info.tge.fixedTokenPriceInUSD || 0
  const tokenPriceInBORG = !borgPriceInUSD ? null : tokenPriceInUSD / borgPriceInUSD

  const minBorgInput = borgPriceInUSD && minInvestment ? +minInvestment / borgPriceInUSD : 0
  const maxBorgInput = borgPriceInUSD && maxInvestment ? Number((+maxInvestment / borgPriceInUSD).toFixed(2)) : 0

  const { handleSubmit, control, setValue, watch, clearErrors, setError } = useForm<FormInputs>({ mode: "onBlur" })

  const checkIfValueIsValid = (value: string) => {
    if (+value > maxBorgInput) {
      setError("borgInputValue", { message: `Max investment value is ${maxBorgInput.toFixed(2)} BORG` })
      return false
    } else if (+value < minBorgInput) {
      setError("borgInputValue", { message: `Min investment value is ${minBorgInput.toFixed(2)} BORG` })
      return false
    }
    return true
  }

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    try {
      const tokenAmount = parseFloat(data.borgInputValue.replace(",", ""))
      if (walletProvider === "") throw new Error("No wallet provider!")
      if (!tokenMintAddress) throw new Error("No Mint Address!")
      const isValid = checkIfValueIsValid(data.borgInputValue)
      if (!isValid) return
      if (walletState === "CONNECTED") {
        const serializedTransaction = await makeDepositTransaction({
          userWalletAddress: address,
          tokenAmount,
          projectId: projectId ?? "",
        })
        // Deserialize the transaction
        const transaction = Transaction.from(Buffer.from(serializedTransaction, "base64"))
        // Sign the transaction
        const signedTransaction = await signTransaction(transaction, walletProvider)
        if (!signedTransaction) throw new Error("Error while signing the transaction!")
        // Send the signed transaction to backend
        const serializedTx = signedTransaction
          .serialize({
            requireAllSignatures: false,
          })
          .toString("base64")
        await sendTransaction({
          projectId: projectId ?? "",
          serializedTx,
        })
      } else {
        toast.error("Wallet error. Please try again or contact our support.")
      }
    } catch (error) {
      console.log(error)
    }
  }

  const clickProvideLiquidityBtn = (balancePercentage: number) => {
    if (!balance || !maxBorgInput) return
    const floatValue = Number(((balancePercentage / 100) * Number(balance.uiAmountString)).toFixed(6))
    if (floatValue > maxBorgInput) {
      setValue("borgInputValue", maxBorgInput.toString(), {
        shouldValidate: true,
        shouldDirty: true,
      })
      return
    }
    setValue("borgInputValue", floatValue.toString(), {
      shouldValidate: true,
      shouldDirty: true,
    })
  }

  const borgCoinInput = watch("borgInputValue")

  const isInputMaxAmout = +borgCoinInput === maxBorgInput

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
          <div className="flex w-full flex-col justify-between gap-2.5">
            <div className="grid w-full grid-cols-borg-input gap-x-2">
              <div className="flex flex-col">
                <Controller
                  control={control}
                  name="borgInputValue"
                  rules={{ required: true }}
                  render={({ field: { value, onChange }, fieldState: { error } }) => (
                    <LiveNowInput
                      minValue={+minInvestment}
                      maxValue={+maxInvestment}
                      onChange={onChange}
                      value={value}
                      setError={setError}
                      error={error}
                      clearError={() => clearErrors("borgInputValue")}
                      borgPriceInUSD={borgPriceInUSD}
                    />
                  )}
                />
              </div>
              <div className="flex h-fit items-center gap-2 rounded-full bg-default p-1 pr-3 text-sm font-medium">
                <Icon icon="SvgBorgCoin" className="text-2xl" />
                <span>BORG</span>
              </div>
            </div>
            <div className="flex w-full flex-row-reverse justify-between">
              {minBorgInput && maxBorgInput && (
                <div className="grid-cols-min-max grid max-h-[36px] gap-x-1.5 gap-y-0 text-xs leading-tight text-fg-tertiary/60">
                  <span className="text-nowrap">Min:</span>{" "}
                  <div className="flex justify-end">
                    <span className="text-nowrap ">
                      {formatCurrencyAmount(+minBorgInput, { customDecimals: 2 })} BORG
                    </span>
                  </div>
                  <span className={twMerge("text-nowrap", isInputMaxAmout ? "font-bold text-white" : "")}>Max: </span>{" "}
                  <div className="flex justify-end">
                    <span className={twMerge("text-nowrap", isInputMaxAmout ? "font-bold text-white" : "")}>
                      {formatCurrencyAmount(+maxBorgInput, { customDecimals: 2 })} BORG
                    </span>
                  </div>
                </div>
              )}
              {balance !== null && (
                <div className="flex w-full flex-col items-start justify-between gap-1">
                  <p className="flex gap-1 text-left text-xs opacity-50">
                    <span className="pr-1">{t("tge.balance")}:</span>
                    <span className="">{formatCurrencyAmount(Number(balance?.uiAmountString))}</span>
                    <span>{" BORG"}</span>
                  </p>
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
                </div>
              )}
            </div>
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
            tokenPriceInUSD={tokenPriceInUSD}
          />
        </div>
        <div className="flex w-full flex-col items-center gap-4">
          {walletState === "CONNECTED" ? (
            <>
              <Button
                type="submit"
                size="lg"
                btnText="Supply $BORG"
                disabled={!isUserEligible || !isEligibleTierActive}
                isLoading={isPendingSendTransaction || isPendingMakeDepositTransaction}
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

      {/* If user's tier is not active yet, blur component and leave message */}
      {!isEligibleTierActive && (
        <div className="absolute bottom-0 left-0 right-0 top-0 z-10 flex w-full flex-col items-center justify-center rounded-3xl bg-default/20 backdrop-blur-sm">
          <div className="mt-[-40px] flex w-full max-w-[340px] flex-col items-center rounded-lg bg-default p-4 shadow-sm shadow-white/5">
            <div className="py-2 text-sm font-normal text-fg-primary">
              <span onClick={scrollToTiers} className="cursor-pointer underline">
                Your Tier
              </span>
              {" Opens on "}
              <span>{tierBenefits && formatDateForTimer(tierBenefits.startDate)}</span>
            </div>
          </div>
        </div>
      )}
    </TgeWrapper.Inner>
  )
}

export default LiveNowExchange
