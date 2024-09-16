import { angelStakingCards } from "@/data/angelStaking"
import StakingCard from "../Cards/StakingCard"
import { Button } from "../Button/Button"
import Img from "../Image/Img"
import howItWorks from "@/assets/how-it-works.png"
import { useRef } from "react"
import useScrollAnimation from "@/hooks/useScrollAnimation"
import { twMerge } from "tailwind-merge"
import { useWindowSize } from "@/hooks/useWindowSize"

const HowItWorks = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const { isMobile } = useWindowSize()

  return (
    <>
      <section
        ref={containerRef}
        className="flex w-full flex-col justify-start gap-4 pb-20 pt-4 md:flex-row md:px-16 md:pt-[112px]"
      >
        <div className="relative flex flex-col gap-6 px-5 pb-4 pt-16 md:px-0 md:pt-0">
          <Img src={howItWorks} customClass="absolute top-0" />
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
        <div className="flex items-start gap-4">
          {/* Scroll beam */}
          {!isMobile && (
            <div className="relative z-[2] h-full">
              <div className="absolute h-full px-[62px] pb-6 pt-4 md:pt-0">
                <div className="flex h-full w-[3px]">
                  <div className="mx-[1px] h-full w-[1px] bg-brand-primary shadow shadow-brand-primary"></div>
                </div>
              </div>
              <div
                className={twMerge(
                  "sticky top-[360px] mb-6 h-[calc(100vh-360px)] bg-accent px-[62px] pt-4 md:pt-0",
                )}
              >
                <div className="h-full w-[3px] bg-tertiary"></div>
              </div>
              <div className="absolute bottom-0 h-[647px] w-full bg-accent"></div>
            </div>
          )}

          <div className="z-[3] flex flex-col items-center gap-6 pb-6 pt-4 md:pt-0">
            {angelStakingCards.map((card, index) => (
              <StakingCard key={index} index={index} card={card} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default HowItWorks
