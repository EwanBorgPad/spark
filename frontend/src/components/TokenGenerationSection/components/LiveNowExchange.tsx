import { useForm, SubmitHandler, Controller } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { ConnectButton } from "@/components/Header/ConnectButton"
import { useWalletContext } from "@/hooks/useWalletContext"
import { formatCurrencyAmount } from "shared/utils/format"
import { Button } from "@/components/Button/Button"
import { Icon } from "@/components/Icon/Icon"
import TokenRewards from "./TokenRewards"
import { TgeWrapper } from "./Wrapper"
import { RefObject, useCallback } from "react"
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
import { twMerge } from "tailwind-merge"
import DisabledContainer from "./DisabledContainer.tsx"
import Img from "@/components/Image/Img.tsx"
import Text from "@/components/Text.tsx"

type FormInputs = {
  raisedTokenInputValue: string
}

type Props = {
  eligibilitySectionRef: RefObject<HTMLDivElement>
  scrollToEligibilitySection: () => void
}

const truncateDecimals = (value: number, numOfDecimals: number) => {
  const multiplier = Math.pow(10, numOfDecimals)
  return Math.trunc(value * multiplier) / multiplier
}

// CONFIG
const NUM_OF_DECIMALS = 0
const ONE_HOUR = 60 * 60 * 1000

