import { ScrollRestoration, useNavigate } from "react-router-dom"
import { twMerge } from "tailwind-merge"
import { Button } from "@/components/Button/Button"
import { Icon } from "@/components/Icon/Icon"
import Img from "@/components/Image/Img"

import solanaImg from "@/assets/angelStaking/solana.png"
import swissborgLogo from "@/assets/landingPage/swissborg-logo.png"
import angelStakingTexture1Mob from "@/assets/angelStaking/angelStakingTexture1-mob.png"
import angelStakingTexture1 from "@/assets/angelStaking/angelStakingTexture1.png"
import angelStakingBottom from "@/assets/angelStaking/angelStakingBottom-min.png"
import divider from "@/assets/landingPage/fearless-divider-min.png"
import dividerMobile from "@/assets/landingPage/fearless-divider-min.png"
import fearlessBackdrop from "@/assets/landingPage/fearless-backdrop-min.png"
import fearlessBackdropMobile from "@/assets/landingPage/fearless-backdrop-mobile-min.png"
import boltLogo from "@/assets/landingPage/bolt-logo-small.png"

import DontBeACexToy from "@/components/LandingPage/DontBeACexToy"
import DiscoverSection from "@/components/LandingPage/DiscoverSection"
import JoinCommunityBtn from "@/components/Button/JoinTheCommunityBtn"
import RotatingSubtitle from "@/components/LandingPage/RotatingSubtitle"
import HeroCtaSection from "@/components/LandingPage/HeroCtaSection"

