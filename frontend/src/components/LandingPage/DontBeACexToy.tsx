import React, { useRef } from "react"
import { Button } from "../Button/Button"
import useScrollAnimation from "@/hooks/useScrollAnimation"
import { twMerge } from "tailwind-merge"
import { useWindowSize } from "@/hooks/useWindowSize"

const DontBeACexToy = () => {
  const headingRef = useRef<HTMLHeadingElement | null>(null)
  const div1Ref = useRef<HTMLDivElement | null>(null)
  const div2Ref = useRef<HTMLDivElement | null>(null)
  const { isMobile } = useWindowSize()

  const { isActive: isHeadingDisplayed } = useScrollAnimation({
    ref: headingRef,
    threshold: isMobile ? 0.25 : 0.75,
  })
  const { isActive: isDiv1Displayed } = useScrollAnimation({
    ref: div1Ref,
    threshold: isMobile ? 0.25 : 0.45,
  })
  const { isActive: isDiv2Displayed } = useScrollAnimation({
    ref: div2Ref,
    threshold: isMobile ? 0.25 : 0.45,
  })

  const transitionBase =
    "transition-translate-n-opacity translate-y-9 scale-90 opacity-0 duration-[650ms]"
  const transitionActive = "translate-y-0 scale-100 opacity-100"

  return (
    <section className="relative z-[1] flex w-full flex-col items-center overflow-hidden px-5 pb-16 pt-0 md:px-16">
      <h2
        ref={headingRef}
        className={twMerge(
          "max-w-[700px] pb-10 text-left text-4xl font-semibold leading-[44px] md:text-center md:text-5xl ",
          transitionBase,
          isHeadingDisplayed && transitionActive,
        )}
      >
        Don&#39;t be a CEX-Toy
      </h2>
      <div className="flex w-full flex-col items-center">
        {/* card 1 */}
        <div
          ref={div1Ref}
          className={twMerge(
            "flex w-full max-w-[800px] flex-col items-start border-t border-bd-primary pb-10 pt-7 md:flex-row md:gap-20 md:py-[60px]",
            transitionBase,
            isDiv1Displayed && transitionActive,
          )}
        >
          <h3 className="text-nowrap pb-6 text-[32px] font-medium leading-10 md:min-w-[240px] md:text-4xl md:leading-[44px]">
            For Investors
          </h3>
          <div className="flex w-full flex-col md:pt-2">
            <h4 className="pb-2 text-xl font-medium leading-7 md:text-2xl md:leading-snug">
              Invest into Real Potential
            </h4>
            <p className="flex w-full flex-col gap-2 pb-10 opacity-60">
              <span>Truly Fair Valuations</span>
              <span>Minimised Vesting Terms</span>
              <span>Guaranteed Timeline for TGE</span>
            </p>
            <h4 className="pb-2 text-xl font-medium leading-7 md:text-2xl md:leading-snug">
              And have Nothing Hidden from You
            </h4>
            <p className="flex w-full flex-col gap-2 opacity-60">
              <span>
                Full visibility on all terms, from initial angel rounds to the
                final OTC deal.
              </span>
            </p>
          </div>
        </div>

        {/* card 2 */}
        <div
          ref={div2Ref}
          className={twMerge(
            "flex w-full max-w-[800px] flex-col items-start border-t border-bd-primary pb-10 pt-7 md:flex-row md:gap-20 md:py-[60px]",
            transitionBase,
            isDiv2Displayed && transitionActive,
          )}
        >
          <h3 className="text-nowrap pb-6 text-[32px] font-medium leading-10 md:min-w-[240px] md:text-4xl md:leading-[44px]">
            For Projects
          </h3>
          <div className="flex w-full flex-col md:pt-2">
            <h4 className="pb-2 text-xl font-medium leading-7 md:text-2xl md:leading-snug">
              Work for your community, not the CEX-Cartel.
            </h4>
            <p className="flex w-full flex-col gap-2 opacity-60">
              <span>Community-Driven Fundraising</span>
              <span>Listing Execution on DEXs + SwissBorg</span>
              <span>No Fees BS. Keep your treasury.</span>
              <span>
                TGE-Success Campaign (manage your sellers & generate demand)
              </span>
            </p>
          </div>
        </div>
      </div>
      <div className="flex w-full flex-col gap-4 pt-3 md:mt-10 md:max-w-[320px] md:pt-4">
        <Button
          btnText="Read our GitBook"
          size="xl"
          className="mt-[2px] w-full px-7 py-4 text-lg font-medium leading-normal md:w-auto"
          textClassName="text-base font-medium"
        />
        <Button
          btnText="Committed Founder? Apply Here"
          size="xl"
          color="tertiary"
          className="mt-[2px] w-full px-7 py-4 text-lg font-medium leading-normal md:w-auto"
          textClassName="text-base font-medium px-0"
        />
      </div>
    </section>
  )
}

export default DontBeACexToy
