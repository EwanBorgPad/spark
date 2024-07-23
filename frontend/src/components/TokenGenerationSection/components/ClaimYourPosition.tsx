import { Button } from "@/components/Button/Button"
import ClaimYourPositionModal from "@/components/Modal/Modals/ClaimYourPositionModal"
import { ContributionAndRewardsType } from "@/data/contributionAndRewardsData"
import { useState } from "react"

type ClaimYourPositionProps = {
  alreadyClaimedPercent: number
  mainPosition: ContributionAndRewardsType["claimPositions"]["mainPosition"]
}

const ClaimYourPosition = ({
  alreadyClaimedPercent,
  mainPosition,
}: ClaimYourPositionProps) => {
  const [showModal, setShowModal] = useState(false)

  const isEntirePositionClaimed = alreadyClaimedPercent >= 100

  return (
    <div className="mt-3 flex w-full flex-col items-center gap-2">
      <Button
        onClick={() => setShowModal(true)}
        size="lg"
        className="w-full py-3 font-normal"
        disabled={isEntirePositionClaimed}
        btnText={
          isEntirePositionClaimed
            ? "Entire Position Claimed"
            : "Claim Your Position"
        }
      />
      <p className="flex items-center gap-2 text-sm">
        <span className="text-fg-secondary">Already claimed:</span>
        <span className="leading-tight text-fg-tertiary">
          {alreadyClaimedPercent}%
        </span>
      </p>
      {showModal && (
        <ClaimYourPositionModal
          mainPosition={mainPosition}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}

export default ClaimYourPosition
