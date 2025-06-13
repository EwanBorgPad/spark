import React, { useState, useEffect } from 'react';
import { DaoProposalModel, DaoModel } from '../../../shared/models';
import Text from '../Text';
import { Button } from '../Button/Button';
import { usePrivy, useSolanaWallets } from '@privy-io/react-auth';
import { Connection, PublicKey } from '@solana/web3.js';
import GovernanceService from '../../services/governanceService';

interface ProposalVotingProps {
  proposal: DaoProposalModel;
  dao: DaoModel;
  className?: string;
}

const ProposalVoting: React.FC<ProposalVotingProps> = ({ proposal, dao, className = "" }) => {
  const { user, authenticated } = usePrivy();
  const { wallets } = useSolanaWallets();
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [userVote, setUserVote] = useState<'approve' | 'deny' | null>(null);

  const RPC_URL = import.meta.env.VITE_RPC_URL || "https://haleigh-sa5aoh-fast-mainnet.helius-rpc.com";
  const connection = new Connection(RPC_URL);
  const governanceService = new GovernanceService(RPC_URL);

  // Get Solana wallet from Privy
  const getSolanaWallet = () => {
    return wallets[0]; // Get the first (and typically only) Solana wallet
  };

  // Check if proposal is in voting state
  const isVotingOpen = proposal.state && typeof proposal.state === 'object' && 'voting' in proposal.state;

  // Format proposal state
  const getProposalStateDisplay = () => {
    if (!proposal.state) return 'Unknown';
    if (typeof proposal.state === 'object') {
      const stateKey = Object.keys(proposal.state)[0];
      return stateKey.charAt(0).toUpperCase() + stateKey.slice(1);
    }
    return proposal.state;
  };

  // Format vote numbers to be human readable (divide by 10^9 for most Solana tokens)
  const formatVoteCount = (voteWeight: string | number): string => {
    const weight = typeof voteWeight === 'string' ? parseInt(voteWeight) : voteWeight;
    if (weight === 0) return "0";
    
    // Assume 9 decimal places for most Solana tokens
    const formatted = weight / 1000000000;
    
    if (formatted >= 1000000) {
      return `${(formatted / 1000000).toFixed(1)}M`;
    } else if (formatted >= 1000) {
      return `${(formatted / 1000).toFixed(1)}K`;
    } else {
      return formatted.toFixed(1);
    }
  };

  // Check user's vote status
  useEffect(() => {
    const checkUserVote = async () => {
      if (!authenticated || !user?.wallet?.address) return;

      try {
        const userPubkey = new PublicKey(user.wallet.address);
        const realmPubkey = new PublicKey(dao.address);
        const proposalPubkey = new PublicKey(proposal.address);
        const communityMint = new PublicKey(dao.communityMint);

        const { hasVoted: voted, vote } = await governanceService.getUserVoteRecord(
          userPubkey,
          realmPubkey,
          proposalPubkey,
          communityMint
        );

        setHasVoted(voted);
        setUserVote(vote);
      } catch (error) {
        console.error("Error checking vote status:", error);
      }
    };

    checkUserVote();
  }, [authenticated, user, dao.address, proposal.address, dao.communityMint]);

  // Don't render if voting is not open
  if (!isVotingOpen) {
    return null;
  }

  const handleVote = async (voteType: 'approve' | 'deny') => {
    if (!authenticated || !user?.wallet?.address) {
      alert("Please connect your wallet first");
      return;
    }

    setIsVoting(true);
    try {
      const userPubkey = new PublicKey(user.wallet.address);
      const realmPubkey = new PublicKey(dao.address);
      const proposalPubkey = new PublicKey(proposal.address);
      const communityMint = new PublicKey(dao.communityMint);

      // Find the governance account for this proposal
      let governancePubkey: PublicKey;
      if (dao.governances && dao.governances.length > 0) {
        governancePubkey = new PublicKey(dao.governances[0].address);
      } else {
        throw new Error("No governance account found for this DAO");
      }

      // Create vote transaction
      const transaction = await governanceService.createCastVoteTransaction(
        userPubkey,
        realmPubkey,
        governancePubkey,
        proposalPubkey,
        communityMint,
        voteType
      );

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = userPubkey;

      console.log(`Signing ${voteType} vote with Privy...`);
      
      // Get Privy Solana wallet
      const solanaWallet = getSolanaWallet();
      if (!solanaWallet) {
        throw new Error("No Solana wallet found");
      }

      // Sign transaction using Privy
      const signedTransaction = await solanaWallet.signTransaction(transaction);
      
      // Send transaction
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      console.log("Vote transaction sent, waiting for confirmation...");
      
      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');
      
      console.log(`Vote ${voteType} successful! Signature:`, signature);
      alert(`Successfully voted ${voteType}!\nSignature: ${signature.slice(0, 8)}...${signature.slice(-8)}`);
      
      // Update local state
      setHasVoted(true);
      setUserVote(voteType);

    } catch (error) {
      console.error("Error casting vote:", error);
      alert("Failed to cast vote. This is using a placeholder implementation.");
    } finally {
      setIsVoting(false);
    }
  };

  const handleRelinquishVote = async () => {
    if (!authenticated || !user?.wallet?.address) {
      alert("Please connect your wallet first");
      return;
    }

    setIsVoting(true);
    try {
      const userPubkey = new PublicKey(user.wallet.address);
      const realmPubkey = new PublicKey(dao.address);
      const proposalPubkey = new PublicKey(proposal.address);
      const communityMint = new PublicKey(dao.communityMint);

      // Find the governance account for this proposal
      let governancePubkey: PublicKey;
      if (dao.governances && dao.governances.length > 0) {
        governancePubkey = new PublicKey(dao.governances[0].address);
      } else {
        throw new Error("No governance account found for this DAO");
      }

      // Create relinquish vote transaction
      const transaction = await governanceService.createRelinquishVoteTransaction(
        userPubkey,
        realmPubkey,
        governancePubkey,
        proposalPubkey,
        communityMint
      );

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = userPubkey;

      console.log("Signing relinquish vote with Privy...");
      
      // Get Privy Solana wallet
      const solanaWallet = getSolanaWallet();
      if (!solanaWallet) {
        throw new Error("No Solana wallet found");
      }

      // Sign transaction using Privy
      const signedTransaction = await solanaWallet.signTransaction(transaction);
      
      // Send transaction
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      console.log("Relinquish vote transaction sent, waiting for confirmation...");
      
      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');
      
      console.log("Relinquish vote successful! Signature:", signature);
      alert(`Successfully changed vote!\nSignature: ${signature.slice(0, 8)}...${signature.slice(-8)}`);
      
      // Update local state
      setHasVoted(false);
      setUserVote(null);

    } catch (error) {
      console.error("Error relinquishing vote:", error);
      alert("Failed to relinquish vote. This is using a placeholder implementation.");
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className={`bg-bg-secondary rounded-lg p-6 border border-fg-primary/10 ${className}`}>
      {/* Proposal Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <Text text={proposal.name || "Unnamed Proposal"} as="h3" className="text-lg font-semibold" />
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
            {getProposalStateDisplay()}
          </span>
        </div>
        
        {proposal.description && (
          <Text text={proposal.description} as="p" className="text-sm text-fg-primary text-opacity-75 mb-4" />
        )}

        {/* Proposal Vote Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-green-500/10 rounded-lg p-3 text-center">
            <Text text="Yes Votes" as="p" className="text-fg-primary text-opacity-60 mb-1" />
            <Text 
              text={formatVoteCount(proposal.options[0]?.voteWeight || "0")} 
              as="p" 
              className="text-xl font-bold text-green-500" 
            />
          </div>
          <div className="bg-red-500/10 rounded-lg p-3 text-center">
            <Text text="No Votes" as="p" className="text-fg-primary text-opacity-60 mb-1" />
            <Text 
              text={formatVoteCount(proposal.denyVoteWeight || "0")} 
              as="p" 
              className="text-xl font-bold text-red-500" 
            />
          </div>
        </div>
      </div>

      {!authenticated ? (
        <div className="text-center py-4">
          <Text text="Connect your wallet to participate in voting" as="p" className="text-fg-primary text-opacity-75" />
        </div>
      ) : hasVoted ? (
        <div className="space-y-4">
          <div className="text-center py-3 bg-bg-primary/5 rounded-lg">
            <Text text="Your Vote" as="p" className="text-fg-primary text-opacity-75 mb-2" />
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              userVote === 'approve' 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-red-500/20 text-red-400'
            }`}>
              {userVote === 'approve' ? '✓ Yes' : '✗ No'}
            </span>
          </div>
          
          <Button
            onClick={handleRelinquishVote}
            disabled={isVoting}
            className="w-full bg-gray-600 hover:bg-gray-700"
          >
            {isVoting ? "Processing..." : "Change Vote"}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-center py-2">
            <Text text="Cast your vote on this proposal" as="p" className="text-fg-primary text-opacity-75 mb-4" />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => handleVote('approve')}
              disabled={isVoting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isVoting ? "Voting..." : "Vote Yes"}
            </Button>
            
            <Button
              onClick={() => handleVote('deny')}
              disabled={isVoting}
              className="bg-[#FF2200FF] hover:bg-[#8B1C0BFF]"
            >
              {isVoting ? "Voting..." : "Vote No"}
            </Button>
          </div>
          
          <div className="text-center text-xs text-fg-primary text-opacity-60">
            <Text text="You need governance tokens deposited to vote" as="p" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProposalVoting; 