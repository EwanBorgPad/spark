import React from "react"
import { Icon } from "../Icon/Icon"

const LiveLP = () => {
  return (
    <div className="relative flex w-full max-w-[400px] flex-col items-center rounded-3xl border border-bd-secondary bg-secondary p-4">
      <span className="w-full pb-2.5 text-center text-base">
        Provide Liquidity
      </span>
      <div className="relative flex w-full max-w-[400px] flex-col items-center gap-2.5 rounded-t-2xl border border-bd-primary bg-secondary px-3 py-4">
        <span className="w-full text-left text-xs opacity-50">
          You&apos;re Paying
        </span>
        <div className="flex w-full justify-between">
          <div className="flex flex-col">
            <span className="font-geist-mono text-2xl">500</span>
            <span className="w-full text-left text-xs opacity-50">
              Balance: 10,000
            </span>
          </div>
          <div className="flex h-fit items-center gap-2 rounded-full bg-default p-1 pr-3 text-sm font-medium">
            <Icon icon="SvgBorgCoin" className="text-2xl" />
            <span>BORG</span>
          </div>
        </div>
      </div>
      <div className="border-t-none relative flex w-full max-w-[400px] flex-col items-center gap-2 rounded-b-2xl border border-t-0 border-bd-primary bg-secondary px-2 pb-2 pt-3">
        <span className="w-full pl-1 text-left text-xs opacity-50">
          To receive
        </span>
        <div className="border-t-none relative flex w-full max-w-[400px] flex-col items-center gap-2.5 rounded-lg border border-bd-primary bg-tertiary px-3 py-2"></div>
      </div>
    </div>
  )
}

export default LiveLP
