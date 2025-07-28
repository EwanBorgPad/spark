import React, { useState, useEffect } from 'react';
import { DaoModel } from '../../../shared/models';
import Text from '../Text';
import { Button } from '../Button/Button';
import { usePrivy, useSolanaWallets } from '@privy-io/react-auth';
import { Connection, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import GovernanceService from '../../services/governanceService';
import BN from 'bn.js';
import { getCorrectWalletAddress } from '@/utils/walletUtils';
import { toast } from 'react-toastify';

interface GovernanceStatusProps {
  dao: DaoModel;
  className?: string;
  onStatusUpdate?: () => void;
  onDataUpdate?: (data: { userTokenBalance: number; votingPower: number }) => void;
}

const GovernanceStatus: React.FC<GovernanceStatusProps> = ({ dao, className = "", onStatusUpdate, onDataUpdate }) => {
  const { user, authenticated } = usePrivy();
  const { wallets } = useSolanaWallets();
  const [isDepositing, setIsDepositing] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [depositAmount, setDepositAmount] = useState("1000000000"); // 1 token with 9 decimals
  const [userTokenBalance, setUserTokenBalance] = useState(0);
  const [votingPower, setVotingPower] = useState(0);

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

  // Check user's token balance and voting power
  useEffect(() => {
    const checkUserStatus = async () => {
      if (!authenticated) return;

      // Get the correct wallet address
      const correctWalletAddress = getCorrectWalletAddress(user, wallets);
      if (!correctWalletAddress) return;

      try {
        const userPubkey = new PublicKey(correctWalletAddress);
        const communityMint = new PublicKey(dao.communityMint);

        // Get user's token account balance
        const userTokenAccount = await getAssociatedTokenAddress(
          communityMint,
          userPubkey
        );

        let currentUserTokenBalance = 0;
        try {
          const tokenAccountInfo = await connection.getTokenAccountBalance(userTokenAccount);
          currentUserTokenBalance = tokenAccountInfo.value.uiAmount || 0;
          setUserTokenBalance(currentUserTokenBalance);
        } catch (error) {
          setUserTokenBalance(0);
        }

        // Check voting power from governance
        const realmPubkey = new PublicKey(dao.address);
        const { votingPower: govVotingPower } = await governanceService.getUserTokenOwnerRecord(
          userPubkey,
          realmPubkey,
          communityMint
        );
        setVotingPower(govVotingPower);
        console.log("Voting power:", govVotingPower);

        // Notify parent component of data updates
        if (onDataUpdate) {
          onDataUpdate({
            userTokenBalance: currentUserTokenBalance,
            votingPower: govVotingPower
          });
        }

      } catch (error) {
        console.error("Error checking user status:", error);
        // Still notify parent with zero values
        if (onDataUpdate) {
          onDataUpdate({ userTokenBalance: 0, votingPower: 0 });
        }
      }
    };

    checkUserStatus();
  }, [authenticated, user, dao.communityMint, dao.address, onDataUpdate]);

  const handleDepositTokens = async () => {
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

    setIsDepositing(true);
    try {
      const userPubkey = new PublicKey(solanaWallet.address);
      const communityMint = new PublicKey(dao.communityMint);
      const realmPubkey = new PublicKey(dao.address);
      const amount = new BN(depositAmount);

      // Ensure user has an associated token account for the community mint
      const userTokenAccount = await getAssociatedTokenAddress(
        communityMint,
        userPubkey
      );

      // Check if user has enough tokens
      try {
        const tokenAccountInfo = await connection.getTokenAccountBalance(userTokenAccount);
        const userBalance = tokenAccountInfo.value.uiAmount || 0;
        const requiredAmount = amount.toNumber() / 1000000000;
        
        if (userBalance < requiredAmount) {
          throw new Error(`Insufficient token balance. You have ${userBalance} tokens but need ${requiredAmount}`);
        }
      } catch (error) {
        if (error instanceof Error && error.message.includes('could not find account')) {
          throw new Error("You don't have any tokens to deposit. Please get some tokens first.");
        }
        throw error;
      }

      // Create transaction using governance service
      const transaction = await governanceService.createDepositGovernanceTokensTransaction(
        userPubkey,
        realmPubkey,
        communityMint,
        amount
      );

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = userPubkey;

      console.log("Signing deposit transaction with Privy...");
      
      // Sign transaction using Privy (wallet already obtained above)
      const signedTransaction = await solanaWallet.signTransaction(transaction);
      
      // Send transaction
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      console.log("Transaction sent, waiting for confirmation...");
      
      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');
      
      console.log("Deposit successful! Signature:", signature);
      toast.success(`Successfully deposited ${(amount.toNumber() / 1000000000).toFixed(2)} tokens! Signature: ${signature.slice(0, 8)}...${signature.slice(-8)}`);
      
      // Refresh user status
      setTimeout(() => {
        if (onStatusUpdate) onStatusUpdate();
        // Force a page refresh to get updated governance data
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error("Error depositing tokens:", error);
      toast.error(`Failed to deposit tokens: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDepositing(false);
    }
  };

  const handleWithdrawTokens = async () => {
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

    setIsWithdrawing(true);
    try {
      const userPubkey = new PublicKey(solanaWallet.address);
      const communityMint = new PublicKey(dao.communityMint);
      const realmPubkey = new PublicKey(dao.address);

      // Get user's token account
      const destinationTokenAccount = await getAssociatedTokenAddress(
        communityMint,
        userPubkey
      );

      // Create transaction using governance service
      const transaction = await governanceService.createWithdrawGovernanceTokensTransaction(
        userPubkey,
        realmPubkey,
        communityMint,
        destinationTokenAccount
      );

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = userPubkey;

      console.log("Signing withdraw transaction with Privy...");
      
      // Sign transaction using Privy (wallet already obtained above)
      const signedTransaction = await solanaWallet.signTransaction(transaction);
      
      // Send transaction
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      console.log("Transaction sent, waiting for confirmation...");
      
      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');
      
      console.log("Withdraw successful! Signature:", signature);
      toast.success(`Successfully withdrew all governance tokens! Signature: ${signature.slice(0, 8)}...${signature.slice(-8)}`);
      
      // Refresh user status
      setTimeout(() => {
        if (onStatusUpdate) onStatusUpdate();
        // Trigger a re-check of user status
        window.location.reload(); // Simple way to refresh data
      }, 2000);

    } catch (error) {
      console.error("Error withdrawing tokens:", error);
      toast.error(`Failed to withdraw tokens: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div className={`${className}`}>
      {!authenticated ? (
        <div className="text-center py-4 bg-bg-primary/5 rounded">
          <Text text="Connect wallet to participate in governance" as="p" className="text-fg-primary/60" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Status Overview - Now handled externally */}
          {/* Token Management */}
          <div className="bg-bg-primary/5 rounded p-3 border border-fg-primary/10">
            <Text text="Manage Tokens" as="h3" className="text-sm font-medium mb-3" />
            
            <div className="mb-3">
              <Text text="Deposit Amount" as="p" className="text-xs text-fg-primary/60 mb-1" />
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={(parseInt(depositAmount) / 1000000000).toString()}
                  onChange={(e) => setDepositAmount((parseFloat(e.target.value) * 1000000000).toString())}
                  className="flex-1 px-3 py-2 bg-bg-primary border border-fg-primary/20 rounded text-black text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  placeholder="1.0"
                  min="0"
                  step="0.1"
                />
                <span className="text-xs text-fg-primary/60 px-2">tokens</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleDepositTokens}
                disabled={isDepositing || parseFloat(depositAmount) <= 0 || userTokenBalance === 0}
                className="flex-1 bg-brand-primary/20 hover:bg-brand-primary/30 text-brand-primary border-brand-primary/30 text-sm py-2"
              >
                {isDepositing ? "Depositing..." : "Deposit"}
              </Button>
              
              <Button
                onClick={handleWithdrawTokens}
                disabled={isWithdrawing || votingPower === 0}
                className="flex-1 bg-fg-primary/20 hover:bg-fg-primary/30 text-fg-primary border-fg-primary/30 text-sm py-2"
              >
                {isWithdrawing ? "Withdrawing..." : "Withdraw"}
              </Button>
            </div>

            {userTokenBalance === 0 && (
              <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-center">
                <Text text="You need tokens in your wallet to deposit" as="p" className="text-xs text-fg-primary/60" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GovernanceStatus; 