const MathisPage = () => {
  const navigate = useNavigate();
  return (
    <main className="relative z-[10] flex w-full max-w-[100vw] flex-col items-center bg-accent pt-[48px] font-normal text-fg-primary lg:pt-[72px]">
      {/* Logo carré en haut à gauche */}
      <div className="fixed top-4 left-4 z-50">
        <Img src={boltLogo} size="custom" customClass="w-12 h-12 rounded-lg shadow-lg" alt="Bolt Logo" />
      </div>

      {/* Hero Section */}
      <section className="z-[1] flex w-full flex-col items-start gap-5 px-5 pb-[60px] pt-10 md:pb-[56px] md:pt-[40px]">
        <div className="flex w-full flex-col items-center">
          <div className="flex gap-2 rounded-xl bg-overlay/75 px-3 py-2 backdrop-blur-sm mb-8">
            <span className="text-sm">Built on</span>
            <Img
              src={solanaImg}
              size="custom"
              customClass="w-[95px] rounded-none"
              imgClassName="object-contain"
              alt="Solana logo"
            />
          </div>

          <h1 className="text-[40px] font-medium leading-[48px] tracking-[-0.4px] md:text-[68px] md:leading-[74px] mb-4">
            <span className="text-brand-primary">Spark-it</span>
          </h1>

          <h2 className="text-xl md:text-2xl text-center mb-12 opacity-75">
            Make your idea become real
          </h2>

          <Button
            btnText="Download App on iOS & Android"
            size="xl"
            className="mt-[2px] w-full px-7 py-4 text-lg font-medium leading-normal md:mt-[24px] md:w-auto"
            textClassName="text-sm font-medium"
            onClick={() => navigate("/pwa-install")}
          />
        </div>
      </section>

      {/* Front-end Section */}
      <section className="w-full px-5 py-16 md:px-16 bg-secondary">
        <div className="flex flex-col items-center gap-8">
          <h2 className="text-3xl font-semibold text-center">For Dreamers, Builders and Degens</h2>
          <div className="max-w-3xl text-center">
            <p className="text-lg opacity-75 mb-8">
              The app that transforms your ideas into reality. Built for innovators, degens, and visionaries.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-accent rounded-xl">
                <h3 className="text-xl font-medium mb-2">For Dreamers</h3>
                <p className="opacity-75">Turn your vision into a concrete project</p>
              </div>
              <div className="p-6 bg-accent rounded-xl">
                <h3 className="text-xl font-medium mb-2">For Builders</h3>
                <p className="opacity-75">Get funding to achieve the impossible!</p>
              </div>
              <div className="p-6 bg-accent rounded-xl">
                <h3 className="text-xl font-medium mb-2">For Degens</h3>
                <p className="opacity-75">Bet/trade on the next successful ideas that will impact the world.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How to launch a coin and fund an idea Section */}
      <section className="w-full flex flex-col items-center justify-center py-16 px-5">
        <h2 className="text-3xl font-semibold text-center mb-6">How to launch a coin and fund an idea ?</h2>
        <div className="w-full max-w-4xl flex flex-col md:flex-row gap-8">
          {/* Option 1 */}
          <div className="flex-1 bg-accent rounded-xl p-8 flex flex-col items-center shadow-md">
            <h3 className="text-2xl font-bold mb-4 text-center">Option 1</h3>
            <p className="text-base opacity-90 text-center">
              With our partners at <b>BorgPad</b>, raise funds directly from the community.<br />
              Then, a token is created with the funds deposited in the DAO.<br />
              Trading fees also partly go back into the DAO.
            </p>
          </div>
          {/* Option 2 */}
          <div className="flex-1 bg-accent rounded-xl p-8 flex flex-col items-center shadow-md">
            <h3 className="text-2xl font-bold mb-4 text-center">Option 2</h3>
            <p className="text-base opacity-90 text-center">
              In a permissionless way—because we believe everyone has ideas worth launching.<br />
              Go on X (Twitter), post the <b>$TICKER</b> of your token + the name + your idea.<br />
              A token is created instantly—trading fees fill the DAO.
            </p>
          </div>
        </div>
      </section>

      {/* How are ideas brought to life Section */}
      <section className="w-full flex flex-col items-center justify-center py-12 px-5">
        <h2 className="text-3xl font-semibold text-center mb-6">How are ideas brought to life?</h2>
        <div className="max-w-2xl w-full text-center text-lg opacity-80">
          Builders propose their services to the DAO, explaining what they can deliver and for how much.
        </div>
      </section>

      {/* Powered By Section */}
      <section className="w-full px-5 py-16 md:px-16">
        <div className="flex flex-col items-center gap-8">
          <h2 className="text-3xl font-semibold text-center">Built on top of :</h2>
          <div className="flex flex-wrap justify-center gap-12 items-center">
            <Img src={solanaImg} size="custom" customClass="h-12" alt="Solana" />
            <Img src={solanaImg} size="custom" customClass="h-12" alt="Solana" />
            <Img src={solanaImg} size="custom" customClass="h-12" alt="Solana" />
          </div>
        </div>
      </section>

      {/* All coin launched Section */}
      <section className="w-full px-5 py-16 md:px-16 bg-secondary">
        <div className="flex flex-col items-center gap-8">
          <h2 className="text-3xl font-semibold text-center">All coin launched are accessible :</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
            <a href="https://gm.gm" target="_blank" rel="noopener noreferrer" className="p-6 bg-accent rounded-xl hover:bg-accent/80 transition-colors">
              <h3 className="text-xl font-medium mb-2">GM GM</h3>
              <p className="opacity-75">Direct access to trading</p>
            </a>
            <a href="https://jup.ag" target="_blank" rel="noopener noreferrer" className="p-6 bg-accent rounded-xl hover:bg-accent/80 transition-colors">
              <h3 className="text-xl font-medium mb-2">Jup.ag</h3>
              <p className="opacity-75">Swap and trade tokens</p>
            </a>
          </div>
        </div>
      </section>

      {/* Legal Section */}
      <section className="w-full px-5 py-8 md:px-16">
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-8">
            <a href="/legal" className="text-sm opacity-75 hover:opacity-100">Legal Spark</a>
            <a href="/terms" className="text-sm opacity-75 hover:opacity-100">Terms of Service</a>
          </div>
        </div>
      </section>

      <ScrollRestoration />
    </main>
  )
}

export default MathisPage
