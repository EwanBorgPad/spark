import React, { useState } from "react";
import { SimpleModal } from "../Modal/SimpleModal";
import { Button } from "../Button/Button";
import { ConnectButton } from "../Header/ConnectButton";
import { twMerge } from "tailwind-merge";
import ReferralCard from "./ReferralCard";
import SimpleCountDownTimer from "@/components/SimpleCountDownTimer";
import ReferralsTable from "@/components/Tables/ReferralsTable";
import LeaderboardTable from "@/components/Tables/LeaderboardTable";
import { formatCurrencyAmount } from "shared/utils/format";
import {
  ProjectDataTypeForReferral,
  ReferralData,
  LeaderboardData,
  TotalTicketsDistributed,
  UserPrize
} from "./types";

export interface ReferralDashboardProps {
  onClose: () => void;
  onHowItWorks: () => void;
  referralCode: string;
  totalRewards: number;
  totalTicketsDistributed: TotalTicketsDistributed[];
  saleClosesDate: Date;
  isWalletConnected: boolean;
  codeCopied: boolean;
  linkCopied: boolean;
  isMobile: boolean;
  userPrize: UserPrize;
  referralLink: string;
  prizeAmount?: number;
  projectData?: ProjectDataTypeForReferral;
  referralsTable: ReferralData[];
  leaderboardReferrals: LeaderboardData[];
  onCopyCode: () => void;
  onCopyLink: () => void;
  onConnectWallet: () => void;
  onSignToU: () => void;
  ticketPerAmountInvested: number;
}

/**
 * Component to display referral info dashboard panel
 */
const ReferralDashboard: React.FC<ReferralDashboardProps> = ({
  onClose,
  onHowItWorks,
  referralCode,
  totalRewards,
  totalTicketsDistributed,
  saleClosesDate,
  isWalletConnected,
  codeCopied,
  linkCopied,
  isMobile,
  userPrize,
  referralLink,
  prizeAmount,
  projectData,
  referralsTable,
  leaderboardReferrals,
  onCopyCode,
  onCopyLink,
  onConnectWallet,
  onSignToU,
  ticketPerAmountInvested,
}) => {
  const [activeTab, setActiveTab] = useState<'referrals' | 'leaderboard'>('referrals');

  return (
    <SimpleModal
      showCloseBtn
      onClose={onClose}
      className="relative w-full max-w-[840px] overflow-y-hidden bg-default"
      headerClass="bg-default"
      actionButton={{
        text: "How does it work?",
        onClick: onHowItWorks
      }}
    >
      <div className="flex max-h-[90vh] w-full flex-col items-center overflow-y-auto px-6 pb-6 md:max-h-[90vh] md:overflow-y-hidden md:px-6 md:pb-6">
        <div className="w-full">
          <span className="mb-3 text-center block text-2xl font-semibold text-white">
            Invite Friends, {projectData?.config.launchedTokenData.ticker}
          </span>
          <div className="mb-6 flex items-center justify-center flex-wrap gap-2 text-center text-base font-normal text-fg-primary">
            <span>Raffle happens & leaderboard closes in</span>
            <SimpleCountDownTimer
              endOfEvent={saleClosesDate}
              labelAboveTimer=""
              className="!h-auto !w-auto !bg-transparent !pt-0 inline-flex"
              timerClass="text-brand-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 w-full">
          <ReferralCard
            title="Your Rewards"
            icon="SvgTrophy"
            value={userPrize.value}
            subtitle1={userPrize.isRaffle ? "Depending on the raffle" : ""}
            logoUrl={projectData?.info.logoUrl}
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
                ? onConnectWallet
                : isWalletConnected && !referralCode
                  ? undefined
                  : onCopyCode
            }
            onValueClick2={
              !isWalletConnected
                ? onConnectWallet
                : isWalletConnected && !referralCode
                  ? undefined
                  : onCopyLink
            }
            showConnectButton={!isWalletConnected}
            showSignToUButton={isWalletConnected && !referralCode}
            onSignToUClick={onSignToU}
          />
          <ReferralCard
            title="Your Tickets"
            icon="SvgTicket"
            value={isWalletConnected ? String(totalRewards) : "0"}
            subtitle1={`Total issued: ${(totalTicketsDistributed[0]?.total_invested || 0) * ticketPerAmountInvested}`}
            isTicket
          />
          <ReferralCard
            title="Reward Pool"
            icon="SvgTrophy"
            value={formatCurrencyAmount(prizeAmount)}
            subtitle1=""
            logoUrl={projectData?.info.logoUrl}
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
        <div className="hidden md:flex w-full gap-4">
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
                    onClick={onSignToU}
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
                      onClick={onSignToU}
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
  );
};

export default ReferralDashboard; 