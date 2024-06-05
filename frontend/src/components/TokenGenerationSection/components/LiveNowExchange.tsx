import { useTranslation } from "react-i18next"
import React, { useRef } from "react"

import { TextInput } from "@/components/InputField/TextInput"
import { formatCurrencyAmount } from "@/utils/format"
import { walletDummyData } from "@/data/walletData"
import { Button } from "@/components/Button/Button"
import { Icon } from "@/components/Icon/Icon"
import raydiumImg from "@/assets/raydium.png"
import lrcCoinImg from "@/assets/lrcCoin.png"
import { TgeWrapper } from "./Wrapper"

const LiveNowExchange = () => {
  const { t } = useTranslation()
  const textRef = useRef<HTMLInputElement>(null)

  // @TODO getBalance API instead of walletDummyData and variable below
  const balance = walletDummyData.balance

  const clickProvideLiquidityBtn = (balancePercentage: number) => {
    // eslint-disable-next-line no-console
    console.log("Providing " + balancePercentage + "%")
    console.log(textRef.current?.value)
    if (!textRef.current?.value) return
    textRef.current.value = (balancePercentage / 100) * balance + ""
  }
  return (
    <TgeWrapper.Inner className="gap-0">
      <span className="w-full pb-2.5 text-center text-base font-semibold">
        Provide Liquidity
      </span>
      <div className="re relative flex w-full max-w-[400px] flex-col items-center gap-2.5 rounded-t-2xl border border-bd-primary bg-secondary px-3 py-4">
        <span className="w-full text-left text-xs opacity-50">
          You&apos;re Paying
        </span>
        <div className="flex w-full flex-col justify-between gap-2">
          <div className="flex w-full justify-between">
            <div className="flex flex-col">
              {/* ////////////////////////////////////////// */}
              {/* //  Create Masked Input with formatting // */}
              {/* ////////////////////////////////////////// */}
              <TextInput
                ref={textRef}
                placeholder={"0"}
                max={balance}
                aria-valuemax={balance}
                containerClassName="pl-0 h-8"
                inputClassName="font-geist-mono text-2xl"
                type="number"
              />
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
      <div className="border-t-none relative mb-4 flex w-full max-w-[400px] flex-col items-center gap-2 rounded-b-2xl border border-t-0 border-bd-primary bg-secondary px-2 pb-2 pt-3">
        <span className="w-full pl-1 text-left text-xs opacity-50">
          {t("tge.to_receive")}
        </span>
        <div className="border-t-none relative w-full max-w-[400px] items-center gap-2.5 rounded-lg border border-bd-primary bg-tertiary ">
          <div className="border-b-[1px] border-b-bd-primary px-3 py-2">
            <div className="flex h-fit items-center gap-2 rounded-full pb-1 text-base font-medium">
              <Icon icon="SvgBorgCoin" />
              <span className="font-geist-mono">BORG</span>
              <span className="font-normal opacity-50">+</span>
              <img src={lrcCoinImg} className="h-4 w-4 object-cover" />
              <span className="font-geist-mono text-base">LRC</span>
            </div>

            <div className="flex h-fit items-center gap-1.5 rounded-full text-xs font-medium text-fg-primary ">
              <Icon icon="SvgLock" className="mt-[-1px] text-base opacity-50" />
              <span className="opacity-50">{t("tge.liquidity_pool")}</span>
              <img src={raydiumImg} className="h-4 w-4 object-cover" />
              <span className="opacity-50">Raydium,</span>
              <span className="opacity-50">12-{t("tge.month_lockup")}</span>
            </div>
          </div>
          <div className="px-3 py-2">
            <div className="flex h-fit items-center gap-1.5 rounded-full text-xs font-medium text-fg-primary ">
              <img src={lrcCoinImg} className="h-4 w-4 object-cover" />
              <span className="font-geist-mono text-base">LRC</span>
            </div>
            <div className="flex h-fit items-center gap-1.5 rounded-full text-xs font-medium text-fg-primary ">
              <Icon icon="SvgChartLine" className="text-base opacity-50" />
              <span className="opacity-50">{t("tge.linearly_paid_out")}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex w-full flex-col gap-4">
        <Button size="lg" btnText="Supply $BORG" className="w-full" />
        <Button
          size="md"
          color="secondary"
          btnText="Buy $BORG"
          className="w-full py-2"
        />
        <p className="w-full text-center">
          {t("tge.participation_status")}:{" "}
          <span className="text-sm text-fg-success-primary">
            {t("tge.whitelisted")}
          </span>
        </p>
      </div>
    </TgeWrapper.Inner>
  )
}

export default LiveNowExchange
