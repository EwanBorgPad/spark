import { useForm, SubmitHandler, Controller } from "react-hook-form"
import CurrencyInput from "react-currency-input-field"
import { useTranslation } from "react-i18next"

import { useWhitelistStatusContext } from "@/hooks/useWhitelistContext"
import { ConnectButton } from "@/components/Header/ConnectButton"
import { useWalletContext } from "@/hooks/useWalletContext"
import { formatCurrencyAmount } from "@/utils/format"
import { walletDummyData } from "@/data/walletData"
import { Button } from "@/components/Button/Button"
import { Icon } from "@/components/Icon/Icon"
import { ProjectData } from "@/data/data"
import TokenRewards from "./TokenRewards"
import { TgeWrapper } from "./Wrapper"
import { useEffect } from "react"

type LiveNowExchangeProps = {
  tgeData: ProjectData["tge"]
}

type FormInputs = {
  borgInputValue: string
}

const inputButtons = [
  { label: "25%", percentage: 25 },
  { label: "50%", percentage: 50 },
  { label: "100%", percentage: 100 },
]

const LiveNowExchange = ({ tgeData }: LiveNowExchangeProps) => {
  const { t } = useTranslation()

  const { walletState } = useWalletContext()
  const { isUserWhitelisted } = useWhitelistStatusContext()

  // @TODO - getBalance API instead of walletDummyData and variable below
  const balance = walletDummyData.balance

  const {
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormInputs>()

  const onSubmit: SubmitHandler<FormInputs> = (data) => {
    // eslint-disable-next-line no-console
    console.log("Submitted", data)
    // @TODO - add API for providing liquidity
    // @TODO - refetch balance
    // @TODO - refetch Tokens Available
  }

  const clickProvideLiquidityBtn = (balancePercentage: number) => {
    if (!balance) return
    const floatValue = (balancePercentage / 100) * balance
    setValue("borgInputValue", floatValue.toString(), {
      shouldValidate: true,
      shouldDirty: true,
    })
  }

  const borgCoinInput = watch("borgInputValue")

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
            {walletDummyData.balance && (
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
                    {formatCurrencyAmount(walletDummyData.balance, false)}
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
            tgeData={tgeData}
          />
        </div>
        <div className="flex w-full flex-col items-center gap-4">
          {walletState === "CONNECTED" ? (
            <>
              <Button
                type="submit"
                size="lg"
                btnText="Supply $BORG"
                disabled={!isUserWhitelisted}
                className={"w-full"}
              />
              <Button
                size="md"
                color="secondary"
                btnText="Buy $BORG"
                className="w-full py-2"
                // @TODO - add click event when we get a link
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
          {/* Probably not needed */}
          {/* {balance && (
            <div className="flex items-center gap-2">
              <span>{t("tge.participation_status")}:</span>
              {isUserWhitelisted ? (
                <span className="text-sm text-fg-success-primary">
                  {t("tge.whitelisted")}
                </span>
              ) : (
                <div className="flex items-center gap-2 rounded-full border-[1px] border-error-secondary bg-error-primary py-1 pl-1 pr-2 text-fg-error-primary">
                  <Icon icon="SvgCircledX" className="text-[18px]" />
                  <span>{t("tge.not_eligible")}</span>
                </div>
              )}
            </div>
          )} */}
        </div>
      </form>
      {!isUserWhitelisted && (
        <div className="absolute bottom-0 left-0 right-0 top-10 z-10 flex w-full flex-col items-center justify-center rounded-3xl bg-default/20 backdrop-blur-sm">
          <div className="flex w-full max-w-[340px] flex-col rounded-lg bg-default p-4 shadow-sm shadow-white/5">
            <span className="text-fg-error-primary">
              Your Wallet was not whitelisted for this deal
            </span>
            <Button
              onClick={() => scrollBy({ top: 400, behavior: "smooth" })}
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
