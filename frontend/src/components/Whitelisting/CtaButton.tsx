import React from "react"

import { Button } from "../Button/Button"
import { ExternalLink } from "../Button/ExternalLink"

const CtaButtonRoot = () => {
  return null
}

const NotResidingInUsBtn = () => {
  return (
    <div className="mt-2 flex justify-start">
      <Button
        color="secondary"
        size="xs"
        className="rounded-lg px-3"
        onClick={() => console.log("NotResidingInUsBtn")}
      >
        I Don’t Reside in the US
      </Button>
    </div>
  )
}
const HoldBorgInAmountBtn = () => {
  return (
    <div className="mt-2 flex justify-start">
      <Button
        color="secondary"
        size="xs"
        className="rounded-lg px-3"
        onClick={() => console.log("HoldBorgInAmount")}
      >
        Buy BORG
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
