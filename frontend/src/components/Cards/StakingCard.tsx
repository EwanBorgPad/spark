import { useLayoutEffect, useRef } from "react"

import RiveStakingCard from "../RiveAnimations/RiveStakingCard"
import useScrollAnimation from "@/hooks/useScrollAnimation"
import { StakingCardType } from "@/data/angelStaking"
import { twMerge } from "tailwind-merge"
import { useWindowSize } from "@/hooks/useWindowSize"

type Props = {
  index: number
  card: StakingCardType
}

const StakingCard = ({
  index,
  card: { title, description, filename, inputName },
}: Props) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const riveContainerRef = useRef<HTMLDivElement>(null)
  const { isMobile } = useWindowSize()

  const { isActive } = useScrollAnimation({
    ref: riveContainerRef,
    threshold: 0.989,
  })

  const setAspectRatio = () => {
    if (!riveContainerRef?.current) return
    const desiredAspectRatio = 1.0408
    const height =
      desiredAspectRatio * riveContainerRef.current?.clientWidth + "px"
    riveContainerRef.current.style.height = height
  }

  useLayoutEffect(() => {
    setAspectRatio()
  }, [riveContainerRef.current?.clientWidth])

  return (
    <div
      ref={cardRef}
      className="relative z-[3] inline-flex w-full max-w-[576px] flex-col items-start justify-start gap-3 rounded-xl border border-bd-primary bg-overlay"
    >
      <div className="inline-flex flex-col items-start justify-start px-4 py-8">
        <h3 className="text-2xl font-semibold leading-loose ">
          {`${index + 1}. ${title}`}
        </h3>
        <p className="text-base font-normal leading-normal text-fg-secondary">
          {description}
        </p>
      </div>
      <div
        className="w-full overflow-hidden rounded-b-[11px]"
        ref={riveContainerRef}
      >
        <RiveStakingCard
          filename={filename}
          isActive={isActive}
          inputName={inputName}
        />
      </div>
      {!isMobile && (
        <div className="absolute -left-[96px] top-12 rounded-full bg-accent p-2">
          <div
            className={twMerge(
              " h-[15px] w-[15px] rounded-full bg-tertiary transition-colors",
              isActive && "shadow-around bg-brand-primary",
            )}
          ></div>
        </div>
      )}
    </div>
  )
}

export default StakingCard
