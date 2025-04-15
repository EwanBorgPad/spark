import { useState } from "react"
import { twMerge } from "tailwind-merge"
import { Button } from "../../Button/Button"
import { Icon } from "../../Icon/Icon"
import { SimpleModal } from "../SimpleModal"
import { TextField } from "../../InputField/TextField"
import ReferralHowItWorksModal from "./ReferralHowItWorksModal"

type Props = {
  onClose: () => void
}

const ReferralModal = ({ onClose }: Props) => {
  const [referralCode, setReferralCode] = useState("")
  const [showHowItWorks, setShowHowItWorks] = useState(false)

  const handleSubmit = () => {
    // Handle the referral code submission
    console.log("Referral code submitted:", referralCode)
    setShowHowItWorks(true)
  }

  const handleNoCode = () => {
    // Handle the case when user doesn't have a code
    console.log("User doesn't have a referral code")
    setShowHowItWorks(true)
  }

  if (showHowItWorks) {
    return <ReferralHowItWorksModal onClose={onClose} />
  }

  return (
    <SimpleModal
      title="Refer & Earn"
      onClose={onClose}
      className="max-w-md"
      showCloseBtn={true}
    >
      <div className="flex flex-col gap-6 p-4">
        <p className="text-center text-fg-primary">
          Enter your referral code to earn rewards
        </p>
        
        <TextField
          value={referralCode}
          onChange={(e) => setReferralCode(e.target.value)}
          placeholder="Enter referral code"
          containerClassName="w-full"
        />
        
        <div className="flex flex-col gap-3">
          <Button
            btnText="Enter"
            color="primary"
            className="w-full"
            onClick={handleSubmit}
          />
          
          <Button
            btnText="I don't have a referral code"
            color="secondary"
            className="w-full"
            onClick={handleNoCode}
          />
        </div>
      </div>
    </SimpleModal>
  )
}

export default ReferralModal 