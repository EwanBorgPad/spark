import { useState, useEffect, useRef } from "react"
import { Button } from "../../Button/Button"
import { SimpleModal } from "../SimpleModal"
import { Icon } from "../../Icon/Icon"
import { useWalletContext } from "@/hooks/useWalletContext"
import { backendApi } from "@/data/backendApi"
import { useQuery } from "@tanstack/react-query"
import { useNavigate, useParams } from "react-router-dom"
import { ConnectButton } from "@/components/Header/ConnectButton"
import { useProjectDataContext } from "@/hooks/useProjectData"
import { formatCurrencyAmount } from "shared/utils/format"
import SimpleCountDownTimer from "@/components/SimpleCountDownTimer"
import Img from "@/components/Image/Img"
import { twMerge } from "tailwind-merge"
import ReferralsTable from "../../Tables/ReferralsTable"
import LeaderboardTable from "@/components/Tables/LeaderboardTable"

type Props = {
  onClose: () => void
}

const ReferralModal = ({ onClose }: Props) => {
  // Set up all the existing state and hooks from ReferralDashboardModal
  const [codeCopied, setCodeCopied] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'referrals' | 'leaderboard'>('referrals')
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const { address, isWalletConnected } = useWalletContext()
  const { projectId } = useParams()
  const { projectData } = useProjectDataContext()
  const projectType = projectData?.info.projectType || "goat"
  const navigate = useNavigate()
  const wasWalletConnected = useRef(isWalletConnected)
  
  // Check if user has seen How It Works before
  const [hasSeenHowItWorks, setHasSeenHowItWorks] = useState(localStorage.getItem(`hasSeenReferralHowItWorks_${projectId}`) === 'true')
  
  // Find the SALE_CLOSES event date from the timeline
  const saleClosesEvent = projectData?.info.timeline.find(event => event.id === "SALE_CLOSES")
  const saleClosesDate = saleClosesEvent?.date || new Date(Date.now() + 24 * 60 * 60 * 1000) // Fallback to 24h from now if not found

  const prizeAmount = projectData?.config?.referralDistribution?.totalAmountDistributed
  

  // Fetch user's referral code
  const { data: referralData } = useQuery({
    queryKey: ["getReferralCode", address],
    queryFn: () => backendApi.getReferralCode({ address: address || "", projectId: projectId || "" }),
    enabled: !!address,
  })
  // Fetch leaderbord
  const { data: leaderboardData } = useQuery({
    queryKey: ["getLeaderboard", address],
    queryFn: () => backendApi.getLeaderboard({ projectId: projectId || "" }),
  })

  const referralCode = referralData?.code || ""
  const baseUrl = window.location.origin
  const referralLink = referralCode ? `${baseUrl}/goat-pools/${projectId}?referral=${referralCode}` : ""

  const totalTickets = referralData?.totalTickets || []
  const firstTotalInvested = totalTickets.reduce((sum, ticket) => sum + (ticket?.total_invested || 0), 0)
  const ticketPerAmountInvested = 100
  const totalRewards = firstTotalInvested * ticketPerAmountInvested

  const leaderboardReferrals = leaderboardData?.leaderboardReferrals || []
  const referralsTable = referralData?.referralsTable || []
  const totalTicketsDistributed = leaderboardData?.totalTicketsDistributed || []

  // Calculate user's potential prize based on leaderboard position
  const calculateUserPrize = () => {
    if (!isWalletConnected || !address || !projectData?.config.referralDistribution) {
      return { value: "0", isRaffle: false };
    }

    // Find user's position in leaderboard
    const userPosition = leaderboardReferrals.findIndex(item => 
      item.referrer_by === address.substring(0, 4)
    );

    // Not in leaderboard
    if (userPosition === -1) {
      return { value: "0", isRaffle: false };
    }

    const position = (userPosition + 1).toString();
    const referralDistribution = projectData.config.referralDistribution;

    // Check if user is in ranking positions
    if (position in referralDistribution.ranking) {
      // User is in top positions, calculate prize from ranking percentage
      const rankingPercent = referralDistribution.ranking[position];
      return { 
        value: formatCurrencyAmount(prizeAmount ? prizeAmount * rankingPercent : 0),
        isRaffle: false
      };
    } else {
      // User might win raffle prize
      const raffleValues = Object.values(referralDistribution.raffle || {});
      if (raffleValues.length > 0) {
        const avgRafflePercent = raffleValues.reduce((sum, percent) => sum + percent, 0) / raffleValues.length;
        return { 
          value: formatCurrencyAmount(prizeAmount ? prizeAmount * avgRafflePercent : 0),
          isRaffle: true
        };
      }
    }

    return { value: "0", isRaffle: false };
  };

  // Handle window resize to update isMobile state
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Clean up event listener
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Mark as seen when dashboard is displayed
  useEffect(() => {
    if (!hasSeenHowItWorks) {
      localStorage.setItem(`hasSeenReferralHowItWorks_${projectId}`, 'true')
    }
  }, [hasSeenHowItWorks, projectId])
  
  // Function to continue from How It Works to Dashboard
  const showDashboard = () => {
    setHasSeenHowItWorks(true)
  }
  
  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode)
    setCodeCopied(true)
    setTimeout(() => setCodeCopied(false), 2000)
  }
  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
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
        // Find by text
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

  // Function to create a referral card
  const ReferralCard = ({
    title,
    icon,
    value,
    subtitle1,
    subtitle2,
    onValueClick1,
    onValueClick2,
    isTicket,
    showConnectButton,
    showSignToUButton,
    onSignToUClick,
  }: {
    title: string;
    icon?: "SvgTrophy" | "SvgMedal" | "SvgCircledCheckmark" | "SvgTicket";
    value?: string;
    subtitle1?: string;
    subtitle2?: string;
    onValueClick1?: () => void;
    onValueClick2?: () => void;
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
                onValueClick1 && "cursor-pointer transition-colors"
              )}
              onClick={onValueClick1}
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
          <div className="flex justify-between w-full mt-auto">
            <span
              className={twMerge(
                "text-xs text-fg-primary/70",
                onValueClick1 && "cursor-pointer underline transition-colors"
              )}
              onClick={onValueClick1}
            >
              {subtitle1}
            </span>
            <span
              className={twMerge(
                "text-xs text-fg-primary/70",
                onValueClick2 && "cursor-pointer underline transition-colors"
              )}
              onClick={onValueClick2}
            >
              {subtitle2}
            </span>
          </div>
        )}
      </div>
    );
  }

  // Function to create a numbered row for How It Works
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

  // Function to create a prize card for How It Works
  const PrizeCard = ({
    colorIcon,
    title,
    subtitle,
    amount,
    type
  }: {
    colorIcon: string;
    title: string | React.ReactNode;
    subtitle: string;
    amount: string;
    type: "grand" | "gold" | "silver" | "bronze";
  }) => {
    return (
      <div
        className={`flex h-[88px] md:h-[68px] w-full max-w-[343px] md:max-w-[430px] lg:min-w-[430px] items-center justify-between rounded-lg p-3 prize-card-gradient prize-card-${type} bg-grand-prize`}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/20">
            <Icon icon="SvgTrophy" className={`text-xl`} style={{ color: colorIcon }} />
          </div>
          <div className="flex flex-col max-w-[163px] md:max-w-[1000px]">
            <p className="font-medium text-white">{title}</p>
            <p className="text-sm text-fg-primary/70">{subtitle}</p>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <Img
            src={projectData?.info.logoUrl}
            isFetchingLink={false}
            imgClassName="scale-[102%]"
            isRounded={true}
            size="5"
          />
          <p className={`font-medium`} style={{ color: colorIcon }}>{amount}</p>
        </div>
      </div>
    );
  }

  // Return either How It Works or Dashboard based on state
  if (!hasSeenHowItWorks) {
    // Render the HowItWorks section
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
              Total: {formatCurrencyAmount(prizeAmount)} {projectData?.config.launchedTokenData.ticker}
            </span>

            <div className="flex flex-col gap-3">
              <PrizeCard
                colorIcon="#ACFF73"
                title={
                  <>
                    <span className="text-fg-secondary">1x </span> Grand Prize
                  </>
                }
                subtitle="1st ranking place"
                amount={formatCurrencyAmount(prizeAmount ? prizeAmount * (projectData?.config.referralDistribution?.ranking["1"] || 0.3) : 0)}
                type="grand"
              />

              <PrizeCard
                colorIcon="#F2BF7E"
                title={
                  <>
                    <span className="text-fg-secondary">1x </span> Gold Prize
                  </>
                }
                subtitle="2nd ranking place"
                amount={formatCurrencyAmount(prizeAmount ? prizeAmount * (projectData?.config.referralDistribution?.ranking["2"] || 0.2) : 0)}
                type="gold"
              />

              <PrizeCard
                colorIcon="#E1E7EF"
                title={
                  <>
                    <span className="text-fg-secondary">1x </span> Silver Prize
                  </>
                }
                subtitle="3rd ranking place"
                amount={formatCurrencyAmount(prizeAmount ? prizeAmount * (projectData?.config.referralDistribution?.ranking["3"] || 0.1) : 0)}
                type="silver"
              />

              <PrizeCard
                colorIcon="#D38160"
                title={
                  <>
                    <span className="text-fg-secondary">{Object.keys(projectData?.config.referralDistribution?.raffle || {}).length}x </span> Bronze Prize
                  </>
                }
                subtitle="Raffle winners"
                amount={formatCurrencyAmount(prizeAmount ? 
                  prizeAmount * Object.values(projectData?.config.referralDistribution?.raffle || {}).reduce((a, b) => a + (b || 0), 0) / Object.keys(projectData?.config.referralDistribution?.raffle || {}).length : 0)}
                type="bronze"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-center md:fixed md:bottom-8 md:left-1/2 md:-translate-x-1/2 md:w-full">
            <Button
              btnText="Continue"
              color="primary"
              className="max-w-[343px] w-[316px] h-[44px] md:w-[400px] md:h-[44px]"
              onClick={showDashboard}
            />
          </div>
        </div>
      </SimpleModal>
    )
  }
  
  // Otherwise render the Dashboard section
  return (
    <SimpleModal
      showCloseBtn
      onClose={onClose}
      className="relative w-full max-w-[840px] overflow-y-hidden bg-default"
      headerClass="bg-default"
      actionButton={{
        text: "How does it work?",
        onClick: () => setHasSeenHowItWorks(false) // Allow going back to How It Works
      }}
    >
      <div className="flex max-h-[90vh] w-full flex-col items-center overflow-y-auto px-4 pb-[40px] md:max-h-[90vh] md:overflow-y-hidden md:px-[40px] md:pb-6">
        <span className="mb-3 text-center text-2xl font-semibold text-white">
          Invite Friends, {projectData?.config.launchedTokenData.ticker}
        </span>
        <div className="mb-[36px] flex items-center justify-center flex-wrap gap-2 text-center text-base font-normal text-fg-primary">
          <span>Raffle happens & leaderboard closes in</span>
          <SimpleCountDownTimer 
            endOfEvent={saleClosesDate} 
            labelAboveTimer="" 
            className="!h-auto !w-auto !bg-transparent !pt-0 inline-flex" 
            timerClass="text-brand-primary"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <ReferralCard
            title="Your Rewards"
            icon="SvgTrophy"
            value={calculateUserPrize().value}
            subtitle1={calculateUserPrize().isRaffle ? "Depending on the raffle" : ""}
          />
          <ReferralCard
            title="referral code"
            value={isWalletConnected ? (referralCode || "") : ""}
            subtitle1={
              !isWalletConnected
                ? "Connect Wallet"
                : isWalletConnected && !referralCode
                  ? "Sign ToU"
                  : codeCopied
                    ? "Copied!"
                    : isMobile ? "Code" : "Copy Code"
            }
            subtitle2={
              !isWalletConnected
                ? "Connect Wallet"
                : isWalletConnected && !referralCode
                  ? "Sign ToU"
                  : linkCopied
                    ? "Copied!"
                    : isMobile ? "Link" : "Copy Link"
            }
            onValueClick1={
              !isWalletConnected
                ? handleConnectWallet
                : handleCopyCode
            }
            onValueClick2={
              !isWalletConnected
                ? handleConnectWallet
                : handleCopyLink
            }
            showConnectButton={!isWalletConnected}
            showSignToUButton={isWalletConnected && !referralCode}
            onSignToUClick={handleSignToU}
          />
          <ReferralCard
            title="Your Tickets"
            icon="SvgTicket"
            value={isWalletConnected ? String(firstTotalInvested * ticketPerAmountInvested) : "0"}
            subtitle1={`Total issued: ${totalTicketsDistributed[0]?.total_invested * ticketPerAmountInvested || 0}`}
            isTicket
          />
          <ReferralCard
            title="Reward Pool"
            icon="SvgTrophy"
            value={formatCurrencyAmount(prizeAmount)}
            subtitle1=""
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
                <LeaderboardTable data={leaderboardReferrals} prizeAmount={prizeAmount} totalTicketsDistributed={totalTicketsDistributed} />
              </div>
            </div>
          )}
        </div>
      </div>
    </SimpleModal>
  )
}

export default ReferralModal
