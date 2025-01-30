import { Link, ScrollRestoration } from "react-router-dom"

import solanaImg from "@/assets/angelStaking/solana.png"
import swissborgLogo from "@/assets/landingPage/swissborg-logo.png"
import angelStakingTexture1Mob from "@/assets/angelStaking/angelStakingTexture1-mob.png"
import angelStakingTexture1 from "@/assets/angelStaking/angelStakingTexture1.png"
import angelStakingBottom from "@/assets/angelStaking/angelStakingBottom-min.png"
import fearlessBackdrop from "@/assets/landingPage/fearless-backdrop-min.png"
import fearlessBackdropMobile from "@/assets/landingPage/fearless-backdrop-mobile-min.png"
import divider from "@/assets/landingPage/fearless-divider-min.png"
import dividerMobile from "@/assets/landingPage/fearless-divider-min.png"

import Img from "@/components/Image/Img"
import DontBeACexToy from "@/components/LandingPage/DontBeACexToy"
import DiscoverSection from "@/components/LandingPage/DiscoverSection"
import JoinCommunityBtn from "@/components/Button/JoinTheCommunityBtn"
import RotatingSubtitle from "@/components/LandingPage/RotatingSubtitle"
import { Button } from "@/components/Button/Button"
import CountdownBtnForNextLbp from "@/components/Button/CountdownBtnForNextLbp"

const LandingPage = () => {
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
        <img src={angelStakingTexture1} role="presentation" className="hidden w-full mix-blend-lighten md:flex" />
      </div>
      <section className="z-[1] flex w-full flex-col items-start gap-5 px-5 pb-[60px] pt-20 md:pb-[68px] md:pt-[56px]">
        <div className="flex w-full flex-col items-start md:items-center ">
          <div className="flex flex-col gap-3 pb-10 md:flex-row md:pb-20">
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
              <span>By the minds of</span>
              <Img
                src={swissborgLogo}
                size="custom"
                customClass="w-[85px] rounded-none"
                imgClassName="object-contain"
              />
            </div>
          </div>
          <RotatingSubtitle />
          <h1 className="max-w-[720px] animate-fade-in-from-below-slow pb-[66px] text-[40px] font-semibold leading-[48px] tracking-[-0.4px] md:text-center md:text-[68px] md:leading-[74px]">
            <span>Experience</span>{" "}
            <div className="flex flex-row items-center">
              <span
                style={{ animationDelay: "500ms" }}
                className="translate-y-[50px] animate-fade-in-from-below-slow text-brand-primary opacity-0"
              >
                Better
              </span>
              <span
                style={{ animationDelay: "1200ms" }}
                className="translate-y-[50px] animate-fade-in-from-below-slow text-brand-primary opacity-0"
              >
                Than
              </span>
              <span
                style={{ animationDelay: "1900ms" }}
                className="translate-y-[50px] animate-fade-in-from-below-slow text-brand-primary opacity-0"
              >
                CEX
              </span>
            </div>
          </h1>
          <div className="flex flex-col items-center gap-6">
            <div className="flex w-full flex-col items-center gap-4 md:flex-row">
              <Link to={"/goat-pools"} className="group relative h-fit w-full min-w-[220px]">
                <Button
                  btnText="Explore Launch Pools"
                  textClassName="text-sm px-3"
                  className="explore-goat-pools w-full px-6 py-4 hover:opacity-100"
                />
                <div className="absolute inset-0 z-[-1] h-full w-full rounded-xl shadow-around-1 transition-shadow duration-500 group-hover:shadow-around-2"></div>
              </Link>
              <Link to={"/blitz-pools"} className="group relative h-fit w-full min-w-[220px]">
                <Button
                  btnText="Explore Blitz Pools"
                  textClassName="text-sm px-3"
                  className="explore-blitz-pools w-full px-6 py-4 hover:opacity-100"
                />
                <div className="absolute inset-0 z-[-1] h-full w-full rounded-xl shadow-around-1 transition-shadow duration-500 group-hover:shadow-around-2"></div>
              </Link>
            </div>
            {/* PLACE FOR PROJECT COUNTDOWN */}
            <CountdownBtnForNextLbp projectId="zkagi" />
          </div>
        </div>
      </section>

      <section className="relative z-[1] w-full gap-5 overflow-hidden px-5 pt-16 md:px-16 md:pt-28">
        <div className="absolute bottom-0 left-0 right-0 z-[-1] flex max-w-[1282px] justify-center overflow-hidden md:pb-10">
          <img src={fearlessBackdropMobile} role="presentation" className="w-screen min-w-0 md:hidden" />
          <img src={fearlessBackdrop} role="presentation" className="hidden w-full md:flex" />
        </div>

        <div className="flex w-full flex-col items-center gap-5 pb-6 md:gap-6">
          <h2 className="header-mobile-size-small header-mobile-size-smallest flex max-w-[700px] flex-row flex-wrap gap-x-2.5 text-left text-4xl font-semibold leading-[44px] md:justify-center md:text-center md:text-[40px] md:leading-[48px]">
            <span>Home of the</span>
            <span>Fearless Founders,</span>
            <span>Land of the Thriving</span>
            <span>TGEs.</span>
          </h2>
          <h2 className="max-w-[700px] text-left text-lg font-normal leading-relaxed opacity-75 md:text-center">
            It&#39;s time to bring the upside back on-chain & fall in love with token launches again. We&#39;re
            empowering Teams & Communities to reclaim TGEs from the CEX-Cartel.
          </h2>
          <JoinCommunityBtn />
          <div className="z-[-1] flex w-screen min-w-0 justify-center overflow-hidden px-0 md:pt-[200px]">
            <img src={dividerMobile} role="presentation" className="w-screen min-w-0 md:hidden" />
            <img src={divider} role="presentation" className="hidden w-screen min-w-0 max-w-[800px] md:flex" />
          </div>
        </div>
      </section>

      <DontBeACexToy />

      <DiscoverSection />

      <section className="relative z-[1] w-full gap-5 overflow-hidden px-5 py-16 md:max-h-[432px] md:px-16 md:py-28">
        <div className="absolute top-0 z-[-1] flex max-w-[100vw] justify-center overflow-hidden lg:bottom-0">
          <img src={angelStakingTexture1Mob} role="presentation" className="h-[476px] md:hidden" />
          <img src={angelStakingBottom} role="presentation" className="hidden w-full md:flex" />
        </div>

        <div className="flex w-full flex-col items-center md:gap-6">
          <h2 className="max-w-[520px] pb-5 text-center text-4xl font-semibold leading-[44px] md:max-w-[768px] md:pb-0 md:text-[40px] md:leading-[48px]">
            Let&#39;s Heal Web3, Together.
          </h2>
          <h3 className="max-w-[500px] pb-10 text-center text-lg font-normal leading-relaxed md:max-w-[768px] md:pb-[16px]">
            Web3 was built by the degens, for the community. Today, VCs, Market Makers, & CEXs groom young projects as
            cash cows & exploit communities as exit liquidity.
          </h3>
          <div className="relative h-fit">
            <JoinCommunityBtn className="mt-0 md:mt-0" />
            <div className="absolute inset-0 z-[-1] h-full w-full animate-pulse rounded-xl shadow-around shadow-brand-primary/60"></div>
          </div>
        </div>
      </section>

      <ScrollRestoration />
    </main>
  )
}

export default LandingPage
