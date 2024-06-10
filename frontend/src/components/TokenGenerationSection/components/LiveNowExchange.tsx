import CurrencyInput, { formatValue } from "react-currency-input-field"
import { useForm, SubmitHandler, Controller } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { ConnectButton } from "@/components/Header/ConnectButton"
import { useWalletContext } from "@/hooks/useWalletContext"
import { formatCurrencyAmount } from "@/utils/format"
import { walletDummyData } from "@/data/walletData"
import { Button } from "@/components/Button/Button"
import { Icon } from "@/components/Icon/Icon"
import raydiumImg from "@/assets/raydium.png"
import lrcCoinImg from "@/assets/lrcCoin.png"
import { ProjectData } from "@/data/data"
import { TgeWrapper } from "./Wrapper"

type LiveNowExchangeProps = {
  userIsWhitelisted: boolean
  tgeData: ProjectData["tge"]
}

type FormInputs = {
  borgInputValue: string
}

const inputButtons = [
  { label: "25%", percantage: 25 },
  { label: "50%", percantage: 50 },
  { label: "100%", percantage: 100 },
]

const LiveNowExchange = ({
  userIsWhitelisted,
  tgeData,
}: LiveNowExchangeProps) => {
  const { t } = useTranslation()

  const { walletState } = useWalletContext()

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
  const getRewardQuantity = () => {
    if (!borgCoinInput) return 0
    return formatValue({
      value: borgCoinInput,
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
            <div className="flex w-full justify-between">
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
                      key={btn.percantage}
                      size="xs"
                      color="secondary"
                      btnText={btn.label}
                      className="h-[24px] px-1"
                      textClassName="text-[12px] leading-none text-fg-tertiary font-normal"
                      onClick={() => clickProvideLiquidityBtn(btn.percantage)}
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
          <div className="border-t-none relative w-full max-w-[400px] items-center gap-2.5 rounded-lg border border-bd-primary bg-tertiary ">
            <div className="border-b-[1px] border-b-bd-primary px-3 py-2">
              <div className="flex h-fit flex-wrap items-center gap-2 rounded-full pb-1 text-base font-medium">
                <Icon icon="SvgBorgCoin" />
                <span className="font-geist-mono text-base">
                  {formatValue({ value: borgCoinInput }) || 0}
                </span>
                <span className="font-geist-mono">BORG</span>
                <div className="flex items-center gap-2">
                  <span className="font-normal opacity-50">+</span>
                  <img src={lrcCoinImg} className="h-4 w-4 object-cover" />
                  <span className="font-geist-mono text-base">
                    {getRewardQuantity()}
                  </span>
                  <span className="font-geist-mono text-base">LRC</span>
                </div>
              </div>

              <div className="flex h-fit items-center gap-1.5 rounded-full text-xs font-medium text-fg-primary ">
                <Icon
                  icon="SvgLock"
                  className="mt-[-1px] text-base opacity-50"
                />
                <span className="opacity-50">{t("tge.liquidity_pool")}</span>
                <img src={raydiumImg} className="h-4 w-4 object-cover" />
                <span className="opacity-50">Raydium,</span>
                <span className="opacity-50">12-{t("tge.month_lockup")}</span>
              </div>
            </div>
            <div className="px-3 py-2">
              <div className="flex h-fit items-center gap-1.5 rounded-full text-xs font-medium text-fg-primary ">
                <img src={lrcCoinImg} className="h-4 w-4 object-cover" />
                <span className="font-geist-mono text-base">
                  {getRewardQuantity()}
                </span>
                <span className="font-geist-mono text-base">
                  {tgeData.projectCoin.ticker}
                </span>
              </div>
              <div className="flex h-fit items-center gap-1.5 rounded-full text-xs font-medium text-fg-primary ">
                <Icon icon="SvgChartLine" className="text-base opacity-50" />
                <span className="opacity-50">{t("tge.linearly_paid_out")}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex w-full flex-col items-center gap-4">
          {walletState === "CONNECTED" ? (
            <>
              <Button
                type="submit"
                size="lg"
                btnText="Supply $BORG"
                disabled={!userIsWhitelisted}
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
          {balance && (
            <div className="flex items-center gap-2">
              <span>{t("tge.participation_status")}:</span>
              {userIsWhitelisted ? (
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
          )}
        </div>
      </form>
      {!userIsWhitelisted && (
        <div className="absolute bottom-[60px] left-0 right-0 top-10 z-10 flex w-full flex-col items-center justify-center rounded-2xl bg-default/20 backdrop-blur-sm">
          <div className="flex w-full max-w-[340px] flex-col rounded-md bg-default p-4 shadow-sm shadow-white/5">
            <span className="text-fg-error-primary">
              Your Wallet was not whitelisted for this deal
            </span>
            <span>See Whitelist Requirements:</span>
            <ul className="list-inside list-disc">
              <li>Requirement 1</li>
              <li>Requirement 2</li>
              <li>Requirement 3</li>
            </ul>
          </div>
        </div>
      )}
    </TgeWrapper.Inner>
  )
}

export default LiveNowExchange
