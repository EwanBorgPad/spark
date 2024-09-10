import { StakingCardType } from "@/data/angelStaking"
import React, { useEffect, useRef, useState } from "react"
import RiveStakingCard from "../RiveAnimations/RiveStakingCard"
import { Button } from "../Button/Button"

type Props = {
  index: number
  card: StakingCardType
}

const StakingCard = ({
  index,
  card: { title, description, filename, inputName },
}: Props) => {
  const [isActive, setIsActive] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const riveContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cardEl = cardRef.current as Element
    const observer = new IntersectionObserver(
      ([entry]) => {
        const isScrolledPastElement = entry.boundingClientRect.top < 0
        if (entry.intersectionRatio > 0.8) {
          setIsActive(true)
        }
        if (entry.intersectionRatio < 0.8 && !isScrolledPastElement) {
          setIsActive(false)
        }
      },
      { threshold: [0.79, 0.81] },
    )
    observer.observe(cardEl)

    return () => {
      observer.unobserve(cardEl)
    }
  }, [cardRef])

  useEffect(() => {
    if (!riveContainerRef?.current) return
    const desiredAspectRatio = 1.0408
    const height =
      desiredAspectRatio * riveContainerRef.current?.clientWidth + "px"
    riveContainerRef.current.style.height = height
  }, [riveContainerRef.current?.clientWidth])

  return (
    <div
      ref={cardRef}
      className="inline-flex w-full max-w-[576px] flex-col items-start justify-start gap-3 overflow-hidden rounded-xl border border-bd-primary bg-overlay"
    >
      <div className="inline-flex flex-col items-start justify-start px-4 py-8">
        <h3 className="text-2xl font-semibold leading-loose ">
          {`${index + 1}. ${title}`}
        </h3>
        <p className="text-base font-normal leading-normal text-fg-secondary">
          {description}
        </p>
      </div>
      <div className="w-full" ref={riveContainerRef}>
        <RiveStakingCard
          filename={filename}
          isActive={isActive}
          inputName={inputName}
        />
      </div>
    </div>
  )
}

export default StakingCard
