import React, { useState, useEffect, useRef } from "react";
import { useWalletContext } from "@/hooks/useWalletContext";
import { backendApi } from "@/data/api/backendApi";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { useProjectDataContext } from "@/hooks/useProjectData";
import { formatCurrencyAmount } from "shared/utils/format";

import HowItWorksSection from "../../Referral/HowItWorksSection";
import ReferralDashboard from "../../Referral/ReferralDashboard";
import { ReferralData, LeaderboardData, TotalTicketsDistributed, UserPrize, ProjectDataTypeForReferral } from "../../Referral/types";
import { referralApi } from "@/data/api/referralApi";

type ReferralModalProps = {
  onClose: () => void;
};

/**
 * Main ReferralModal component
 * This component manages the referral program UI with a How It Works screen
 * and a Dashboard view.
 */
const ReferralModal: React.FC<ReferralModalProps> = ({ onClose }) => {
  // UI state
  const [codeCopied, setCodeCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Context and hooks
  const { address, isWalletConnected } = useWalletContext();
  const { projectId } = useParams();
  const { projectData } = useProjectDataContext();
  const navigate = useNavigate();

  // Check if user has seen How It Works before
  const [hasSeenHowItWorks, setHasSeenHowItWorks] = useState(
    localStorage.getItem(`hasSeenReferralHowItWorks_${projectId}`) === 'true'
  );

  // Get project timeline data
  const saleClosesEvent = projectData?.info.timeline?.find(event => event.id === "SALE_CLOSES");
  const saleClosesDate = saleClosesEvent?.date ? new Date(saleClosesEvent.date) : new Date(Date.now() + 24 * 60 * 60 * 1000); // Fallback to 24h from now if not found

  const prizeAmount = projectData?.config?.referralDistribution?.totalAmountDistributed;
  const ticketPerAmountInvested = 1; // Hardcoded value for tickets per dollar

  // Fetch referral data
  const { data: referralData } = useQuery({
    queryKey: ["getReferralCode", address],
    queryFn: () => referralApi.getReferralCode({ address: address || "", projectId: projectId || "" }),
    enabled: !!address,
  });

  // Fetch leaderboard data
  const { data: leaderboardData } = useQuery({
    queryKey: ["getLeaderboard", address],
    queryFn: () => referralApi.getLeaderboard({ projectId: projectId || "" }),
  });

  const referralCode = referralData?.code || "";
  const baseUrl = window.location.origin;
  const referralLink = referralCode ? `${baseUrl}/launch-pools/${projectId}?referral=${referralCode}` : "";

  // Calculate total rewards
  const totalTickets = referralData?.totalTickets || [];
  const firstTotalInvested = totalTickets.reduce((sum, ticket) => sum + (ticket?.total_invested || 0), 0);
  const totalRewards = firstTotalInvested * ticketPerAmountInvested;

  // Prepare data for UI
  const leaderboardReferrals = (leaderboardData?.leaderboardReferrals || []) as LeaderboardData[];
  const referralsTable = (referralData?.referralsTable || []) as ReferralData[];
  const totalTicketsDistributed = (leaderboardData?.totalTicketsDistributed || []) as TotalTicketsDistributed[];

  // Calculate user entry and position
  const userEntry = address ? leaderboardReferrals.find(item => item.referrer_by === address.substring(0, 4)) || null : null;
  const userPosition = userEntry ? leaderboardReferrals.findIndex(item => item.referrer_by === address.substring(0, 4)) + 1 : 0;

  // Calculate user's potential prize based on leaderboard position
  const calculateUserPrize = (): UserPrize => {
    if (!isWalletConnected || !address || !projectData?.config.referralDistribution) {
      return { value: "0", isRaffle: false };
    }

    // If we have final results, use those
    if (userEntry && userEntry.result_type === 'ranking') {
      const position = userPosition.toString();
      const rankingAmount = projectData.config.referralDistribution.ranking[position];
      return { 
        value: formatCurrencyAmount(rankingAmount || 0),
        isRaffle: false
      };
    } else if (userEntry && userEntry.result_type === 'raffle') {
      // For raffle winners, use the raffle prize amount
      const raffleValues = Object.values(projectData.config.referralDistribution.raffle || {});
      if (raffleValues.length > 0) {
        const avgRaffleAmount = raffleValues.reduce((sum, amount) => sum + amount, 0) / raffleValues.length;
        return { 
          value: formatCurrencyAmount(avgRaffleAmount),
          isRaffle: false
        };
      }
    } else if (userEntry && userEntry.result_type === 'lost') {
      return { 
        value: "0",
        isRaffle: false
      };
    }

    // For ongoing results, calculate potential prize
    const position = userPosition.toString();

    // Check if user is in ranking positions
    if (position in projectData.config.referralDistribution.ranking) {
      const rankingAmount = projectData.config.referralDistribution.ranking[position];
      return { 
        value: formatCurrencyAmount(rankingAmount || 0),
        isRaffle: false
      };
    } else {
      // User might win raffle prize
      const raffleValues = Object.values(projectData.config.referralDistribution.raffle || {});
      if (raffleValues.length > 0) {
        const avgRaffleAmount = raffleValues.reduce((sum, amount) => sum + amount, 0) / raffleValues.length;
        return { 
          value: formatCurrencyAmount(avgRaffleAmount),
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
      localStorage.setItem(`hasSeenReferralHowItWorks_${projectId}`, 'true');
    }
  }, [hasSeenHowItWorks, projectId]);
  
  const showDashboard = () => {
    setHasSeenHowItWorks(true);
  };
  
  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleConnectWallet = () => {
    const event = new CustomEvent('openWalletModal');
    window.dispatchEvent(event);
  };

  const scrollToJoinThePool = () => {
    setTimeout(() => {
      const joinThePoolElement = document.getElementById('complianceHeading');
      if (joinThePoolElement) {
        joinThePoolElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        const headings = document.querySelectorAll('h2');
        for (const heading of headings) {
          if (heading.textContent?.includes('Join the Launch Pool')) {
            heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
            break;
          }
        }
      }
    }, 500);
  };

  const handleSignToU = () => {
    onClose();
    navigate(`/launch-pools/${projectId}`);
    scrollToJoinThePool();
  };

  // Render either HowItWorks section or Dashboard
  if (!hasSeenHowItWorks) {
    return (
      <HowItWorksSection 
        onContinue={showDashboard}
        onClose={onClose}
        projectData={projectData as ProjectDataTypeForReferral}
      />
    );
  }
  
  return (
    <ReferralDashboard
      onClose={onClose}
      onHowItWorks={() => setHasSeenHowItWorks(false)}
      referralCode={referralCode}
      totalRewards={totalRewards}
      totalTicketsDistributed={totalTicketsDistributed}
      saleClosesDate={saleClosesDate}
      isWalletConnected={isWalletConnected}
      codeCopied={codeCopied}
      linkCopied={linkCopied}
      isMobile={isMobile}
      userPrize={calculateUserPrize()}
      referralLink={referralLink}
      prizeAmount={prizeAmount}
      projectData={projectData as ProjectDataTypeForReferral}
      referralsTable={referralsTable}
      leaderboardReferrals={leaderboardReferrals}
      onCopyCode={handleCopyCode}
      onCopyLink={handleCopyLink}
      onConnectWallet={handleConnectWallet}
      onSignToU={handleSignToU}
      ticketPerAmountInvested={ticketPerAmountInvested}
      userEntry={userEntry}
      userPosition={userPosition}
    />
  );
};

export default ReferralModal; 