const LiveNowExchange = ({ eligibilitySectionRef, scrollToEligibilitySection }: Props) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { projectId } = useParams()

  const { projectData, isLoading } = useProjectDataContext()
  const { walletState, signTransaction, address, walletProvider } = useWalletContext()

  const cluster = projectData?.config.cluster
  const rpcUrl = BACKEND_RPC_URL + "?cluster=" + cluster
  const tokenMintAddress = projectData?.config.raisedTokenData.mintAddress

  // Create Deposit Transaction
  const { mutateAsync: makeDepositTransaction, isPending: isPendingMakeDepositTransaction } = useMutation({
    mutationFn: async (payload: PostCreateDepositTxArgs) => {
      return (await backendApi.postCreateDepositTx(payload)).transaction
    },
    onSuccess: async () => {
      // eslint-disable-next-line no-console
      console.log("Success!")
      await queryClient.invalidateQueries({ queryKey: ["getDeposits"] })
      await queryClient.invalidateQueries({ queryKey: ["getBalance"] })
    },
    onError: async () => {
      await queryClient.invalidateQueries({ queryKey: ["saleResults", projectId] })
      toast.error("Fail!")
    },
  })

  // Send Transaction
  const { mutateAsync: sendTransaction, isPending: isPendingSendTransaction } = useMutation({
    mutationFn: async (payload: PostSendDepositTransactionArgs) => {
      return await backendApi.postSendDepositTransaction(payload)
    },
    onSuccess: async () => {
      toast.success("Transaction was successful!")
      // eslint-disable-next-line no-console
      console.log("Transaction Sent!")
      await queryClient.invalidateQueries({ queryKey: ["getDeposits"] })
      await queryClient.invalidateQueries({ queryKey: ["getBalance"] })
      await queryClient.invalidateQueries({ queryKey: ["saleResults", projectId] })
      await queryClient.invalidateQueries({ queryKey: ["getDepositStatus", address, projectId] })
    },
    onError: async () => {
      await queryClient.invalidateQueries({ queryKey: ["saleResults", projectId] })
      toast.error("Transaction failed!")
      // eslint-disable-next-line no-console
      console.log("Transaction failed!")
    },
  })

  // Get Spl token balance
  const { data: balance, isLoading: isBalanceLoading } = useQuery({
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

  // Get Eligibility Status
  const { data: eligibilityStatus, isLoading: isEligibilityLoading } = useQuery({
    queryFn: () => {
      if (!address || !projectId) return
      return backendApi.getEligibilityStatus({ address, projectId })
    },
    queryKey: ["getEligibilityStatus", address, projectId],
    enabled: Boolean(address) && Boolean(projectId),
    staleTime: ONE_HOUR,
  })

  const isUserEligible = eligibilityStatus?.isEligible
  const tierBenefits = eligibilityStatus?.eligibilityTier?.benefits
  const isEligibleTierActive =
    tierBenefits && tierBenefits.startDate ? isBefore(tierBenefits.startDate, new Date()) : false

  // Get deposit status
  const { data: depositStatus, isLoading: isDepositStatusLoading } = useQuery({
    queryFn: () => {
      if (!address || !projectId || !isUserEligible) return
      return backendApi.getDepositStatus({ address, projectId })
    },
    queryKey: ["getDepositStatus", address, projectId],
    enabled: Boolean(address) && Boolean(projectId) && Boolean(isUserEligible),
  })

  const baseCurrency = projectData?.config.raisedTokenData.coinGeckoName
  const targetCurrency = "usd"
  const { data: exchangeData } = useQuery({
    queryFn: () =>
      backendApi.getExchange({
        baseCurrency,
        targetCurrency,
      }),
    queryKey: ["getExchange", baseCurrency, targetCurrency],
    staleTime: ONE_HOUR,
    enabled: Boolean(baseCurrency),
  })
  const raisedTokenPriceInUSD = Number(exchangeData?.currentPrice) || null
  const tokenPriceInUSD = projectData?.config.launchedTokenData.fixedTokenPriceInUsd || 0
  // const tokenPriceInRaisedToken = !raisedTokenPriceInUSD ? null : tokenPriceInUSD / raisedTokenPriceInUSD

  const minRaisedTokenInput = depositStatus
    ? truncateDecimals(Number(depositStatus.minAmountAllowed.uiAmount), NUM_OF_DECIMALS)
    : 0
  const maxRaisedTokenInput = depositStatus
    ? truncateDecimals(Number(depositStatus.maxAmountAllowed.uiAmount), NUM_OF_DECIMALS)
    : 0

  const checkIfUserInvestedMaxAmount = useCallback(() => {
    if (typeof maxRaisedTokenInput !== "number" || typeof minRaisedTokenInput !== "number") {
      return false
    }
    if (maxRaisedTokenInput < 1) return true
    // edge case if there is a small amount left to be invested
    if (maxRaisedTokenInput < minRaisedTokenInput) return true
    return false
  }, [maxRaisedTokenInput, minRaisedTokenInput])
  const userInvestedMaxAmount = checkIfUserInvestedMaxAmount()

  const { handleSubmit, control, setValue, watch, clearErrors, setError } = useForm<FormInputs>({ mode: "onBlur" })

  const checkIfValueIsValid = (value: string) => {
    const ticker = projectData?.config.raisedTokenData.ticker
    if (!balance?.uiAmountString) return
    if (+value > maxRaisedTokenInput) {
      setError("raisedTokenInputValue", { message: `Max investment value is ${maxRaisedTokenInput} ${ticker}` })
      return false
    } else if (Number(value) > Number(balance.uiAmountString)) {
      setError("raisedTokenInputValue", { message: `Insufficient ${ticker} Balance.` })
      return false
    } else if (+value < minRaisedTokenInput) {
      setError("raisedTokenInputValue", { message: `Min investment value is ${minRaisedTokenInput} ${ticker}` })
      return false
    }
    return true
  }

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    try {
      const tokenAmount = parseFloat(data.raisedTokenInputValue.replace(",", ""))
      if (walletProvider === "") throw new Error("No wallet provider!")
      if (!tokenMintAddress) throw new Error("No Mint Address!")
      const isValid = checkIfValueIsValid(data.raisedTokenInputValue)
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
        setValue("raisedTokenInputValue", "0")
      } else {
        toast.error("Wallet error. Please try again or contact our support.")
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error)
    }
  }

  const inputMaxAmountHandler = () => {
    if (!balance || !maxRaisedTokenInput) return
    const inputFloatValue = Math.min(Number(balance.uiAmountString), maxRaisedTokenInput)
    const inputValue = truncateDecimals(inputFloatValue, 0)
    setValue("raisedTokenInputValue", inputValue.toString(), {
      shouldValidate: true,
      shouldDirty: true,
    })
  }

  const raisedTokenInputValue = watch("raisedTokenInputValue")

  const isInputMaxAmount = +raisedTokenInputValue === maxRaisedTokenInput
  const maxAmountString = `Use Max: ${formatCurrencyAmount(+maxRaisedTokenInput, { customDecimals: 0 })} ${projectData?.config.raisedTokenData.ticker}`

  const scrollToWhitelistRequirements = () => {
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
          <div className="flex w-full flex-col justify-between gap-2.5 pb-2">
            <div className="grid w-full grid-cols-borg-input gap-x-2">
              <div className="flex flex-col">
                <Controller
                  control={control}
                  name="raisedTokenInputValue"
                  rules={{ required: true }}
                  render={({ field: { value, onChange }, fieldState: { error } }) => (
                    <LiveNowInput
                      minRaisedTokenInput={minRaisedTokenInput}
                      maxRaisedTokenInput={maxRaisedTokenInput}
                      raisedTokenPriceInUSD={raisedTokenPriceInUSD}
                      value={value}
                      onChange={onChange}
                      numberOfDecimals={NUM_OF_DECIMALS}
                      error={error}
                      setError={setError}
                      clearError={() => clearErrors("raisedTokenInputValue")}
                      disabled={userInvestedMaxAmount}
                    />
                  )}
                />
              </div>
              <div className="flex h-fit items-center gap-2 rounded-full bg-default p-1 pr-3 text-sm font-medium">
                <Img src={projectData?.config.raisedTokenData.iconUrl} size="6" isFetchingLink={isLoading} isRounded />
                <Text text={projectData?.config.raisedTokenData.ticker} isLoading={isLoading} />
              </div>
            </div>
            <div className="flex w-full flex-row items-end justify-between md:items-center">
              {!userInvestedMaxAmount && !isDepositStatusLoading && (
                <div className="flex items-center gap-2 text-xs leading-tight text-fg-tertiary/60">
                  {/* <span className={twMerge("text-nowrap", isInputMaxAmount ? "font-bold text-white" : "")}>Max: </span>{" "} */}
                  <Button
                    key={100}
                    size="xs"
                    color="secondary"
                    btnText={maxAmountString}
                    className={twMerge("h-[24px] px-2", isInputMaxAmount ? "border-white" : "")}
                    textClassName={twMerge(
                      "text-[12px] leading-none text-fg-tertiary font-normal",
                      isInputMaxAmount ? "text-white" : "",
                    )}
                    onClick={inputMaxAmountHandler}
                  />
                </div>
              )}
              {balance !== null && (
                <div className="flex w-full flex-[1] flex-col items-end justify-center md:justify-end ">
                  <div className="flex flex-col items-end gap-1 text-left text-xs opacity-50 md:flex-row md:items-center">
                    <span>{t("tge.balance")}</span>
                    <p>
                      <span className="">{formatCurrencyAmount(Number(balance?.uiAmountString))}</span>
                      <span>{` ${projectData?.config.raisedTokenData.ticker}`}</span>
                    </p>
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
            raisedTokenInput={raisedTokenInputValue}
            raisedTokenPriceInUSD={raisedTokenPriceInUSD}
            tokenPriceInUSD={tokenPriceInUSD}
          />
        </div>
        <div className="flex w-full flex-col items-center gap-4">
          {walletState === "CONNECTED" ? (
            <>
              <Button
                type="submit"
                size="lg"
                btnText={`Supply $${projectData?.config.raisedTokenData.ticker}`}
                disabled={!isUserEligible || !isEligibleTierActive || !projectData?.config.raisedTokenData.ticker}
                isLoading={isPendingSendTransaction || isPendingMakeDepositTransaction}
                className={"w-full"}
              />
              <a
                className="w-full"
                href={`https://jup.ag/swap/SOL-${projectData?.config.raisedTokenData.ticker}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="md"
                  color="secondary"
                  className="w-full py-2"
                  disabled={!projectData?.config.raisedTokenData.ticker}
                  btnText={`Buy $${projectData?.config.raisedTokenData.ticker}`}
                />
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

      <DisabledContainer
        isEligibilityLoading={isEligibilityLoading}
        isDepositStatusLoading={isDepositStatusLoading}
        isEligibleTierActive={isEligibleTierActive}
        isUserEligible={isUserEligible}
        isBalanceLoading={isBalanceLoading}
        balance={balance}
        scrollToEligibilitySection={scrollToEligibilitySection}
        scrollToWhitelistRequirements={scrollToWhitelistRequirements}
        tierBenefits={tierBenefits}
        userInvestedMaxAmount={userInvestedMaxAmount}
      />
    </TgeWrapper.Inner>
  )
}

export default LiveNowExchange
