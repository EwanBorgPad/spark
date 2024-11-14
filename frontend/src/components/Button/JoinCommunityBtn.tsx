import React, { useState } from "react"
import { Button } from "./Button"
import JoinCommunityModal from "../Modal/Modals/JoinCommunityModal"
import { twMerge } from "tailwind-merge"

type Props = {
  className?: string
  textClass?: string
  label?: string
}
const JoinCommunityBtn = ({ className, textClass, label }: Props) => {
  const [displayModal, setDisplayModal] = useState(false)

  return (
    <>
      <Button
        onClick={() => setDisplayModal(true)}
        btnText={label || "Join the Community"}
        size="xl"
        className={twMerge(
          "mt-[2px] w-full px-7 py-4 text-lg font-medium leading-normal md:mt-[24px] md:w-auto",
          className,
        )}
        textClassName={twMerge("text-base font-medium", textClass)}
      />
      {displayModal && <JoinCommunityModal onClose={() => setDisplayModal(false)} />}
    </>
  )
}

export default JoinCommunityBtn
