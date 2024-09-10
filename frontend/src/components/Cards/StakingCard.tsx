import { StakingCardType } from "@/data/angelStaking"
import React from "react"

type Props = {
  index: number
  card: StakingCardType
}

const StakingCard = ({
  index,
  card: { title, description, filename },
}: Props) => {
  return (
    <div className="inline-flex flex-col items-start justify-start gap-3 bg-default px-4 py-8">
      <h3 className="text-2xl font-semibold leading-loose ">
        {`${index + 1}. ${title}`}
      </h3>
      <p className="text-base font-normal leading-normal text-fg-secondary">
        {description}
      </p>
      <div className="h-[357px] w-[343px]"></div>
    </div>
  )
}

export default StakingCard
