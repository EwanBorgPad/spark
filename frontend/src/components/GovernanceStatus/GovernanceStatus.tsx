import React, { useState, useEffect } from 'react';
import { DaoModel } from '../../../shared/models';
import Text from '../Text';
import { Button } from '../Button/Button';
import { usePrivy, useSolanaWallets } from '@privy-io/react-auth';
import { Connection, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import GovernanceService from '../../services/governanceService';
import BN from 'bn.js';

interface GovernanceStatusProps {
  dao: DaoModel;
  className?: string;
  onStatusUpdate?: () => void;
}

const GovernanceStatus: React.FC<GovernanceStatusProps> = ({ dao, className = "", onStatusUpdate }) => {
  const { user, authenticated } = usePrivy();
  const { wallets } = useSolanaWallets();
  const [isDepositing, setIsDepositing] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [depositAmount, setDepositAmount] = useState("1000000000"); // 1 token with 9 decimals
  const [userTokenBalance, setUserTokenBalance] = useState(0);
  const [votingPower, setVotingPower] = useState(0);

  const RPC_URL = import.meta.env.VITE_RPC_URL || "https://haleigh-sa5aoh-fast-mainnet.helius-rpc.com";
  const connection = new Connection(RPC_URL);
  const governanceService = new GovernanceService(RPC_URL);

  // Get Solana wallet from Privy
  const getSolanaWallet = () => {
    return wallets[0]; // Get the first (and typically only) Solana wallet
  };

  // Check user's token balance and voting power
  useEffect(() => {
    const checkUserStatus = async () => {
      if (!authenticated || !user?.wallet?.address) return;

      try {
        const userPubkey = new PublicKey(user.wallet.address);
        const communityMint = new PublicKey(dao.communityMint);

        // Get user's token account balance
        const userTokenAccount = await getAssociatedTokenAddress(
          communityMint,
          userPubkey
        );

        try {
          const tokenAccountInfo = await connection.getTokenAccountBalance(userTokenAccount);
          setUserTokenBalance(tokenAccountInfo.value.uiAmount || 0);
        } catch (error) {
          console.log("User token account doesn't exist yet");
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

      } catch (error) {
        console.error("Error checking user status:", error);
      }
    };

    checkUserStatus();
  }, [authenticated, user, dao.communityMint, dao.address]);

  const handleDepositTokens = async () => {
    if (!authenticated || !user?.wallet?.address) {
      alert("Please connect your wallet first");
      return;
    }

    setIsDepositing(true);
    try {
      const userPubkey = new PublicKey(user.wallet.address);
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
      
      // Get Privy Solana wallet
      const solanaWallet = getSolanaWallet();
      if (!solanaWallet) {
        throw new Error("No Solana wallet found");
      }

      // Sign transaction using Privy
      const signedTransaction = await solanaWallet.signTransaction(transaction);
      
      // Send transaction
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      console.log("Transaction sent, waiting for confirmation...");
      
      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');
      
      console.log("Deposit successful! Signature:", signature);
      alert(`Successfully deposited ${(amount.toNumber() / 1000000000).toFixed(2)} tokens!\nSignature: ${signature.slice(0, 8)}...${signature.slice(-8)}`);
      
      // Refresh user status
      setTimeout(() => {
        if (onStatusUpdate) onStatusUpdate();
        // Force a page refresh to get updated governance data
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error("Error depositing tokens:", error);
      alert("Failed to deposit tokens. This is using a placeholder implementation.");
    } finally {
      setIsDepositing(false);
    }
  };

  const handleWithdrawTokens = async () => {
    if (!authenticated || !user?.wallet?.address) {
      alert("Please connect your wallet first");
      return;
    }

    setIsWithdrawing(true);
    try {
      const userPubkey = new PublicKey(user.wallet.address);
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
      
      // Get Privy Solana wallet
      const solanaWallet = getSolanaWallet();
      if (!solanaWallet) {
        throw new Error("No Solana wallet found");
      }

      // Sign transaction using Privy
      const signedTransaction = await solanaWallet.signTransaction(transaction);
      
      // Send transaction
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      console.log("Transaction sent, waiting for confirmation...");
      
      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');
      
      console.log("Withdraw successful! Signature:", signature);
      alert(`Successfully withdrew all governance tokens!\nSignature: ${signature.slice(0, 8)}...${signature.slice(-8)}`);
      
      // Refresh user status
      setTimeout(() => {
        if (onStatusUpdate) onStatusUpdate();
        // Trigger a re-check of user status
        window.location.reload(); // Simple way to refresh data
      }, 2000);

    } catch (error) {
      console.error("Error withdrawing tokens:", error);
      alert("Failed to withdraw tokens. This is using a placeholder implementation.");
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div className={`p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <span className="text-xl">🗳️</span>
        <Text text="Your Governance Status" as="h2" className="text-lg font-semibold" />
      </div>
      
      {!authenticated ? (
        <div className="text-center py-8 bg-bg-primary/5 rounded-xl">
          <div className="text-4xl mb-3">🔗</div>
          <Text text="Connect Wallet" as="h3" className="text-lg font-medium mb-2" />
          <Text text="Connect your wallet to participate in governance" as="p" className="text-fg-primary text-opacity-75" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Status Overview */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-xl p-4 text-center border border-blue-500/20">
              <div className="text-2xl mb-2">💰</div>
              <Text text="Wallet Balance" as="h3" className="text-xs text-fg-primary text-opacity-60 mb-1 uppercase tracking-wide" />
              <Text text={`${userTokenBalance.toFixed(2)}`} as="p" className="text-xl font-bold text-blue-400" />
              <Text text={dao.name || 'tokens'} as="p" className="text-xs text-fg-primary text-opacity-75" />
            </div>
            <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-xl p-4 text-center border border-green-500/20">
              <div className="text-2xl mb-2">⚡</div>
              <Text text="Voting Power" as="h3" className="text-xs text-fg-primary text-opacity-60 mb-1 uppercase tracking-wide" />
              <Text text={`${votingPower.toFixed(2)}`} as="p" className="text-xl font-bold text-green-400" />
              <Text text="deposited" as="p" className="text-xs text-fg-primary text-opacity-75" />
            </div>
          </div>

          {/* Token Management */}
          <div className="bg-bg-primary/5 rounded-xl p-5 border border-fg-primary/10">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">⚙️</span>
              <Text text="Manage Tokens" as="h3" className="font-medium" />
            </div>
            
            <div className="mb-4">
              <Text text="Deposit Amount" as="p" className="block text-sm text-fg-primary text-opacity-75 mb-2" />
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={(parseInt(depositAmount) / 1000000000).toString()}
                  onChange={(e) => setDepositAmount((parseFloat(e.target.value) * 1000000000).toString())}
                  className="flex-1 px-4 py-3 bg-bg-primary border border-fg-primary/20 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  placeholder="1.0"
                  min="0"
                  step="0.1"
                />
                <div className="px-3 py-3 bg-bg-primary/50 border border-fg-primary/10 rounded-lg">
                  <Text text="tokens" as="span" className="text-sm text-fg-primary text-opacity-75" />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleDepositTokens}
                disabled={isDepositing || parseFloat(depositAmount) <= 0 || userTokenBalance === 0}
                className="flex-1 bg-brand-primary hover:bg-brand-primary/90"
              >
                {isDepositing ? "Depositing..." : "🔒 Deposit"}
              </Button>
              
              <Button
                onClick={handleWithdrawTokens}
                disabled={isWithdrawing || votingPower === 0}
                className="flex-1 bg-gray-600 hover:bg-gray-700"
              >
                {isWithdrawing ? "Withdrawing..." : "🔓 Withdraw"}
              </Button>
            </div>

            {userTokenBalance === 0 && (
              <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="text-amber-400 text-lg">⚠️</span>
                  <div>
                    <Text text="No Tokens Available" as="p" className="text-sm font-medium text-amber-400 mb-1" />
                    <Text text="You need tokens in your wallet to deposit into governance" as="p" className="text-xs text-fg-primary text-opacity-75" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GovernanceStatus; 