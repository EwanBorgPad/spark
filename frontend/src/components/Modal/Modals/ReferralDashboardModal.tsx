import { useState, useEffect, useRef } from "react"
import { twMerge } from "tailwind-merge"
import { Button } from "../../Button/Button"
import { SimpleModal } from "../SimpleModal"
import { Icon } from "../../Icon/Icon"
import ReferralHowItWorksModal from "./ReferralHowItWorksModal"
import ReferralsTable from "../../Tables/ReferralsTable"
import LeaderboardTable from "@/components/Tables/LeaderboardTable"
import { useWalletContext } from "@/hooks/useWalletContext"
import { backendApi } from "@/data/backendApi"
import { useQuery } from "@tanstack/react-query"
import { useNavigate, useParams } from "react-router-dom"
import { ConnectButton } from "@/components/Header/ConnectButton"
import { useProjectDataContext } from "@/hooks/useProjectData"
import { formatCurrencyAmount } from "shared/utils/format"
import SimpleCountDownTimer from "@/components/SimpleCountDownTimer"
import Img from "@/components/Image/Img"


type Props = {
  onClose: () => void
}

const ReferralDashboardModal = ({ onClose }: Props) => {
  const [copied, setCopied] = useState(false)
  const [showHowItWorks, setShowHowItWorks] = useState(false)
  const [activeTab, setActiveTab] = useState<'referrals' | 'leaderboard'>('referrals')
  const { address, isWalletConnected, walletState } = useWalletContext()
  const { projectId } = useParams()
  const { projectData } = useProjectDataContext()
  const projectType = projectData?.info.projectType || "goat"
  const navigate = useNavigate()
  const wasWalletConnected = useRef(isWalletConnected)

  // Find the SALE_CLOSES event date from the timeline
  const saleClosesEvent = projectData?.info.timeline.find(event => event.id === "SALE_CLOSES")
  const saleClosesDate = saleClosesEvent?.date || new Date(Date.now() + 24 * 60 * 60 * 1000) // Fallback to 24h from now if not found

  const prizeAmount = projectData?.config?.raiseTargetInUsd

  // Fetch user's referral code
  const { data: referralData } = useQuery({
    queryKey: ["getReferralCode", address],
    queryFn: () => backendApi.getReferralCode({ address: address || "", projectId: projectId || "" }),
    enabled: !!address,
  })

  const referralCode = referralData?.code || ""
  const totalTickets = referralData?.totalTickets || []
  const firstTotalInvested = totalTickets.reduce((sum, ticket) => sum + (ticket?.total_invested || 0), 0); // Sum of all total_invested values
  
  const ticketPerAmountInvested = 100;
  const totalRewards = firstTotalInvested * ticketPerAmountInvested;

  const leaderboardReferrals = referralData?.leaderboardReferrals || []
  const referralsTable = referralData?.referralsTable || []

  const totalTicketsDistributed = referralData?.totalTicketsDistributed || []

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleConnectWallet = () => {
    // Trigger wallet connection modal
    const event = new CustomEvent('openWalletModal')
    window.dispatchEvent(event)
  }

  const scrollToJoinThePool = () => {
    // Wait for navigation to complete
    setTimeout(() => {
      // Find element with ID "complianceHeading" containing "Join the Launch Pool"
      const joinThePoolElement = document.getElementById('complianceHeading')
      if (joinThePoolElement) {
        // Scroll to element
        joinThePoolElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } else {
        // If element not found, try finding by text
        const headings = document.querySelectorAll('h2')
        for (const heading of headings) {
          if (heading.textContent?.includes('Join the Launch Pool')) {
            heading.scrollIntoView({ behavior: 'smooth', block: 'start' })
            break
          }
        }
      }
    }, 500) // Delay to ensure page has loaded
  }

  const handleSignToU = () => {
    onClose()
    // Navigate to the project page with the "Join the Launch Pool" section
    navigate(`/${projectType}-pools/${projectId}`)
    // Scroll to "Join the Launch Pool" section
    scrollToJoinThePool()
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
    showConnectButton,
    showSignToUButton,
    onSignToUClick,
  }: {
    title: string;
    icon?: "SvgTrophy" | "SvgMedal" | "SvgCircledCheckmark" | "SvgTicket";
    value?: string;
    subtitle?: string;
    onValueClick?: () => void;
    isTicket?: boolean;
    showConnectButton?: boolean;
    showSignToUButton?: boolean;
    onSignToUClick?: () => void;
  }) => {
    return (
      <div className="flex flex-col max-w-[165.5px] h-[114px] md:max-w-[201px] md:min-w-[170px] md:h-[118px] rounded-lg bg-secondary p-4">
        <span className="font-vcr text-fg-secondary text-sm md:text-lg font-normal mb-2 uppercase">
          {title}
        </span>

        <div className="flex items-center gap-2 mb-1">
          {title === "Reward Pool" || title === "Your Rewards" ? (
            <Img
              src={projectData?.info.logoUrl}
              isFetchingLink={false}
              imgClassName="scale-[102%]"
              isRounded={true}
              size="4"
            />
          ) : icon && (
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

        {showConnectButton ? (
          <div className="mt-auto">
            <ConnectButton size="xs" />
          </div>
        ) : showSignToUButton ? (
          <div className="mt-auto">
            <Button
              btnText="Sign ToU"
              size="xs"
              onClick={onSignToUClick}
            />
          </div>
        ) : (
          <span
            className={twMerge(
              "text-xs text-fg-primary/70 mt-auto",
              onValueClick && "cursor-pointer underline transition-colors"
            )}
            onClick={onValueClick}
          >
            {subtitle}
          </span>
        )}
      </div>
    );
  }

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
          Invite Friends, {projectData?.config.launchedTokenData.ticker}
        </span>
        <span className="mb-[36px] text-center text-base font-normal text-fg-primary">
          Raffle happens & leaderboard closes in <SimpleCountDownTimer
            endOfEvent={saleClosesDate}
            labelAboveTimer=""
            className="!h-auto !bg-transparent !pt-0"
            timerClass="text-brand-primary"
          />
        </span>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <ReferralCard
            title="Your Rewards"
            icon="SvgTrophy"
            value={isWalletConnected ? String(totalRewards) : "0"}
          />
          <ReferralCard
            title="referral code"
            value={isWalletConnected ? (referralCode || "") : ""}
            subtitle={
              !isWalletConnected
                ? "Connect Wallet"
                : isWalletConnected && !referralCode
                  ? "Sign ToU"
                  : copied ? "Copied!" : "Copy"
            }
            onValueClick={
              !isWalletConnected
                ? handleConnectWallet
                : handleCopy
            }
            showConnectButton={!isWalletConnected}
            showSignToUButton={isWalletConnected && !referralCode}
            onSignToUClick={handleSignToU}
          />
          <ReferralCard
            title="Your Tickets"
            icon="SvgTicket"
            value={isWalletConnected ? String(firstTotalInvested) : "0"}
            subtitle={`Total issued: ${totalTicketsDistributed[0]?.total_invested || 0}`}
            isTicket
          />
          <ReferralCard
            title="Reward Pool"
            icon="SvgTrophy"
            value={formatCurrencyAmount(prizeAmount)}
            subtitle=""
          />
        </div>

        {/* Mobile Tabs */}
        <div className="flex md:hidden w-full mb-4">
          <button
            className={twMerge(
              "flex-1 py-2 text-sm font-vcr border-b-2 transition-colors uppercase",
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
              "flex-1 py-2 text-sm font-vcr border-b-2 transition-colors uppercase",
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
        <div className="hidden md:flex w-full gap-6">
          {/* Referrals Table */}
          <div className="w-[418px] h-[536px] bg-default rounded-lg overflow-hidden bg-secondary">
            <div className="p-4">
              <h3 className="text-lg font-vcr text-white uppercase">Referrals</h3>
            </div>
            <div className="overflow-y-auto h-[calc(536px-64px)]">
              {!isWalletConnected ? (
                <div className="flex flex-col items-center justify-center h-full p-4">
                  <span className="text-fg-secondary mb-4 text-center">Connect your wallet to see your referrals</span>
                  <ConnectButton size="md" />
                </div>
              ) : !referralCode ? (
                <div className="flex flex-col items-center justify-center h-full p-4">
                  <span className="text-fg-secondary mb-4 text-center">Sign Terms of Use to see your referrals</span>
                  <Button
                    btnText="Sign ToU"
                    size="md"
                    onClick={handleSignToU}
                  />
                </div>
              ) : (
                <ReferralsTable data={referralsTable} />
              )}
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="w-[418px] h-[536px] bg-default rounded-lg overflow-hidden bg-secondary">
            <div className="p-4">
              <h3 className="text-lg font-vcr text-white uppercase">Leaderboard</h3>
            </div>
            <div className="overflow-y-auto h-[calc(536px-64px)]">
              <LeaderboardTable data={leaderboardReferrals} prizeAmount={prizeAmount} totalTicketsDistributed={totalTicketsDistributed} />
            </div>
          </div>
        </div>

        {/* Mobile Tables */}
        <div className="md:hidden w-full mt-4">
          {activeTab === 'referrals' ? (
            <div className="bg-default rounded-lg overflow-hidden">
              <div className="w-full">
                {!isWalletConnected ? (
                  <div className="flex flex-col items-center justify-center p-8">
                    <span className="text-fg-secondary mb-4 text-center">Connect your wallet to see your referrals</span>
                    <ConnectButton size="md" />
                  </div>
                ) : !referralCode ? (
                  <div className="flex flex-col items-center justify-center p-8">
                    <span className="text-fg-secondary mb-4 text-center">Sign Terms of Use to see your referrals</span>
                    <Button
                      btnText="Sign ToU"
                      size="md"
                      onClick={handleSignToU}
                    />
                  </div>
                ) : (
                  <ReferralsTable data={referralsTable} />
                )}
              </div>
            </div>
          ) : (
            <div className="bg-default rounded-lg overflow-hidden">
              <div className="w-full">
                <LeaderboardTable data={leaderboardReferrals} />
              </div>
            </div>
          )}
        </div>
      </div>
    </SimpleModal>
  )
}

export default ReferralDashboardModal 