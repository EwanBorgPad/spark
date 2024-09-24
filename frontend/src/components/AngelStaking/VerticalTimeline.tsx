import { useRef } from "react"
import { twMerge } from "tailwind-merge"

import useVerticalTimeline from "@/hooks/useVerticalTimeline"
import { angelStakingCards } from "@/data/angelStaking"
import { useWindowSize } from "@/hooks/useWindowSize"
import StakingCard from "../Cards/StakingCard"

const VerticalTimeline = () => {
  const ref = useRef<HTMLDivElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const { isMobile, width } = useWindowSize()

  const { activeIndex } = useVerticalTimeline({
    ref: ref,
    arrayLength: angelStakingCards.length,
    stickyRef,
    width,
  })

  return (
    <div ref={ref} className="flex items-start gap-4">
      {/* Scroll beam */}
      {/* test comment */}
      {!isMobile && (
        <div className="relative h-full">
          <div className="absolute h-full px-[62px] pb-6 pt-4 md:pt-0">
            <div className="flex h-full w-[3px]">
              <div className="mx-[1px] h-full w-[1px] bg-brand-primary shadow shadow-brand-primary"></div>
            </div>
          </div>
          <div
            ref={stickyRef}
            className={twMerge(
              "sticky top-[400px] min-h-[400px] bg-accent px-[62px] pt-4 md:pt-0",
            )}
          >
            <div className="h-full w-[3px] bg-tertiary"></div>
          </div>
          <div
            style={{
              height: stickyRef.current
                ? stickyRef.current.clientHeight - 24
                : 400,
            }}
            className="absolute bottom-0 w-full bg-accent"
          ></div>
        </div>
      )}

      <div className="z-[3] flex flex-col items-center gap-6 px-4 pb-6 pt-4 md:px-0 md:pt-0">
        {angelStakingCards.map((card, index) => (
          <StakingCard
            key={index}
            index={index}
            card={card}
            activeIndex={activeIndex}
          />
        ))}
      </div>
    </div>
  )
}

export default VerticalTimeline
