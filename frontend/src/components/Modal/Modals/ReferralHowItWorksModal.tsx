import { twMerge } from "tailwind-merge"
import { Button } from "../../Button/Button"
import { SimpleModal } from "../SimpleModal"
import { useState } from "react"
import ReferralDashboardModal from "./ReferralDashboardModal"
import { Icon } from "../../Icon/Icon"

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

  // Function to create a prize card
  const PrizeCard = ({ 
    icon, 
    colorIcon,
    title, 
    subtitle, 
    amount,
    type
  }: { 
    icon: "SvgTrophy" | "SvgMedal" | "SvgCircledCheckmark"; 
    colorIcon: string;
    title: string | React.ReactNode; 
    subtitle: string; 
    amount: string;
    type: "grand" | "gold" | "silver" | "bronze";
  }) => {
    return (
      <div 
        className={`flex h-[88px] md:h-[68px] w-full max-w-[343px] md:max-w-[430px] lg:min-w-[430px] items-center justify-between rounded-lg p-3 prize-card-gradient prize-card-${type} ${type === 'grand' ? 'bg-grand-prize' : ''}`}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/20">
            <Icon icon={icon} className={`text-xl`} style={{ color: colorIcon }} />
          </div>
          <div className="flex flex-col max-w-[163px] md:max-w-[1000px]">
            <p className="font-medium text-white">{title}</p>
            <p className="text-sm text-fg-primary/70">{subtitle}</p>
          </div>
        </div>
        <p className={`font-medium`} style={{ color: colorIcon }}>{amount}</p>
      </div>
    );
  }

  return (
    <SimpleModal
      showCloseBtn
      onClose={onClose}
      className="relative w-full max-w-[1000px] overflow-y-hidden bg-default"
      headerClass="bg-default"
    >
      <div className="flex max-h-[90vh] w-full flex-col items-center overflow-y-auto px-4 pb-[40px] md:flex-row md:items-start md:justify-between md:gap-8 md:px-[40px] md:pb-[100px]">
        {/* Left Column - Refer & Earn */}
        <div className="flex w-full flex-col items-center md:max-w-[450px]">
          <span className="mb-3 text-center text-2xl font-semibold text-white">
            Refer & Earn
          </span>
          <span className="mb-[24px] text-center text-base font-normal text-fg-secondary">
            How does it works ?
          </span>
          <div className="mb-[24px] flex w-full flex-col gap-4">
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
        </div>

        {/* Right Column - Prize Pool */}
        <div className="flex w-full flex-col items-center md:max-w-[450px]">
          <span className="mb-3 text-center text-2xl font-semibold text-white">
            Prize Pool
          </span>
          <span className="mb-[24px] text-center text-base font-normal text-fg-secondary">
            Total: 10,000,000 $SOLID
          </span>

          <div className="flex flex-col gap-3">
            <PrizeCard 
              icon="SvgTrophy"
              colorIcon="#ACFF73"
              title={
                <>
                  <span className="text-fg-secondary">2x </span> Grand Prize
                </>
              }
              subtitle="Raffle & 1st ranking place"
              amount="2,500,000"
              type="grand"
            />
            
            <PrizeCard 
              icon="SvgTrophy"
              colorIcon="#F2BF7E"
              title={
                <>
                  <span className="text-fg-secondary">4x </span> Gold Prize
                </>
              }
              subtitle="Raffle & 2nd-3rd ranking places"
              amount="500,000"
              type="gold"
            />
            
            <PrizeCard 
              icon="SvgTrophy"
              colorIcon="#E1E7EF"
              title={
                <>
                  <span className="text-fg-secondary">6x </span> Silver Prize
                </>
              }
              subtitle="Raffle & 4th-6th ranking places"
              amount="400,000"
              type="silver"
            />
            
            <PrizeCard 
              icon="SvgTrophy"
              colorIcon="#D38160"
              title={
                <>
                  <span className="text-fg-secondary">8x </span> Bronze Prize
                </>
              }
              subtitle="Raffle & 7th-10th ranking places"
              amount="100,000"
              type="bronze"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-center md:fixed md:bottom-8 md:left-1/2 md:-translate-x-1/2 md:w-full">
          <Button
            btnText="Continue"
            color="primary"
            className="max-w-[343px] w-[316px] h-[44px] md:w-[400px] md:h-[44px]"
            onClick={() => setShowDashboard(true)}
          />
        </div>
      </div>
    </SimpleModal>
  )
}

export default ReferralHowItWorksModal 