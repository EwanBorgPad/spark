import { useState } from "react"
import { twMerge } from "tailwind-merge"

import { Icon } from "../Icon/Icon"
import { Button } from "../Button/Button"
import ReferralModal from "../Modal/Modals/ReferralModal"

type Props = {
  className?: string
}

const Referral = ({ className }: Props) => {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <div 
        className={twMerge("group cursor-pointer", className)} 
        onClick={() => setShowModal(true)}
      >
        <Button
          btnText="Refer & Earn"
          color="secondary"
          className="text-sm text-fg-brand-primary"
          prefixElement={<Icon icon="SvgTicket" className="text-xl text-fg-secondary" />}
        />
      </div>

      {showModal && <ReferralModal onClose={() => setShowModal(false)} />}
    </>
  )
}

export default Referral
