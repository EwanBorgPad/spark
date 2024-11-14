import React, { useState } from "react"
import { Button } from "./Button"
import JoinCommunityModal from "../Modal/Modals/JoinCommunityModal"
import { twMerge } from "tailwind-merge"

const JoinCommunityBtn = ({ className }: { className?: string }) => {
  const [displayModal, setDisplayModal] = useState(false)

  return (
    <>
      <Button
        onClick={() => setDisplayModal(true)}
        btnText="Join the Community"
        size="xl"
        className={twMerge(
          "mt-[2px] w-full px-7 py-4 text-lg font-medium leading-normal md:mt-[24px] md:w-auto",
          className,
        )}
        textClassName="text-base font-medium"
      />
      {displayModal && (
        <JoinCommunityModal onClose={() => setDisplayModal(false)} />
      )}
    </>
  )
}

export default JoinCommunityBtn
