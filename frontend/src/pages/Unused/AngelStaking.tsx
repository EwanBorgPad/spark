import { ScrollRestoration, useNavigate } from "react-router-dom"

import solanaImg from "@/assets/angelStaking/solana.png"
import sanctumImg from "@/assets/angelStaking/sanctum.png"
import mainGraph from "@/assets/angelStaking/main-graph.png"
import angelStakingTexture1Mob from "@/assets/angelStaking/angelStakingTexture1-mob.png"
import angelStakingTexture1 from "@/assets/angelStaking/angelStakingTexture1.png"
import angelStakingBottom from "@/assets/angelStaking/angelStakingBottom-min.png"

import Img from "@/components/Image/Img"
import Steps from "@/components/AngelStaking/Steps"
import HowItWorks from "@/components/AngelStaking/HowItWorks"
import WhyStakeSol from "@/components/AngelStaking/WhyStakeSol"
import MaximiseValue from "@/components/AngelStaking/MaximiseValue"
import InvestmentFocus from "@/components/AngelStaking/InvestmentFocus"
import { useEffect } from "react"
import JoinCommunityBtn from "@/components/Button/JoinCommunityBtn"

const AngelStaking = () => {
  const navigate = useNavigate()

  //////////////////////////////////////////////////////////////////////////////
  // @SolanaId - useEffect below is for Solana ID whitelisting launch (01.11.2024) - remove this //redirection when we officially launch the rest of the app
  //////////////////////////////////////////////////////////////////////////////
  useEffect(() => {
    if (import.meta.env.VITE_ENVIRONMENT_TYPE === "production") {
      navigate("/launch-pools")
    }
  }, [navigate])

  return (
    <main
      className="relative z-[10] flex w-full max-w-[100vw] flex-col items-center
     bg-accent pt-[48px] font-normal text-fg-primary lg:pt-[72px]"
    >
      <div className="absolute top-12 z-[-1] flex w-screen justify-center overflow-hidden lg:top-[72px]">
        <img
          src={angelStakingTexture1Mob}
          role="presentation"
          className="ml-[-200px] w-[852px] opacity-50 mix-blend-lighten md:hidden"
        />
        <img src={angelStakingTexture1} role="presentation" className="text- hidden w-full mix-blend-lighten md:flex" />
      </div>
      <section className="z-[1] flex w-full flex-col items-start gap-5 px-5 pb-[60px] pt-20 md:pt-[120px]">
        <div className="flex w-full flex-col items-start gap-5 md:items-center md:gap-6">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="flex gap-2 rounded-xl border border-bd-primary bg-default/75 px-3 py-2">
              <span>Built on</span>
              <Img
                src={solanaImg}
                size="custom"
                customClass="w-[108px] rounded-none"
                imgClassName="object-contain"
                alt="Solana logo"
              />
            </div>
            <div className="flex gap-2 rounded-xl border border-bd-primary bg-default/75 px-3 py-2">
              <span>Powered by</span>
              <Img src={sanctumImg} size="custom" customClass="w-[85px] rounded-none" imgClassName="object-contain" />
            </div>
          </div>
          <h1 className="max-w-[720px] text-[40px] font-medium leading-[48px] tracking-[-0.4px] md:text-center md:text-[56px] md:leading-[58px]">
            Turn your staking yield into angel investments.
          </h1>
          <h2 className="max-w-[500px] text-lg font-normal leading-relaxed md:text-center">
            Automatically accumulate BorgPad investments directly into your wallet, simply by staking $SOL.
          </h2>
          <JoinCommunityBtn
            label="Register Your Interest"
            className="max-w-[240px] py-3"
            textClass="px-0 text-base font-medium"
          />
        </div>
      </section>

      <Steps />

      <MaximiseValue />

      <InvestmentFocus />

      <HowItWorks />

      <div className="hidden w-full max-w-[1227px] px-4 pb-10 pt-[152px] md:block">
        <Img src={mainGraph} showFallback={false} size="custom" customClass="rounded-none" />
      </div>

      <WhyStakeSol />

      {/* <AngelStakingFAQ /> */}

      <section className="relative z-[1] w-full gap-5 overflow-hidden px-5 py-16 md:px-16 md:py-28">
        <div className="absolute top-0 z-[-1] flex max-w-[100vw] justify-center overflow-hidden lg:bottom-0">
          <img src={angelStakingTexture1Mob} role="presentation" className="h-[476px] md:hidden" />
          <img src={angelStakingBottom} role="presentation" className="hidden w-full md:flex" />
        </div>

        <div className="flex w-full flex-col items-center gap-5 md:gap-6">
          <h1 className="max-w-[520px] text-center text-4xl font-semibold leading-[44px] md:max-w-[768px] md:text-5xl">
            We&#39;re building around the clock to launch our Angel Staking program.
          </h1>
          <h2 className="max-w-[500px] text-center text-lg font-normal leading-relaxed md:max-w-[768px]">
            Register your interest now, before the official launch, to secure your OG status.
          </h2>
          <JoinCommunityBtn
            label="Register Your Interest"
            className="max-w-[240px] py-3"
            textClass="px-0 text-base font-medium"
          />
        </div>
      </section>

      <ScrollRestoration />
    </main>
  )
}

export default AngelStaking
