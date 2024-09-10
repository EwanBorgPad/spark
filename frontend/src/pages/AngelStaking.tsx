import Img from "@/components/Image/Img"
import React from "react"
import solanaImg from "@/assets/solana.png"
import sanctumImg from "@/assets/sanctum.png"
import angelStakingImg from "@/assets/angelStaking.png"
import { Button } from "@/components/Button/Button"
import StakingCard from "@/components/Cards/StakingCard"
import { angelStakingCards } from "@/data/angelStaking"

const AngelStaking = () => {
  return (
    <main className="relative z-[10] flex w-full max-w-full flex-col items-center overflow-y-hidden bg-accent py-[48px] font-normal text-fg-primary lg:py-[72px]">
      <div className="absolute top-12 z-[-1] w-screen overflow-hidden lg:top-[72px]">
        <img
          src={angelStakingImg}
          alt="abstract green stripes backdrop image"
          className="ml-[-200px] w-[852px] opacity-50 mix-blend-lighten"
        />
      </div>
      <section className="z-[1] flex min-h-screen w-full flex-col items-start gap-5 px-5 pb-20 pt-10">
        <div className="flex flex-col gap-3">
          <div className="flex gap-2 rounded-xl border border-bd-primary bg-default/75 px-3 py-2">
            <span>Built on</span>
            <Img
              src={solanaImg}
              size="none"
              customClass="w-[108px] rounded-none"
              imgClassName="object-contain"
            />
          </div>
          <div className="flex gap-2 rounded-xl border border-bd-primary bg-default/75 px-3 py-2">
            <span>Powered by</span>
            <Img
              src={sanctumImg}
              size="none"
              customClass="w-[85px] rounded-none"
              imgClassName="object-contain"
            />
          </div>
        </div>
        <h1 className="text-[40px] font-medium leading-[48px] tracking-[-0.4px]">
          Turn your staking yield into angel investments.
        </h1>
        <h2 className="text-lg font-normal leading-relaxed">
          Automatically accumulate BorgPad investments directly into your
          wallet, simply by staking $SOL.
        </h2>
        <Button
          btnText="Register Your Interest"
          size="lg"
          className="px-4 py-3 text-base font-medium leading-normal"
          textClassName="text-base font-normal"
        />
      </section>
      <section className="flex w-full flex-col justify-start gap-12 pb-20 pt-5">
        <div className="flex flex-col gap-6  px-5 pb-4 pt-16">
          <div className="flex flex-col gap-3">
            <h2 className="w-full text-left text-4xl font-semibold leading-[44px]">
              How it works
            </h2>
            <p className="text-base font-normal leading-normal">
              Stake your $SOL with us & transform your APY into early-stage
              investments.
            </p>
          </div>
          <div className="flex w-full justify-start">
            <Button
              btnText="Register Your Interest"
              size="lg"
              className="px-4 py-3 text-base font-medium leading-normal"
              textClassName="text-base font-normal"
            />
          </div>
        </div>
        <div className="flex flex-col items-center gap-6 p-4 pb-6">
          {angelStakingCards.map((card, index) => (
            <StakingCard key={index} index={index} card={card} />
          ))}
        </div>
      </section>
    </main>
  )
}

export default AngelStaking
