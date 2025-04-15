import { useState } from "react"
import { twMerge } from "tailwind-merge"
import { Button } from "../../Button/Button"
import { SimpleModal } from "../SimpleModal"
import { Icon } from "../../Icon/Icon"
import ReferralHowItWorksModal from "./ReferralHowItWorksModal"

type Props = {
  onClose: () => void
}

const ReferralDashboardModal = ({ onClose }: Props) => {
  const [copied, setCopied] = useState(false)
  const [showHowItWorks, setShowHowItWorks] = useState(false)
  const [activeTab, setActiveTab] = useState<'referrals' | 'leaderboard'>('referrals')
  const referralCode = "j21a891l"

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (showHowItWorks) {
    return <ReferralHowItWorksModal onClose={() => setShowHowItWorks(false)} />
  }

  // Function to create a referral card
  const ReferralCard = ({
    title,
    icon,
    value,
    subtitle,
    onValueClick,
    isTicket,
  }: {
    title: string;
    icon?: "SvgTrophy" | "SvgMedal" | "SvgCircledCheckmark" | "SvgTicket";
    value?: string;
    subtitle: string;
    onValueClick?: () => void;
    isTicket?: boolean;
  }) => {
    return (
      <div className="flex flex-col max-w-[165.5px] h-[114px] md:max-w-[201px] md:min-w-[170px] md:h-[118px] rounded-lg bg-secondary p-4">
        <span className="font-vcr text-fg-secondary text-sm md:text-lg font-normal mb-2 uppercase">
          {title}
        </span>
        
        <div className="flex items-center gap-2 mb-1">
          {icon && (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/20">
              <Icon 
                icon={icon} 
                className={twMerge(
                  "text-base text-brand-primary",
                  isTicket && "-rotate-[35deg]"
                )}
              />
            </div>
          )}
          {value && (
            <span 
              className={twMerge(
                "text-base md:text-xl font-medium text-white",
                onValueClick && "cursor-pointer transition-colors"
              )}
              onClick={onValueClick}
            >
              {value}
            </span>
          )}
        </div>

        <span 
          className={twMerge(
            "text-xs text-fg-primary/70 mt-auto",
            onValueClick && "cursor-pointer underline transition-colors"
          )}
          onClick={onValueClick}
        >
          {subtitle}
        </span>
      </div>
    );
  }

  const TableHeader = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-center gap-2 px-4 py-3 border-b border-bd-primary">
      {children}
    </div>
  )

  const TableRow = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-center gap-2 px-4 py-3 border-b border-bd-primary/20">
      {children}
    </div>
  )

  const TableCell = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={twMerge("text-sm text-fg-primary", className)}>
      {children}
    </div>
  )

  return (
    <SimpleModal
      showCloseBtn
      onClose={onClose}
      className="relative w-full max-w-[840px] overflow-y-hidden bg-default"
      headerClass="bg-default"
      actionButton={{
        text: "How does it work?",
        onClick: () => setShowHowItWorks(true)
      }}
    >
      <div className="flex max-h-[90vh] w-full flex-col items-center overflow-y-auto px-4 pb-[40px] md:max-h-[90vh] md:overflow-y-hidden md:px-[40px] md:pb-6">
        <span className="mb-3 text-center text-2xl font-semibold text-white">
          Invite Friends, get $SOLID
        </span>
        <span className="mb-[36px] text-center text-base font-normal text-fg-primary">
          Raffle happens & leaderboard closes in <span className="text-brand-primary">1d : 20h : 24m : 45s</span>
        </span>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <ReferralCard
            title="Your Rewards"
            icon="SvgTrophy"
            value="2,500"
            subtitle=""
          />
          <ReferralCard
            title="referral code"
            value={referralCode}
            subtitle={copied ? "Copied!" : "Copy"}
            onValueClick={handleCopy}
          />
          <ReferralCard
            title="Your Tickets"
            icon="SvgTicket"
            value="25"
            subtitle="Total issued: 2,000"
            isTicket
          />
          <ReferralCard
            title="Reward Pool"
            icon="SvgTrophy"
            value="10,000,000"
            subtitle=""
          />
        </div>

        {/* Mobile Tabs */}
        <div className="flex md:hidden w-full mb-4">
          <button
            className={twMerge(
              "flex-1 py-2 text-sm font-medium border-b-2 transition-colors",
              activeTab === 'referrals' 
                ? "border-brand-primary text-brand-primary" 
                : "border-transparent text-fg-secondary"
            )}
            onClick={() => setActiveTab('referrals')}
          >
            Referrals
          </button>
          <button
            className={twMerge(
              "flex-1 py-2 text-sm font-medium border-b-2 transition-colors",
              activeTab === 'leaderboard' 
                ? "border-brand-primary text-brand-primary" 
                : "border-transparent text-fg-secondary"
            )}
            onClick={() => setActiveTab('leaderboard')}
          >
            Leaderboard
          </button>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex w-full gap-4">
          {/* Referrals Table */}
          <div className="w-[418px] h-[536px] bg-secondary rounded-lg overflow-hidden">
            <div className="p-4 border-b border-bd-primary">
              <h3 className="text-lg font-medium text-white">Referrals</h3>
            </div>
            <div className="overflow-y-auto h-[calc(536px-64px)]">
              <TableHeader>
                <TableCell className="w-16">Pos.</TableCell>
                <TableCell className="flex-1">User</TableCell>
                <TableCell className="w-24">Tickets</TableCell>
                <TableCell className="w-24">Prize</TableCell>
              </TableHeader>
              <TableRow>
                <TableCell className="w-16">1</TableCell>
                <TableCell className="flex-1">@user1</TableCell>
                <TableCell className="w-24">150</TableCell>
                <TableCell className="w-24">$1,500</TableCell>
              </TableRow>
              {/* Add more rows as needed */}
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="w-[418px] h-[536px] bg-secondary rounded-lg overflow-hidden">
            <div className="p-4 border-b border-bd-primary">
              <h3 className="text-lg font-medium text-white">Leaderboard</h3>
            </div>
            <div className="overflow-y-auto h-[calc(536px-64px)]">
              <TableHeader>
                <TableCell className="flex-1">User</TableCell>
                <TableCell className="w-24">Connected</TableCell>
                <TableCell className="w-24">Invested</TableCell>
                <TableCell className="w-24">Tickets</TableCell>
              </TableHeader>
              <TableRow>
                <TableCell className="flex-1">@user1</TableCell>
                <TableCell className="w-24">5</TableCell>
                <TableCell className="w-24">$1,000</TableCell>
                <TableCell className="w-24">100</TableCell>
              </TableRow>
              {/* Add more rows as needed */}
            </div>
          </div>
        </div>

        {/* Mobile Tables */}
        <div className="md:hidden w-full">
          {activeTab === 'referrals' ? (
            <div className="bg-secondary rounded-lg overflow-hidden">
              <div className="p-4 border-b border-bd-primary">
                <h3 className="text-lg font-medium text-white">Referrals</h3>
              </div>
              <div className="overflow-y-auto max-h-[400px]">
                <TableHeader>
                  <TableCell className="w-16">Pos.</TableCell>
                  <TableCell className="flex-1">User</TableCell>
                  <TableCell className="w-24">Tickets</TableCell>
                  <TableCell className="w-24">Prize</TableCell>
                </TableHeader>
                <TableRow>
                  <TableCell className="w-16">1</TableCell>
                  <TableCell className="flex-1">@user1</TableCell>
                  <TableCell className="w-24">150</TableCell>
                  <TableCell className="w-24">$1,500</TableCell>
                </TableRow>
                {/* Add more rows as needed */}
              </div>
            </div>
          ) : (
            <div className="bg-secondary rounded-lg overflow-hidden">
              <div className="p-4 border-b border-bd-primary">
                <h3 className="text-lg font-medium text-white">Leaderboard</h3>
              </div>
              <div className="overflow-y-auto max-h-[400px]">
                <TableHeader>
                  <TableCell className="flex-1">User</TableCell>
                  <TableCell className="w-24">Connected</TableCell>
                  <TableCell className="w-24">Invested</TableCell>
                  <TableCell className="w-24">Tickets</TableCell>
                </TableHeader>
                <TableRow>
                  <TableCell className="flex-1">@user1</TableCell>
                  <TableCell className="w-24">5</TableCell>
                  <TableCell className="w-24">$1,000</TableCell>
                  <TableCell className="w-24">100</TableCell>
                </TableRow>
                {/* Add more rows as needed */}
              </div>
            </div>
          )}
        </div>
      </div>
    </SimpleModal>
  )
}

export default ReferralDashboardModal 