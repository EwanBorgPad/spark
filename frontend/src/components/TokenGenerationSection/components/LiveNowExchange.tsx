import { useForm, SubmitHandler, Controller } from "react-hook-form"
import CurrencyInput from "react-currency-input-field"
import { useTranslation } from "react-i18next"

import { ConnectButton } from "@/components/Header/ConnectButton"
import { useBalanceContext } from "@/hooks/useBalanceContext.tsx"
import { useWalletContext, WalletProvider } from "@/hooks/useWalletContext"
import { formatCurrencyAmount } from "@/utils/format"
import { Button } from "@/components/Button/Button"
import { Icon } from "@/components/Icon/Icon"
import TokenRewards from "./TokenRewards"
import { TgeWrapper } from "./Wrapper"
import { RefObject } from "react"
import { toast } from "react-toastify"
import { backendApi, PostUserDepositRequest } from "@/data/backendApi"
import { useMutation } from "@tanstack/react-query"
import { useQuery } from "@tanstack/react-query"
import { useParams } from "react-router-dom"
import { useProjectDataContext } from "@/hooks/useProjectData"
import { PublicKey } from "@solana/web3.js"

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

  const { projectData } = useProjectDataContext()
  const maxTokenLimit = projectData.info.raisedTokenMaxCap
  // minTokenLimit cap not used for now but I will leave it here if neccessary in future
  const minTokenLimit = projectData.info.raisedTokenMinCap
  // backend API for depositing tokens to LBP
  const {
    mutate: userDepositFunction,
  } = useMutation({
    mutationFn: async (payload: PostUserDepositRequest) => {
      backendApi.postUserDeposit(payload)
    },
    onSuccess: async () => {
      console.log("Successful user deposit!")
      toast(`Deposited successfully!`)
      // refetching User deposited amount after successful deposit for checking validations of his pool deposit amount
      await refetchDeposit()
    },
  })
  const { t } = useTranslation()

  const { walletState, signAndSendTransaction , address, walletProvider } = useWalletContext()
  const { balance } = useBalanceContext()
  const { projectId } = useParams()

  const { data } = useQuery({
    queryFn: () => {
      if (!address || !projectId) return
      return backendApi.getEligibilityStatus({ address, projectId })
    },
    queryKey: ["getEligibilityStatus", address, projectId],
    enabled: Boolean(address) && Boolean(projectId),
  })
  const { data: depositData, refetch: refetchDeposit } = useQuery({
    queryFn: () => {
      if (!address || !projectId) return
      return backendApi.getUserDeposit({ walletAddress: address, projectId })
    },
    queryKey: ["getUserDeposit", address, projectId],
    enabled: Boolean(address) && Boolean(projectId),
  })
  const isUserEligible = data?.isEligible
  // Get users max token limit cap
  const userMaxCap = data?.eligibilityTier?.benefits.maxInvestment
  const userMinCap = data?.eligibilityTier?.benefits.minInvestment
  const rpcUrl = import.meta.env.VITE_SOLANA_RPC_URL
  const tokenMintAddress = new PublicKey(projectData.info.raisedTokenMintAddress)

  const { data: exchangeData } = useQuery({
    queryFn: () =>
      backendApi.getExchange({
        baseCurrency,
        targetCurrency,
      }),
    queryKey: ["getExchange", baseCurrency, targetCurrency],
  })
  const borgPriceInUsd = exchangeData?.currentPrice || null
  const tokenPriceInUSD = projectData.info.tge.fixedTokenPriceInUSD
  const tokenPriceInBORG = !borgPriceInUsd
    ? null
    : tokenPriceInUSD / borgPriceInUsd 

  const {
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormInputs>()

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    try {
      if (!isUserEligible) {
        toast("You are not eligible to make a deposit!")
        throw new Error("User not eligible")
      }
      const tokenAmount = parseFloat(data.borgInputValue)
      if (!userMaxCap) throw new Error("User max limit cap is not defined!")
      if (!userMinCap) throw new Error("User min limit cap is not defined!")
      // Check the amount the user deposit is in a defined range [min deposit amount, max deposit amount]
      if ((tokenAmount > parseInt(userMaxCap)) || (tokenAmount < parseInt(userMinCap))) {
        toast(`Limit range for tokens for your tier is from ${userMinCap} to ${userMaxCap}. Please change your investment token value`)
        throw new Error("User deposit range error!")
      }
      // Check current deposited amount + user deposit amount < max cap
      if (depositData.depositedAmount + tokenAmount >= maxTokenLimit) {
        toast(`Transaction will not go throgh because you reached deposit token limit cap for LBP which is ${maxTokenLimit}`)
        throw new Error("User deposit maximum cap for LBP reached")
      }
      if (walletProvider === "") throw new Error("No wallet provider!")
      if (walletState === 'CONNECTED') {
        const transaction = await signAndSendTransaction({
          rpcUrl,
          tokenAmount,
          tokenMintAddress,
          walletType: walletProvider
        })
        userDepositFunction({
          amount: tokenAmount,
          projectId: projectId ?? "",
          transaction,
          tokenAddress: projectData.info.raisedTokenMintAddress
        })
      } else {
          toast("Wallet error. Please try again or contact our support.")
          throw new Error("Wallet Error")
      }
    } catch (error) {
      console.log(error)
    }
  }

  const clickProvideLiquidityBtn = (balancePercentage: number) => {
    if (!balance) return
    const floatValue =
      (balancePercentage / 100) * Number(balance.uiAmountString)
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
        className={
          "relative flex h-full w-full flex-col items-center bg-transparent"
        }
        onSubmit={handleSubmit(onSubmit)}
      >
        <span className="w-full pb-2.5 text-center text-base font-semibold">
          {t("tge.provide_liquidity")}
        </span>
        <div className="re relative flex w-full max-w-[400px] flex-col items-center gap-2.5 rounded-t-2xl border border-bd-primary bg-secondary px-3 py-4">
          <span className="w-full text-left text-xs opacity-50">
            {t("tge.youre_paying")}
          </span>
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
                      className={
                        "max-w-[242px] bg-transparent font-geist-mono text-2xl focus:outline-none"
                      }
                      decimalsLimit={6}
                      onValueChange={onChange}
                    />
                  )}
                />
                {errors?.borgInputValue && (
                  <span className="text-fg-error-primary">
                    {t("tge.please_input_value")}
                  </span>
                )}
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
                  {t("tge.balance")}:{" "}
                  <span>
                    {formatCurrencyAmount(
                      Number(balance.uiAmountString),
                      false,
                    )}
                  </span>
                </p>
              </div>
            )}
          </div>
          <div className="absolute -bottom-3.5 left-0 right-0 z-10 ml-auto mr-auto h-7 w-7 rounded-full border border-bd-primary bg-secondary p-[5px] text-brand-primary">
            <Icon icon="SvgArrowDown" className="text-base" />
          </div>
        </div>
        <div className="border-t-none relative mb-4 flex w-full max-w-[400px] flex-col items-center gap-2 rounded-b-2xl border border-t-0 border-bd-primary bg-secondary px-2 pb-2 pt-3">
          <span className="w-full pl-1 text-left text-xs opacity-50">
            {t("tge.to_receive")}
          </span>

          <TokenRewards
            borgCoinInput={borgCoinInput}
            isWhitelistingEvent={false}
            tokenPriceInBORG={tokenPriceInBORG}
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
                className={"w-full"}
              />
              <Button
                size="md"
                color="secondary"
                btnText="Buy $BORG"
                className="w-full py-2"
                // TODO - add click event when we get a link
              />
            </>
          ) : (
            <div className="flex w-full flex-col rounded-xl bg-brand-primary/10">
              <span className="max-w-full text-wrap py-3 text-center">
                {t("tge.live_now.connect_wallet_to_see")}
              </span>
              <ConnectButton
                btnClassName="text-base py-3"
                customBtnText={t("tge.select_wallet")}
              />
            </div>
          )}
        </div>
      </form>
      {!isUserEligible && (
        <div className="absolute bottom-0 left-0 right-0 top-10 z-10 flex w-full flex-col items-center justify-center rounded-3xl bg-default/20 backdrop-blur-sm">
          <div className="flex w-full max-w-[340px] flex-col items-center rounded-lg bg-default p-4 shadow-sm shadow-white/5">
            <span className="text-fg-error-primary">
              Your Wallet was not whitelisted for this deal
            </span>
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
