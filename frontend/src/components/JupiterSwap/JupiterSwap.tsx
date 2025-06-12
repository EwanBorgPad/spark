import React, { useState, useEffect } from 'react';
import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import { usePrivy, useSolanaWallets } from '@privy-io/react-auth';
import { Connection } from '@solana/web3.js';
import { TokenListProvider, TokenInfo } from '@solana/spl-token-registry';
import Text from '../Text';
import { Button } from '../Button/Button';

interface JupiterSwapProps {
  outputMint: string; // The token they want to buy
  className?: string;
}

interface SwapQuote {
  inputMint: string;
  inAmount: string;
  outputMint: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  platformFee: null;
  priceImpactPct: string;
  routePlan: unknown[];
}

const JupiterSwap: React.FC<JupiterSwapProps> = ({ outputMint, className = "" }) => {
  const { user, authenticated } = usePrivy();
  const { wallets } = useSolanaWallets();
  const inputMint = 'So11111111111111111111111111111111111111112'; // SOL - locked
  const [inputAmount, setInputAmount] = useState('');
  const [outputAmount, setOutputAmount] = useState('');
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [tokenMap, setTokenMap] = useState<Map<string, TokenInfo>>(new Map());

  const connection = new Connection(import.meta.env.VITE_RPC_URL || 'https://api.mainnet-beta.solana.com');

  const getSolanaWallet = () => {
    return wallets[0];
  };

  // Load token list
  useEffect(() => {
    const loadTokens = async () => {
      try {
        const tokens = await new TokenListProvider().resolve();
        const tokenList = tokens.filterByChainId(101).getList(); // Mainnet
        
        const map = new Map();
        tokenList.forEach((token) => {
          map.set(token.address, token);
        });
        setTokenMap(map);
      } catch (error) {
        console.error('Error loading tokens:', error);
      }
    };

    loadTokens();
  }, []);

  // Get quote from Jupiter
  const getQuote = async (inputMint: string, outputMint: string, amount: string) => {
    if (!amount || parseFloat(amount) <= 0) return;

    setIsLoading(true);
    try {
      const inputToken = tokenMap.get(inputMint);
      const decimals = inputToken?.decimals || 9;
      const inputAmountInSmallestUnit = Math.floor(parseFloat(amount) * Math.pow(10, decimals));

      const response = await fetch(
        `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${inputAmountInSmallestUnit}&slippageBps=50`
      );
      
      if (!response.ok) {
        throw new Error('Failed to get quote');
      }

      const quoteData = await response.json();
      setQuote(quoteData);

      // Calculate output amount for display
      const outputToken = tokenMap.get(outputMint);
      const outputDecimals = outputToken?.decimals || 9;
      const outputAmountFormatted = (parseInt(quoteData.outAmount) / Math.pow(10, outputDecimals)).toFixed(6);
      setOutputAmount(outputAmountFormatted);
    } catch (error) {
      console.error('Error getting quote:', error);
      setQuote(null);
      setOutputAmount('');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input amount change
  const handleInputAmountChange = (value: string) => {
    setInputAmount(value);
    if (value && parseFloat(value) > 0) {
      getQuote(inputMint, outputMint, value);
    } else {
      setQuote(null);
      setOutputAmount('');
    }
  };

  // Execute swap
  const executeSwap = async () => {
    if (!quote || !authenticated || !user?.wallet?.address) {
      alert('Please connect your wallet and get a quote first');
      return;
    }

    setIsSwapping(true);
    try {
      const wallet = getSolanaWallet();
      if (!wallet) {
        throw new Error('No Solana wallet found');
      }

      // Get swap transaction from Jupiter
      const response = await fetch('https://quote-api.jup.ag/v6/swap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quoteResponse: quote,
          userPublicKey: user.wallet.address,
          wrapAndUnwrapSol: true,
          dynamicComputeUnitLimit: true,
          prioritizationFeeLamports: 'auto'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get swap transaction');
      }

      const { swapTransaction } = await response.json();

      // Deserialize and sign transaction
      const transactionBuf = Buffer.from(swapTransaction, 'base64');
      const transaction = VersionedTransaction.deserialize(transactionBuf);

      // Sign with Privy
      const signedTransaction = await wallet.signTransaction(transaction);

      // Send transaction
      const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
        skipPreflight: false,
        maxRetries: 3,
      });

      console.log('Swap transaction sent:', signature);

      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');

      alert(`Swap successful! You received approximately ${outputAmount} tokens.\nSignature: ${signature.slice(0, 8)}...${signature.slice(-8)}`);

      // Reset form
      setInputAmount('');
      setOutputAmount('');
      setQuote(null);

    } catch (error) {
      console.error('Error executing swap:', error);
      alert('Swap failed. Please try again.');
    } finally {
      setIsSwapping(false);
    }
  };

  const outputToken = tokenMap.get(outputMint);

  return (
    <div className={`bg-bg-secondary rounded-lg p-6 border border-fg-primary/10 ${className}`}>
      <Text text="Buy Tokens" as="h2" className="text-xl font-semibold mb-4" />
      
      {!authenticated ? (
        <div className="text-center py-6">
          <Text text="Connect your wallet to swap tokens" as="p" className="text-fg-primary text-opacity-75" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* SOL Amount Input */}
          <div>
            <label className="block text-sm text-fg-primary text-opacity-75 mb-2">
              Pay with SOL
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={inputAmount}
                onChange={(e) => handleInputAmountChange(e.target.value)}
                className="flex-1 px-3 py-2 bg-bg-primary border border-fg-primary/20 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1.0"
                min="0"
                step="0.1"
              />
              <div className="flex items-center gap-2 px-3 py-2 bg-bg-primary/50 border border-fg-primary/10 rounded-md">
                <Text text="SOL" as="span" className="text-sm font-medium text-fg-primary" />
              </div>
            </div>
          </div>

          {/* Arrow indicator */}
          <div className="flex justify-center">
            <div className="text-fg-primary text-opacity-50">↓</div>
          </div>

          {/* Output Display */}
          <div>
            <label className="block text-sm text-fg-primary text-opacity-75 mb-2">
              You&apos;ll receive (estimated)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={outputAmount}
                readOnly
                className="flex-1 px-3 py-2 bg-bg-primary/50 border border-fg-primary/10 rounded-md text-black"
                placeholder="0.0"
              />
              <div className="flex items-center gap-2 px-3 py-2 bg-bg-primary/50 border border-fg-primary/10 rounded-md">
                <Text text={outputToken?.symbol || 'TOKEN'} as="span" className="text-sm font-medium text-fg-primary" />
              </div>
            </div>
          </div>

          {/* Quote Info */}
          {quote && (
            <div className="bg-bg-primary/5 rounded-lg p-3 text-sm">
              <div className="flex justify-between">
                <Text text="Price Impact:" as="span" className="text-fg-primary text-opacity-75" />
                <Text text={`${parseFloat(quote.priceImpactPct).toFixed(2)}%`} as="span" className="text-fg-primary" />
              </div>
              <div className="flex justify-between">
                <Text text="Slippage:" as="span" className="text-fg-primary text-opacity-75" />
                <Text text="0.5%" as="span" className="text-fg-primary" />
              </div>
            </div>
          )}

          {/* Swap Button */}
          <Button
            onClick={executeSwap}
            disabled={!quote || isLoading || isSwapping || !inputAmount}
            className="w-full"
          >
            {isSwapping ? "Swapping..." : isLoading ? "Getting Quote..." : "Swap Tokens"}
          </Button>

          {/* Disclaimer */}
          <div className="text-xs text-fg-primary text-opacity-60 text-center">
            <Text text="Powered by Jupiter. Prices are estimates and may change." as="p" />
          </div>
        </div>
      )}
    </div>
  );
};

export default JupiterSwap; 