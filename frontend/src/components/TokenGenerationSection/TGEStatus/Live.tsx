import { useTranslation } from "react-i18next"

import { ExtendedTimelineEventType } from "@/components/Timeline/Timeline"
import CountDownTimer from "@/components/CountDownTimer"
import { formatCurrencyAmount } from "@/utils/format"
import { walletDummyData } from "@/data/walletData"
import { Button } from "@/components/Button/Button"
import { Icon } from "@/components/Icon/Icon"
import { TgeWrapper } from "../Wrapper"
import { TextInput } from "@/components/InputField/TextInput"
import { useRef } from "react"

type LiveProps = {
  eventData: ExtendedTimelineEventType
}

const Live = ({ eventData }: LiveProps) => {
  const { t } = useTranslation()
  const textRef = useRef<HTMLInputElement>(null)

  // @TODO getBalance API instead of walletDummyData and variable below
  const balance = walletDummyData.balance

  const clickProvideLiquidityBtn = (balancePercentage: number) => {
    // eslint-disable-next-line no-console
    console.log("Providing " + balancePercentage + "%")
    if (!textRef.current?.value) return
    textRef.current.value = (balance * balancePercentage) / 100 + ""
  }

  return (
    <TgeWrapper label={t("tge.live")}>
      {eventData?.nextEventDate && (
        <CountDownTimer endOfEvent={eventData.nextEventDate} />
      )}
      <TgeWrapper.Inner className="gap-0">
        <span className="w-full pb-2.5 text-center text-base font-semibold">
          Provide Liquidity
        </span>
        <div className="relative flex w-full max-w-[400px] flex-col items-center gap-2.5 rounded-t-2xl border border-bd-primary bg-secondary px-3 py-4">
          <span className="w-full text-left text-xs opacity-50">
            You&apos;re Paying
          </span>
          <div className="flex w-full flex-col justify-between gap-2">
            <div className="flex w-full justify-between">
              <div className="flex flex-col">
                {/* //////////////////////////////////////// */}
                {/* //////////////////////////////////////// */}
                {/* /  Create Masked Input with formatting / */}
                {/* //////////////////////////////////////// */}
                {/* //////////////////////////////////////// */}
                {balance ? (
                  <TextInput
                    ref={textRef}
                    defaultValue={0}
                    max={balance}
                    aria-valuemax={balance}
                    containerClassName="pl-0 h-8"
                    inputClassName="font-geist-mono text-2xl"
                    type="number"
                  />
                ) : (
                  <span className="">Connect your wallet</span>
                )}
                {/* <span className="font-geist-mono text-2xl">500</span> */}
              </div>
              <div className="flex h-fit items-center gap-2 rounded-full bg-default p-1 pr-3 text-sm font-medium">
                <Icon icon="SvgBorgCoin" className="text-2xl" />
                <span>BORG</span>
              </div>
            </div>
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  size="xs"
                  color="secondary"
                  btnText="25%"
                  className="h-[24px] px-1"
                  textClassName="text-[12px] leading-none text-fg-tertiary font-normal"
                  onClick={() => clickProvideLiquidityBtn(25)}
                />
                <Button
                  size="xs"
                  color="secondary"
                  btnText="50%"
                  className="h-[24px] px-1"
                  textClassName="text-[12px] leading-none text-fg-tertiary font-normal"
                  onClick={() => clickProvideLiquidityBtn(50)}
                />
                <Button
                  size="xs"
                  color="secondary"
                  btnText="MAX"
                  className="h-[24px] px-1"
                  textClassName="text-[12px] leading-none text-fg-tertiary font-normal"
                  onClick={() => clickProvideLiquidityBtn(100)}
                />
              </div>
              <p className="text-left text-xs opacity-50">
                Balance:{" "}
                <span>
                  {formatCurrencyAmount(walletDummyData.balance, false)}
                </span>
              </p>
            </div>
          </div>
        </div>
        <div className="border-t-none relative flex w-full max-w-[400px] flex-col items-center gap-2 rounded-b-2xl border border-t-0 border-bd-primary bg-secondary px-2 pb-2 pt-3">
          <span className="w-full pl-1 text-left text-xs opacity-50">
            To receive
          </span>
          <div className="border-t-none relative flex w-full max-w-[400px] flex-col items-center gap-2.5 rounded-lg border border-bd-primary bg-tertiary px-3 py-2">
            <div className="flex h-fit items-center gap-2 rounded-full p-1 pr-3 text-sm font-medium">
              <Icon icon="SvgBorgCoin" className="text-2xl" />
              <span>BORG</span>
            </div>
          </div>
        </div>
      </TgeWrapper.Inner>
    </TgeWrapper>
  )
}

export default Live
