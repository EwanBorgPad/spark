import { ScrollRestoration } from "react-router-dom"

import solanaImg from "@/assets/angelStaking/solana.png"
import swissborgLogo from "@/assets/landingPage/swissborg-logo.png"
import angelStakingTexture1Mob from "@/assets/angelStaking/angelStakingTexture1-mob.png"
import angelStakingTexture1 from "@/assets/angelStaking/angelStakingTexture1.png"
import angelStakingBottom from "@/assets/angelStaking/angelStakingBottom-min.png"
import divider from "@/assets/landingPage/fearless-divider-min.png"
import dividerMobile from "@/assets/landingPage/fearless-divider-min.png"
import fearlessBackdrop from "@/assets/landingPage/fearless-backdrop-min.png"
import fearlessBackdropMobile from "@/assets/landingPage/fearless-backdrop-mobile-min.png"

import Img from "@/components/Image/Img"
import DontBeACexToy from "@/components/LandingPage/DontBeACexToy"
import DiscoverSection from "@/components/LandingPage/DiscoverSection"
import JoinCommunityBtn from "@/components/Button/JoinTheCommunityBtn"
import RotatingSubtitle from "@/components/LandingPage/RotatingSubtitle"
import HeroCtaSection from "@/components/LandingPage/HeroCtaSection"
import { twMerge } from "tailwind-merge"
import { Button } from "@/components/Button/Button"
import { ROUTES } from "@/utils/routes"
import { useNavigate } from "react-router-dom"
import { usePrivy } from '@privy-io/react-auth';


const GetStarted = () => {
  const navigate = useNavigate()
  const { ready } = usePrivy();

  if (!ready) {
    return <div>Loading...</div>;
  }

  return (
    <main className="relative z-[10] flex min-h-screen w-full max-w-[100vw] flex-col items-center bg-accent pt-[48px] font-normal text-fg-primary lg:pt-[72px]">
      <section className="z-[1] flex h-full w-full flex-1 flex-col items-center justify-between px-5 pb-[60px] pt-10 md:pb-[56px] md:pt-[40px]">
        <div className="flex w-full flex-col items-center mt-[15vh]">
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
        </div>

        <div className="flex flex-col items-center gap-4 w-full">
          <Button
            onClick={() => {
              navigate(ROUTES.CONNECTION)
            }}
            btnText="Get Started"
            size="xl"
            className={twMerge(
              "mt-[2px] w-full px-7 py-4 text-lg font-medium leading-normal md:mt-[24px] md:w-auto",
            )}
            textClassName="text-sm font-medium"
          />
          <p className="text-sm text-center opacity-75 max-w-[400px]">
            By continuing, you agree to our Terms of Use and have read and agreed to our Privacy Policy.
          </p>
        </div>
      </section>
      <ScrollRestoration />
    </main>
  )
}

export default GetStarted
