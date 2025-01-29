import { useRef } from "react"
import discover1 from "@/assets/landingPage/discover1.png"
import discover2 from "@/assets/landingPage/discover2.png"
import useScrollAnimation from "@/hooks/useScrollAnimation"
import { useWindowSize } from "@/hooks/useWindowSize"
import { twMerge } from "tailwind-merge"
import DiscoverSectionCard from "../Cards/DiscoverSectionCard"

import blitzLogoSmall from "@/assets/landingPage/bolt-logo-small.png"
import goatLogoSmall from "@/assets/landingPage/goat-logo-small.png"

export type DiscoverSectionCardType = {
  path: string
  description: string
  imgUrl: string
  label: string
  imgClass?: string
}

const content: DiscoverSectionCardType[] = [
  {
    path: "/goat-pools",
    label: "Goat Pools",
    description: "Provide Liquidity, Earn Tokens at Pre-TGE Valuations.",
    imgUrl: goatLogoSmall,
    imgClass: "h-[80px] w-[80px]",
  },
  {
    path: "/blitz-pools",
    label: "Blitz Pools",
    description: "Blazing fast pools with electric return opportunities",
    imgUrl: blitzLogoSmall,
    imgClass: "h-[80px] w-[80px]",
  },
  {
    path: "",
    label: "",
    description: "Stake $SOL, Receive Airdrops from Early Investments.",
    imgUrl: discover1,
    imgClass: "max-w-[240px] py-10 mb-0",
  },
  {
    path: "",
    label: "",
    description: "Get Early Access to Exclusive Token Sales.",
    imgUrl: discover2,
    imgClass: "max-w-[240px] py-10 mb-0",
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
          "grid w-full max-w-[862px] grid-cols-1 gap-6 md:grid-cols-2 md:flex-row md:items-start md:gap-12",
          transitionBase,
          isActive && transitionActive,
        )}
      >
        {content.map((item, index) => (
          <DiscoverSectionCard key={index} {...item} />
        ))}
      </div>
    </section>
  )
}

export default DiscoverSection
