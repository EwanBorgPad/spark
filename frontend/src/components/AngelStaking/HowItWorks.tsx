import { useRef } from "react"

import howItWorks from "@/assets/angelStaking/how-it-works.png"
import VerticalTimeline from "./VerticalTimeline"
import { Button } from "../Button/Button"
import Img from "../Image/Img"

const HowItWorks = () => {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <section
      ref={containerRef}
      className="flex w-full flex-col items-center pb-20 pt-4 md:px-16 md:pt-[112px]"
    >
      <div className="flex flex-col justify-start gap-4 md:flex-row">
        <div className="relative flex flex-col gap-6 px-5 pb-4 pt-16 md:px-0 md:pt-0">
          <Img src={howItWorks} customClass="absolute top-0 z-[-1]" />
          <div className="z-[1] flex flex-col gap-3">
            <h2 className="w-full text-left text-4xl font-semibold leading-[44px] md:text-[48px] md:leading-[120%]">
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
        <VerticalTimeline />
      </div>
    </section>
  )
}

export default HowItWorks
