import React, { useRef } from "react"
import discover1 from "@/assets/landingPage/discover1.png"
import discover2 from "@/assets/landingPage/discover2.png"
import discover3 from "@/assets/landingPage/discover3.png"
import Img from "../Image/Img"
import useScrollAnimation from "@/hooks/useScrollAnimation"
import { useWindowSize } from "@/hooks/useWindowSize"
import { twMerge } from "tailwind-merge"
import { Button } from "../Button/Button"
import { Link } from "react-router-dom"

type Item = {
  path: string
  description: string
  imgUrl: string
}

const content: Item[] = [
  {
    path: "",
    description: "Stake $SOL, Receive Airdrops from Early Investments.",
    imgUrl: discover1,
  },
  {
    path: "",
    description: "Get Early Access to Exclusive Token Sales.",
    imgUrl: discover2,
  },
  {
    path: "/launch-pools",
    description: "Provide Liquidity to Earn Rewards at Pre-TGE Valuations",
    imgUrl: discover3,
  },
]

const DiscoverSection = () => {
  const ref = useRef<HTMLDivElement>(null)
  const { isMobile } = useWindowSize()

  const { isActive } = useScrollAnimation({
    ref: ref,
    threshold: isMobile ? 0.15 : 0.75,
  })
  const transitionBase = "transition-translate-n-opacity translate-y-9 scale-90 opacity-0 duration-[800ms]"
  const transitionActive = "translate-y-0 scale-100 opacity-100"

  return (
    <section className="flex w-full flex-col items-center gap-12 px-5 py-16 md:gap-20 md:px-16 md:py-28">
      <h2 className="text-center text-4xl font-semibold leading-[44px] md:text-5xl">
        Discover the BetterThanCEX Ecosystem
      </h2>
      <div
        ref={ref}
        className={twMerge(
          "flex w-full flex-col items-center justify-center gap-12 md:flex-row md:items-start",
          transitionBase,
          isActive && transitionActive,
        )}
      >
        {content.map((item, index) => (
          <div key={index} className="flex max-w-[405px] flex-col items-center gap-3">
            <Img src={item.imgUrl} customClass="max-w-[240px]" />
            <div className="flex w-full flex-col gap-4">
              {item.path ? (
                <Link to={item.path} className="w-full">
                  <Button color="tertiary" btnText="Learn More" className="w-full" />
                </Link>
              ) : (
                <span className="text-center opacity-50">Coming Soon</span>
              )}
              <p className="text-center text-fg-secondary">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default DiscoverSection
