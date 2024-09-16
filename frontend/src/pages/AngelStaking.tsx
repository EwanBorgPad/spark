import angelStakingTexture1Mob from "@/assets/angelStakingTexture1-mob.png"
import angelStakingTexture1 from "@/assets/angelStakingTexture1.png"
import sanctumImg from "@/assets/sanctum.png"
import solanaImg from "@/assets/solana.png"

import { angelStakingCards } from "@/data/angelStaking"
import StakingCard from "@/components/Cards/StakingCard"
import { Button } from "@/components/Button/Button"
import Img from "@/components/Image/Img"
import InvestmentFocus from "@/components/AngelStaking/InvestmentFocus"
import HowItWorks from "@/components/AngelStaking/HowItWorks"

const AngelStaking = () => {
  return (
    <main className="relative z-[10] flex w-full max-w-full flex-col items-center bg-accent py-[48px] font-normal text-fg-primary lg:py-[72px]">
      <div className="absolute top-12 z-[-1] flex w-screen justify-center overflow-hidden lg:top-[72px]">
        <img
          src={angelStakingTexture1Mob}
          alt="abstract green stripes backdrop image"
          className="ml-[-200px] w-[852px] opacity-50 mix-blend-lighten md:hidden"
        />
        <img
          src={angelStakingTexture1}
          alt="abstract green stripes backdrop image"
          className="hidden w-full mix-blend-lighten md:flex"
        />
      </div>
      <section className="z-[1] flex min-h-[550px] w-full flex-col items-start gap-5 px-5 pb-10 pt-20 md:min-h-[606px] md:pt-[120px]">
        <div className="flex w-full flex-col items-start gap-5 md:items-center md:gap-6">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="flex gap-2 rounded-xl border border-bd-primary bg-default/75 px-3 py-2">
              <span>Built on</span>
              <Img
                src={solanaImg}
                size="custom"
                customClass="w-[108px] rounded-none"
                imgClassName="object-contain"
              />
            </div>
            <div className="flex gap-2 rounded-xl border border-bd-primary bg-default/75 px-3 py-2">
              <span>Powered by</span>
              <Img
                src={sanctumImg}
                size="custom"
                customClass="w-[85px] rounded-none"
                imgClassName="object-contain"
              />
            </div>
          </div>
          <h1 className="max-w-[520px] text-[40px] font-medium leading-[48px] tracking-[-0.4px] md:text-center">
            Turn your staking yield into angel investments.
          </h1>
          <h2 className="max-w-[500px] text-lg font-normal leading-relaxed md:text-center">
            Automatically accumulate BorgPad investments directly into your
            wallet, simply by staking $SOL.
          </h2>
          <Button
            btnText="Register Your Interest"
            size="lg"
            className="px-4 py-3 text-base font-medium leading-normal md:mt-10"
            textClassName="text-base font-normal"
          />
        </div>
      </section>

      <InvestmentFocus />

      <HowItWorks />
    </main>
  )
}

export default AngelStaking
