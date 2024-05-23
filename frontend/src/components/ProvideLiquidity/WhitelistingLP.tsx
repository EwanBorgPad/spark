import { formatDateForDisplay } from "@/utils/date-helpers"
import { formatCurrencyAmount } from "@/utils/format"
import { Button } from "@/components/Button/Button"

type WhitelistingDataType = {
  raiseTarget: number
  price: {
    coin: {
      iconUrl: string
      ticker: string
    }
    dollarPrice: number
    borgPrice: number
  }
  registrations: number
  vesting: {
    tgePercentage: number
    cliffPercentage: number
  }
  tokenGenerationEventDate: Date
}

const WhitelistingLP = ({ data }: { data: WhitelistingDataType }) => {
  return (
    <div className="relative flex w-full flex-col items-center gap-2 rounded-3xl border border-bd-secondary bg-secondary bg-texture bg-cover p-6 pt-[26px] text-sm text-fg-primary bg-blend-multiply">
      <div className="flex w-full items-center justify-between py-2.5">
        <span>Raise Target</span>
        <div className="flex gap-2">
          <span className="font-geist-mono">
            {formatCurrencyAmount(data.raiseTarget, false, 0)}
          </span>
          <span>BORG</span>
        </div>
      </div>
      <hr className="w-full border-bd-primary opacity-50"></hr>

      <div className="flex w-full items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <img
            src={data.price.coin.iconUrl}
            className={"h-[28px] w-[28px] rounded-full object-cover"}
          />
          <span>{data.price.coin.ticker}</span>
          <span>Price</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="font-geist-mono">
            {formatCurrencyAmount(data.price.dollarPrice, true, 5)}
          </span>
          <div className="flex gap-2">
            <span className="font-geist-mono">
              {formatCurrencyAmount(data.price.borgPrice, false, 5)}
            </span>
            <span>BORG</span>
          </div>
        </div>
      </div>
      <hr className="w-full border-bd-primary opacity-50"></hr>

      <div className="flex w-full items-center justify-between py-2.5">
        <span>Registrations</span>
        <span className="font-geist-mono">
          {formatCurrencyAmount(data.registrations, false, 0)}
        </span>
      </div>
      <hr className="w-full border-bd-primary opacity-50"></hr>

      <div className="flex w-full items-center justify-between py-2.5">
        <span>Vesting</span>
        <span>
          {`${data.vesting.tgePercentage}% TGE, ${data.vesting.cliffPercentage}% cliff`}
        </span>
      </div>
      <hr className="w-full border-bd-primary opacity-50"></hr>

      <div className="flex w-full items-center justify-between py-2.5">
        <span>Token Generation Event</span>
        <span>{formatDateForDisplay(data.tokenGenerationEventDate)}</span>
      </div>

      <div className="flex w-full flex-col truncate rounded-xl bg-brand-primary/10">
        <span className="py-3 text-center">
          Connect wallet to see the whitelist status
        </span>
        <Button
          size="xl"
          color="primary"
          className="w-full"
          btnText="Select Wallet"
        />
      </div>
    </div>
  )
}

export default WhitelistingLP
