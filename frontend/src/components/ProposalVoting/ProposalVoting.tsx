import React, { useState, useEffect } from 'react';
import { DaoProposalModel, DaoModel } from '../../../shared/models';
import Text from '../Text';
import { Button } from '../Button/Button';
import { usePrivy, useSolanaWallets } from '@privy-io/react-auth';
import { Connection, PublicKey } from '@solana/web3.js';
import GovernanceService from '../../services/governanceService';
import { getCorrectWalletAddress } from '@/utils/walletUtils';
import { toast } from 'react-toastify';

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

  const RPC_URL = import.meta.env.VITE_RPC_URL;
  const connection = new Connection(RPC_URL);
  const governanceService = new GovernanceService(RPC_URL);

  // Get Solana wallet from Privy using the correct wallet selection logic
  const getSolanaWallet = () => {
    const correctWalletAddress = getCorrectWalletAddress(user, wallets);
    if (correctWalletAddress) {
      const correctWallet = wallets.find(w => w.address === correctWalletAddress);
      if (correctWallet) {
        console.log("Using correct wallet:", correctWallet.address, correctWallet.walletClientType);
        return correctWallet;
      }
    }
    return null;
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
      if (!authenticated) return;

      // Get the correct wallet address
      const correctWalletAddress = getCorrectWalletAddress(user, wallets);
      if (!correctWalletAddress) return;

      try {
        const userPubkey = new PublicKey(correctWalletAddress);
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
  }, [authenticated, user, wallets, dao.address, proposal.address, dao.communityMint]);

  // Don't render if voting is not open
  if (!isVotingOpen) {
    return null;
  }

  const handleVote = async (voteType: 'approve' | 'deny') => {
    if (!authenticated) {
      toast.error("Please connect your wallet first");
      return;
    }

    // Get the correct wallet
    const solanaWallet = getSolanaWallet();
    if (!solanaWallet) {
      toast.error("No Solana wallet found");
      return;
    }

    setIsVoting(true);
    try {
      const userPubkey = new PublicKey(solanaWallet.address);
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
      
      // Sign transaction using Privy (wallet already obtained above)
      const signedTransaction = await solanaWallet.signTransaction(transaction);
      
      // Send transaction
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      console.log("Vote transaction sent, waiting for confirmation...");
      
      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');
      
      console.log(`Vote ${voteType} successful! Signature:`, signature);
      toast.success(`Successfully voted ${voteType}! Signature: ${signature.slice(0, 8)}...${signature.slice(-8)}`);
      
      // Update local state
      setHasVoted(true);
      setUserVote(voteType);

    } catch (error) {
      console.error("Error casting vote:", error);
      toast.error(`Failed to cast vote: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsVoting(false);
    }
  };

  const handleRelinquishVote = async () => {
    if (!authenticated) {
      toast.error("Please connect your wallet first");
      return;
    }

    // Get the correct wallet
    const solanaWallet = getSolanaWallet();
    if (!solanaWallet) {
      toast.error("No Solana wallet found");
      return;
    }

    setIsVoting(true);
    try {
      const userPubkey = new PublicKey(solanaWallet.address);
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
      
      // Sign transaction using Privy (wallet already obtained above)
      const signedTransaction = await solanaWallet.signTransaction(transaction);
      
      // Send transaction
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      console.log("Relinquish vote transaction sent, waiting for confirmation...");
      
      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');
      
      console.log("Relinquish vote successful! Signature:", signature);
      toast.success(`Successfully changed vote! Signature: ${signature.slice(0, 8)}...${signature.slice(-8)}`);
      
      // Update local state
      setHasVoted(false);
      setUserVote(null);

    } catch (error) {
      console.error("Error relinquishing vote:", error);
      toast.error(`Failed to relinquish vote: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className={`${className}`}>
      {!authenticated ? (
        <div className="text-center py-2 bg-blue-600/20 border border-blue-600/30 rounded">
          <Text text="Connect wallet to vote" as="p" className="text-blue-300 text-xs font-medium" />
        </div>
      ) : hasVoted ? (
        <div className="space-y-2">
          <div className="text-center py-2 bg-gray-800/50 border border-gray-700 rounded">
            <Text text="Your Vote:" as="span" className="text-gray-300 text-xs mr-2" />
            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
              userVote === 'approve' 
                ? 'bg-green-600/30 text-green-300 border border-green-600/50' 
                : 'bg-orange-600/30 text-orange-300 border border-orange-600/50'
            }`}>
              {userVote === 'approve' ? '✓ Yes' : '✗ No'}
            </span>
          </div>
          
          <Button
            onClick={handleRelinquishVote}
            disabled={isVoting}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium text-xs py-2 border border-gray-600"
          >
            {isVoting ? "Processing..." : "Change Vote"}
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => handleVote('approve')}
              disabled={isVoting}
              className="bg-green-600 hover:bg-green-500 text-white font-medium text-xs py-2 border border-green-600/50 shadow-sm"
            >
              {isVoting ? "Voting..." : "Vote Yes"}
            </Button>
            
            <Button
              onClick={() => handleVote('deny')}
              disabled={isVoting}
              className="bg-orange-600 hover:bg-orange-500 text-white font-medium text-xs py-2 border border-orange-600/50 shadow-sm"
            >
              {isVoting ? "Voting..." : "Vote No"}
            </Button>
          </div>
          
          <div className="text-center">
            <Text text="Need governance tokens deposited to vote" as="p" className="text-xs text-gray-400" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProposalVoting; 