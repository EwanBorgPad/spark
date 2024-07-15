import React, { useState } from "react"

import { Button } from "../Button/Button"
import { ExternalLink } from "../Button/ExternalLink"
import NotResidingInUsModal from "../Modal/Modals/NotResidingInUs"
import { useTranslation } from "react-i18next"

const CtaButtonRoot = () => {
  return null
}

const NotResidingInUsBtn = () => {
  const [showModal, setShowModal] = useState(false)
  const { t } = useTranslation()

  return (
    <div className="mt-2 flex justify-start">
      <Button
        color="secondary"
        size="xs"
        className="rounded-lg px-3"
        onClick={() => setShowModal(!showModal)}
      >
        {t("whitelisting.i_dont_reside_in_us")}
      </Button>
      {showModal && (
        <NotResidingInUsModal onClose={() => setShowModal(false)} />
      )}
    </div>
  )
}

const HoldBorgInAmountBtn = () => {
  const { t } = useTranslation()

  return (
    <div className="mt-2 flex justify-start">
      <Button
        color="secondary"
        size="xs"
        className="rounded-lg px-3"
        onClick={() => console.log("HoldBorgInAmount")}
      >
        {t("buy")} BORG
      </Button>
    </div>
  )
}

const FollowOnXBtn = () => {
  return (
    <div className="mt-2 flex justify-start">
      <ExternalLink
        externalLink={{ label: "Follow Us", url: "#", iconType: "X_TWITTER" }}
        className="gap-1 rounded-lg"
        iconClassName="opacity-50"
      />
    </div>
  )
}

export const CtaButton = Object.assign(CtaButtonRoot, {
  NotResidingInUS: NotResidingInUsBtn,
  HoldBorgInAmount: HoldBorgInAmountBtn,
  FollowOnX: FollowOnXBtn,
})
