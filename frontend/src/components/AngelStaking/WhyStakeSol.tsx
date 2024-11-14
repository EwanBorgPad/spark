import Divider from "../Divider"

import reason1 from "@/assets/angelStaking/whyStakeSol-1.png"
import reason2 from "@/assets/angelStaking/whyStakeSol-2.png"
import reason3 from "@/assets/angelStaking/whyStakeSol-3.png"
import Img from "../Image/Img"
import { twMerge } from "tailwind-merge"
import { useWindowSize } from "@/hooks/useWindowSize"
import { useRef } from "react"
import useScrollAnimation from "@/hooks/useScrollAnimation"
import { useNavigate } from "react-router-dom"
import { Button } from "../Button/Button"

type ReasonType = {
  title: string
  text: string[]
  imgUrl: string
  link?: {
    label: string
    url: string
  }
}

const reasons: ReasonType[] = [
  {
    title: "Low Risk, High Return",
    text: [
      "With Angel Staking, <mark>you never have to sell your own tokens</mark> to invest.",
      "Instead, only the staking rewards generated from your SOL are used to fund early deals on BorgPad. This means you invest in potentially high-reward investments with much less risk.",
    ],
    imgUrl: reason1,
  },
  {
    title: "Take Back Web3 \nfrom the CEX Cartel.",
    text: [
      "BorgPad brings the value of early investing back to you—the community. <mark>We empower founders</mark> to launch projects without needing centralised exchanges or VC funding - restoring the core values of Web3: by the people, for the people.",
      "Permissionless, open, and fair.",
    ],
    imgUrl: reason2,
  },
  {
    title: "Invest in a Future \nYou Believe In",
    text: [
      "Where we invest shapes the world we create.",
      "At BorgPad, we back only the projects and founders that align with our <mark>human-centric vision for AI</mark> and uphold true Web3 values, driving adoption beyond mere speculation. Read our manifesto.",
    ],
    imgUrl: reason3,
    // link: {
    //   label: "Read Our Manifesto",
    //   url: "/manifesto",
    // },
  },
]

type ReasonProps = {
  isMobile: boolean
  index: number
  reason: ReasonType
  navigate: (url: string) => void
}

const Reason = ({ reason, isMobile, index, navigate }: ReasonProps) => {
  const ref = useRef<HTMLDivElement>(null)

  const { isActive } = useScrollAnimation({
    ref: ref,
    threshold: isMobile ? 0.45 : 0.75,
  })

  const isEven = (index: number) => {
    return index % 2 === 0
  }

  return (
    <div
      ref={ref}
      className={twMerge(
        "flex flex-col items-center gap-4 px-4 py-16 opacity-0 transition-opacity duration-700 md:gap-0 md:px-16 md:py-20",
        isEven(index) ? "md:flex-row-reverse" : "md:flex-row",
        isActive && "opacity-100",
      )}
    >
      <div
        className={twMerge(
          "flex flex-col gap-4 transition-transform duration-700 md:gap-6 md:px-12",
          isEven(index) ? "translate-x-6" : "-translate-x-6",
          isActive && "translate-x-0",
        )}
      >
        <h3 className="whitespace-pre text-2xl font-semibold leading-tight md:text-[40px]">
          {reason.title}
        </h3>
        <p className="flex flex-col gap-3 text-base text-fg-secondary md:max-w-[484px]">
          {reason.text.map((span, index) => (
            <span
              key={"span-" + index}
              dangerouslySetInnerHTML={{ __html: span }}
            ></span>
          ))}
        </p>
        {reason.link && (
          <Button
            color="secondary"
            size="lg"
            className="w-fit"
            btnText={reason.link.label}
            onClick={() => navigate(reason.link!.url)}
          />
        )}
      </div>
      <Img
        src={reason.imgUrl}
        size="custom"
        customClass={twMerge(
          "transition-transform max-w-[441px] scale-95 duration-700",
          isActive && "scale-100",
        )}
      />
    </div>
  )
}

const WhyStakeSol = () => {
  const { isMobile } = useWindowSize()
  const navigate = useNavigate()

  return (
    <section className="gap flex w-full flex-col items-center">
      <div className="flex w-full flex-col items-center gap-5 px-5 py-16 md:px-4 md:pb-10 md:pt-28">
        <Divider icon="SvgMedal" />
        <h2 className="text-center text-4xl font-semibold leading-[120%] md:text-[56px]">
          Why Angel Stake your $SOL?
        </h2>
      </div>
      {reasons.map((reason, index) => (
        <Reason
          key={index}
          index={index}
          reason={reason}
          isMobile={isMobile}
          navigate={navigate}
        />
      ))}
    </section>
  )
}

export default WhyStakeSol
