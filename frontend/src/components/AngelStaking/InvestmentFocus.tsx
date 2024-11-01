import { twMerge } from "tailwind-merge"
import React, { useRef } from "react"

import angelStakingTexture2 from "@/assets/angelStaking/angelStakingTexture2.png"
import angelStakingTexture2Mob from "@/assets/angelStaking/angelStakingTexture2-mob.png"

import InvestmentFocusCard from "../Cards/InvestmentFocusCard"
import useScrollAnimation from "@/hooks/useScrollAnimation"
import { investmentFocusItems } from "@/data/angelStaking"
import { useWindowSize } from "@/hooks/useWindowSize"
import { groupIntoPairs } from "@/utils/format"
import { Button } from "../Button/Button"

const InvestmentFocus = () => {
  const ref = useRef<HTMLDivElement>(null)
  const { isMobile } = useWindowSize()

  const { isActive } = useScrollAnimation({
    ref: ref,
    threshold: isMobile ? 0.45 : 0.75,
  })

  const cardSets = groupIntoPairs(investmentFocusItems)

  return (
    <section
      ref={ref}
      className="flex w-full flex-col items-center px-4 pb-16 pt-20 md:px-16 md:pb-20"
    >
      <div
        className={twMerge(
          "transition-translate-n-opacity flex min-h-[320px] w-full max-w-[1312px] translate-y-9 scale-90 flex-col rounded-xl border-[1px] border-bd-primary bg-default opacity-0 duration-[650ms] ease-out md:flex-row-reverse md:items-center",
          isActive && "translate-y-0 scale-100 opacity-100",
        )}
      >
        <div className="z-[2] flex w-full flex-col gap-7 p-4 pt-6">
          <h2 className="text-2xl font-semibold leading-normal md:text-4xl">
            Together, we invest in the most promising Web3 startups - building
            the future we want to live in.
          </h2>
          <div className="flex w-full">
            <Button
              btnText="Read Our Manifesto"
              color="secondary"
              size="lg"
              className="px-4 py-3 text-base font-medium"
            />
          </div>
        </div>
        <div className="relative flex w-full flex-col items-center gap-6 px-16 pt-4">
          <div className="absolute bottom-0 z-[1] h-full overflow-hidden">
            <img
              src={angelStakingTexture2Mob}
              alt="abstract green stripes backdrop image"
              className="mb-[-2px] h-auto w-[110%] md:hidden"
            />
            <img
              src={angelStakingTexture2}
              alt="abstract green stripes backdrop image"
              className="hidden h-auto w-full md:flex"
            />
          </div>

          <h3 className="z-[2] text-base font-semibold leading-normal">
            Investment Focus
          </h3>
          <div className="z-[2] flex w-fit max-w-[420px] flex-wrap items-center justify-center gap-3 pb-[41px] md:max-w-[436px]">
            {cardSets.map((group, index) => (
              <div key={index} className="flex gap-3">
                {group.map((item) => (
                  <InvestmentFocusCard card={item} key={item.icon} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default InvestmentFocus
