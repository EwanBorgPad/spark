import { useRef } from "react"

import StakingCard from "../Cards/StakingCard"
import { useWindowSize } from "@/hooks/useWindowSize"
import { angelStakingCards } from "@/data/angelStaking"
import { useVerticalTimelineScroll } from "@/hooks/useVerticalTimelineScroll"

const VerticalTimeline = () => {
  const beamRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const { isMobile } = useWindowSize()

  const { activeIndex } = useVerticalTimelineScroll({
    numOfCardItems: angelStakingCards.length,
    checkpointOffsetRatio: 0.11, // 11%
    gapSize: 24,
    trackRef,
    beamRef,
  })

  return (
    <div className="flex items-start gap-4">
      {/* Scroll beam component */}
      {!isMobile && (
        <div className="relative h-full">
          <div className="h-full px-[62px] pb-6 pt-4 md:pt-0">
            <div className="relative flex h-full w-[3px]">
              <div id="beam-track" ref={trackRef} className="absolute z-[1] flex h-full w-[3px] bg-tertiary"></div>
              <div
                id="beam"
                ref={beamRef}
                className="transition-height absolute z-[2] mx-[1px] min-h-0 w-[1px] bg-brand-primary shadow shadow-brand-primary duration-500 ease-out"
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Cards */}
      <div className="z-[3] flex flex-col items-center gap-6 px-4 pb-0 pt-4 md:px-0 md:pt-0">
        {angelStakingCards.map((card, index) => (
          <StakingCard key={index} index={index} card={card} activeIndex={activeIndex} />
        ))}
      </div>
    </div>
  )
}

export default VerticalTimeline
