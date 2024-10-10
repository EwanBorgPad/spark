import Img from "../Image/Img"

import step1 from "@/assets/angelStaking/step-1.png"
import step2 from "@/assets/angelStaking/step-2.png"
import step3 from "@/assets/angelStaking/step-3.png"
import smallArrow from "@/assets/angelStaking/small-arrow.png"
import largeArrow from "@/assets/angelStaking/large-arrow.png"

const Steps = () => {
  return (
    <div className="flex w-full items-center justify-center gap-1 px-3 py-3 md:gap-3">
      <div className="animate-slide-in-from-left relative max-w-[196px]">
        <span className="absolute top-[8px] w-full text-center text-sm md:top-[19px] md:text-base">
          1. Stake SOL
        </span>
        <Img
          src={step1}
          size="custom"
          customClass="w-full h-auto rounded-none"
        />
      </div>
      <Img
        src={largeArrow}
        size="custom"
        customClass="w-[66px] rounded-none hidden md:flex  animate-[opacity-in_1s_1s_forwards] opacity-0"
      />
      <Img
        src={smallArrow}
        size="custom"
        customClass="w-[17px] rounded-none md:hidden animate-[opacity-in_1s_1s_forwards]"
      />

      <div className="relative max-w-[196px] animate-[slide-in-from-left_1s_1s_forwards] opacity-0">
        <span className="absolute top-[8px] w-full text-center text-sm md:top-[19px] md:text-base">
          2. Invest Yield
        </span>
        <Img
          src={step2}
          size="custom"
          customClass="w-full h-auto rounded-none"
        />
      </div>
      <Img
        src={largeArrow}
        size="custom"
        customClass="w-[66px] rounded-none hidden md:flex animate-[opacity-in_1s_2s_forwards] opacity-0"
      />
      <Img
        src={smallArrow}
        size="custom"
        customClass="w-[17px] rounded-none md:hidden animate-[opacity-in_1s_2s_forwards] opacity-0"
      />
      <div className="relative max-w-[196px] animate-[slide-in-from-left_1s_2s_forwards] opacity-0">
        <span className="absolute top-[8px] w-full text-center text-sm md:top-[19px] md:text-base">
          3. Get Airdrops
        </span>
        <Img
          src={step3}
          size="custom"
          customClass="w-full h-auto rounded-none"
        />
      </div>
    </div>
  )
}

export default Steps
