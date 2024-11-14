import React, { useState } from "react"
import { Button } from "./Button"
import RegisterYourInterestModal from "../Modal/Modals/RegisterYourInterestModal"

const RegisterYourInterest = () => {
  const [displayModal, setDisplayModal] = useState(false)

  return (
    <>
      <Button
        onClick={() => setDisplayModal(true)}
        btnText="Register Your Interest"
        size="lg"
        className="px-4 py-3 text-base font-medium leading-normal"
        textClassName="text-base font-normal"
      />
      {displayModal && <RegisterYourInterestModal onClose={() => setDisplayModal(false)} />}
    </>
  )
}

export default RegisterYourInterest
