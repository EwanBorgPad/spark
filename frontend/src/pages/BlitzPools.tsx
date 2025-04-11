import { ScrollRestoration } from "react-router-dom"
import { useTranslation } from "react-i18next"

import orcaLogo from "@/assets/launchPools/orca-logo.png"
import jupiterLogo from "@/assets/launchPools/jupiter-logo.png"
import raydiumLogo from "@/assets/launchPools/raydium-logo.png"
import swissborgLogo from "@/assets/launchPools/swissborg-logo.png"
import blitzPoolsLogo from "@/assets/launchPools/blitz-pools-logo.png"

import Img from "@/components/Image/Img"
import { ActiveProjects } from "@/components/Projects/ActiveProjects"
import { CompletedProjects } from "@/components/Projects/CompletedProjects"
import { useWindowSize } from "@/hooks/useWindowSize"

const displayLogos = [swissborgLogo, jupiterLogo, orcaLogo, raydiumLogo]

const BlitzPools = () => {
  const { t } = useTranslation()
  const { isMobile } = useWindowSize()

  return (
    <main className="relative z-[10] flex min-h-screen w-full select-none flex-col items-center bg-transparent pt-[48px] md:pt-[68px]">
      <div className="absolute top-[48px] z-[-1] w-screen opacity-100 md:top-[68px] ">
        <video
          src="https://pub-afd56fb014c94eac935a52c2d0d6a5e8.r2.dev/unicorn-animation/sample3%20(online-video-cutter__78pct_smaller.mp4"
          className="left-0 z-[101] h-[642px] w-full animate-looped-video object-cover opacity-50 md:h-auto"
          autoPlay
          loop
          muted
          playsInline
        />
      </div>

      <section className="z-[11] flex w-fit flex-col items-center gap-4 bg-transparent px-4 pt-[60px] md:pt-[80px]">
        <div className="mb-2 h-[40px] w-[170px]">
          <Img src={blitzPoolsLogo} customClass="w-full h-full animate-fade-in-from-below-slow" />
        </div>
        <h1 className="text-center text-[40px] font-semibold leading-[120%] md:w-full">
          {"Blazing fast launch pools"}
          <br></br>
          <span className="text-brand-blitz">{"High voltage opportunities."}</span>
        </h1>
        <p className="max-w-[522px] text-center font-normal text-fg-secondary lg:text-lg">
          {
            "Provide liquidity for your favourite high-risk, low-valuation tokens and lock in rewards at fixed pre-TGE prices."
          }
        </p>
        <div className="flex flex-col items-center gap-4 pt-6">
          <span className="text-sm font-normal text-fg-primary opacity-90">{t("launch_pools.successful_lp")}</span>
          <div className="flex min-h-[32px] flex-wrap items-center justify-center gap-10 gap-y-3">
            {displayLogos.map((logo) => (
              <Img
                key={logo}
                src={logo}
                imgClassName="object-contain"
                customClass="rounded-none w-full max-w-[117px]"
              />
            ))}
            <span className="text-sm opacity-90">...and many more</span>
          </div>
        </div>
      </section>

      <section className="z-[11] flex w-full flex-col items-center gap-4 bg-transparent px-4 py-[60px] md:py-[80px]">
        <div className="flex w-full max-w-[1080px] flex-col items-center">
          <ul className="grid w-full grid-cols-1 place-content-center justify-start gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <ActiveProjects projectType="blitz" />
          </ul>
        </div>
      </section>

      <section className="z-[11] flex w-full flex-col items-center gap-4 bg-transparent px-4 py-[60px] md:py-[80px]">
        <div className="flex w-full max-w-[1080px] flex-col items-center">
          <h3 className="mb-8 text-center text-[28px] font-semibold leading-[120%] md:w-full md:text-[30px] lg:text-[32px]">
            {"Completed Blitz Pools"}
          </h3>
          <CompletedProjects projectType="blitz" />
        </div>
      </section>
      <ScrollRestoration />
    </main>
  )
}

export default BlitzPools