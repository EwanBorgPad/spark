import { twMerge } from "tailwind-merge"
import { Button } from "../../Button/Button"
import { SimpleModal } from "../SimpleModal"
import { useState } from "react"
import ReferralDashboardModal from "./ReferralDashboardModal"

type Props = {
  onClose: () => void
}

const ReferralHowItWorksModal = ({ onClose }: Props) => {
  const [showDashboard, setShowDashboard] = useState(false)

  if (showDashboard) {
    return <ReferralDashboardModal onClose={onClose} />
  }

  // Function to create a numbered row
  const NumberedRow = ({ number, text }: { number: number; text: string | React.ReactNode }) => (
    <div className="flex gap-4">
      <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-fg-secondary">
        {number}
      </div>
      <div className="text-fg-primary">
        {text}
      </div>
    </div>
  )

  return (
    <SimpleModal
      showCloseBtn
      onClose={onClose}
      className="relative w-full max-w-[1000px] overflow-y-hidden bg-default"
      headerClass="bg-default"

    >
      <div className="flex max-h-[90vh] w-full flex-col items-center overflow-y-auto px-4 pb-[40px] md:max-h-[90vh] md:overflow-y-hidden md:px-[40px] md:pb-6">
        <span className="mb-3 text-center text-2xl font-semibold text-white">
          Refer & Earn
        </span>
        <span className="mb-[36px] text-center text-base font-normal text-fg-secondary">
          How does it works ?
        </span>
        <div className="mb-[36px] flex flex-col gap-4">
          <NumberedRow
            number={1}
            text={
              <>
                Ask friends to use your referral code
              </>
            }
          />

          <NumberedRow
            number={2}
            text={
              <>
                You get guaranteed allocation <span className="text-brand-primary">for each $1</span> they invest
              </>
            }
          />

          <NumberedRow
            number={3}
            text={
              <>
                Additionally, you get <span className="text-brand-primary">1 ticket per 1$</span> they invest.
              </>
            }
          />

          <NumberedRow
            number={4}
            text={
              <>
                When the sale ends, <span className="text-brand-primary">you can win one of the prizes</span> in the raffle or based on the place on the leaderboard.
                <span className="text-brand-primary"> More tickets</span>  = the bigger the chance to win
              </>
            }
          />
        </div>

        <span className="mb-3 text-center text-2xl font-semibold text-white">
          Prize Pool
        </span>
        <span className="mb-[36px] text-center text-base font-normal text-fg-secondary">
          Total: 10,000,000 $SOLID
        </span>

        <div className="mt-8 flex justify-center">
          <Button
            btnText="Continue"
            color="primary"
            className="px-8"
            onClick={() => setShowDashboard(true)}
          />
        </div>
      </div>
    </SimpleModal>
  )
}

export default ReferralHowItWorksModal 