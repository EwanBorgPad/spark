import React from "react"
import { SimpleModal } from "../SimpleModal"
import Img from "@/components/Image/Img"
import backdrop from "@/assets/angelStaking/RYI-backdrop.png"
import telegram from "@/assets/angelStaking/telegram.png"
import { Icon } from "@/components/Icon/Icon"

type Props = {
  onClose: () => void
}

const RegisterYourInterestModal = ({ onClose }: Props) => {
  return (
    <SimpleModal
      showCloseBtn
      onClose={onClose}
      headerClass="bg-default"
      className="relative flex w-full max-w-[800px] flex-col items-center gap-10 rounded-xl bg-default px-10 py-20"
    >
      <div className="z-[2] flex max-w-[510px] flex-col items-center gap-4">
        <h2 className="text-center text-[32px] font-semibold leading-[40px] text-fg-primary">
          Ready to put on your angel wings?
        </h2>
        <p className="px-10 text-center text-fg-secondary">
          Join our official channels and you&#39;ll be the first to know when it&#39;s time to fly!
        </p>
      </div>
      <div className="z-[2] flex w-full max-w-[370px] flex-col gap-4">
        <a
          href={"https://x.com/BorgPadHQ"}
          target={"_blank"}
          rel="noreferrer"
          className={
            "group flex items-center gap-2 rounded-xl border-[1px] border-bd-primary bg-[#060a1440] px-5 py-6 text-fg-primary backdrop-blur hover:bg-[#20212168] active:scale-[98%]"
          }
        >
          <div className="rounded-full bg-black p-[7px]">
            <Icon icon={"SvgTwitter"} className={"text-xl leading-none"} />
          </div>
          <span className="text-nowrap text-sm">Follow @BorgPadHQ on X</span>
          <Icon
            icon={"SvgArrowRight"}
            className={"text-xl leading-none opacity-50 transition-transform group-hover:translate-x-3"}
          />
        </a>
        <a
          href={"https://t.me/borgpad"}
          target={"_blank"}
          rel="noreferrer"
          className={
            "group flex items-center gap-2 rounded-xl border-[1px] border-bd-primary bg-[#060a1440] px-5 py-6 text-fg-primary backdrop-blur hover:bg-[#20212168] active:scale-[98%]"
          }
        >
          <img src={telegram} className="h-8 w-8" />
          <span className="text-nowrap text-sm">Join Our Telegram Group</span>
          <Icon
            icon={"SvgArrowRight"}
            className={"text-xl leading-none opacity-50 transition-transform group-hover:translate-x-3"}
          />
        </a>
      </div>
      <Img
        src={backdrop}
        showFallback={false}
        size="custom"
        customClass="w-full bottom-0 absolute rounded-none z-[1] opacity-50"
      />
    </SimpleModal>
  )
}

export default RegisterYourInterestModal
