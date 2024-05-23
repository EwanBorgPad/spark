import CountDownTimer from "../CountDownTimer"
import { dummyData } from "../../data/data"
import WhitelistingLP from "./WhitelistingLP"

const ProvideLiquiditySection = () => {
  return (
    <section className="relative mt-3 flex w-full max-w-[400px] flex-col items-center rounded-3xl border border-bd-secondary bg-secondary bg-texture-zoomed-out bg-cover bg-blend-multiply">
      <span className="absolute -top-[18px] rounded-full bg-brand-primary px-4 py-2 text-fg-alt-default">
        Whitelisting
      </span>
      <CountDownTimer endsIn={dummyData.distributionStartDate} />
      <WhitelistingLP data={dummyData.whitelisting} />
    </section>
  )
}

export default ProvideLiquiditySection
