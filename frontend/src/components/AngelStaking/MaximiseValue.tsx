import React, { useRef } from "react"
import maximise1 from "@/assets/angelStaking/maximise1.png"
import maximise2 from "@/assets/angelStaking/maximise2.png"
import maximise3 from "@/assets/angelStaking/maximise3.png"
import Img from "../Image/Img"
import useScrollAnimation from "@/hooks/useScrollAnimation"
import { useWindowSize } from "@/hooks/useWindowSize"
import { twMerge } from "tailwind-merge"

type Item = {
  title: string
  description: string
  imgUrl: string
}

const content: Item[] = [
  {
    title: "Invest Without Selling",
    description:
      "Become the most capital-efficient angel investor in Web3. Automatically supercharge your 5-8% staking APY into early investments in top Solana projects—all while your SOL stays securely staked.",
    imgUrl: maximise1,
  },
  {
    title: "Make a Difference",
    description:
      "Invest in innovations that matters. Every deal is vetted by the BorgPad team that aligns with our core mission & vision of the world. We stand alongside you with no hidden agendas. Transparent and on-chain.",
    imgUrl: maximise2,
  },
  {
    title: "Redeem Anytime",
    description:
      "Maintain complete control and flexibility over your assets. No lockup periods, no vesting. You can redeem your staked SOL at any block epoch. Simply swap your BorgSOL back for your SOL.",
    imgUrl: maximise3,
  },
]

const MaximiseValue = () => {
  const ref = useRef<HTMLDivElement>(null)
  const { isMobile } = useWindowSize()

  const { isActive } = useScrollAnimation({
    ref: ref,
    threshold: isMobile ? 0.45 : 0.25,
  })

  return (
    <section
      ref={ref}
      className={twMerge(
        "transition-translate-n-opacity flex w-full scale-90 flex-col items-center gap-12 px-5 py-16 opacity-0 duration-[650ms] ease-out md:gap-20 md:px-16 md:py-28",
        isActive && "translate-y-0 scale-100 opacity-100",
      )}
    >
      <h2 className="text-center text-4xl font-semibold leading-normal md:text-5xl">
        Maximise the value of your SOL
      </h2>
      <div
        className={
          "flex w-full flex-col items-center justify-center gap-12 md:flex-row"
        }
      >
        {content.map((item, index) => (
          <div key={index} className="flex max-w-[405px] flex-col gap-6">
            <Img src={item.imgUrl} />
            <div className="flex w-full flex-col gap-3">
              <h3 className="text-2xl font-semibold text-fg-primary">
                {item.title}
              </h3>
              <p className="text-fg-secondary">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default MaximiseValue
