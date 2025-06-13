import React, { useState, useEffect } from 'react';
import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import { usePrivy, useSolanaWallets } from '@privy-io/react-auth';
import { Connection } from '@solana/web3.js';
import { TokenListProvider, TokenInfo } from '@solana/spl-token-registry';
import Text from '../Text';
import { Button } from '../Button/Button';
import { getCorrectWalletAddress } from '@/utils/walletUtils';

interface JupiterSwapProps {
  inputMint?: string; // The token they want to sell (optional, defaults to SOL)
  outputMint: string; // The token they want to buy
  className?: string;
  solPriceUSD?: number; // SOL price in USD for value calculations
  userTokenBalance?: number; // User's token balance for the input token
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

const JupiterSwap: React.FC<JupiterSwapProps> = ({ inputMint = 'So11111111111111111111111111111111111111112', outputMint, className = "", solPriceUSD, userTokenBalance }) => {
  const { user, authenticated } = usePrivy();
  const { wallets } = useSolanaWallets();
  const [inputAmount, setInputAmount] = useState('');
  const [outputAmount, setOutputAmount] = useState('');
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [tokenMap, setTokenMap] = useState<Map<string, TokenInfo>>(new Map());
  const [solBalance, setSolBalance] = useState<number>(0);

  const connection = new Connection(import.meta.env.VITE_RPC_URL || 'https://haleigh-sa5aoh-fast-mainnet.helius-rpc.com');

  const getSolanaWallet = () => {
    console.log("Available wallets:", wallets.map(w => ({
      address: w.address,
      walletClientType: w.walletClientType,
      connectedAt: w.connectedAt
    })));

    // Use the same wallet selection logic as Profile page
    const correctWalletAddress = getCorrectWalletAddress(user, wallets);
    
    if (correctWalletAddress) {
      const correctWallet = wallets.find(w => w.address === correctWalletAddress);
      if (correctWallet) {
        console.log("Using correct wallet:", correctWallet.address, correctWallet.walletClientType);
        return correctWallet;
      }
    }

    // Fallback: Find any connected wallet (but avoid Solflare unless it's the only option)
    const connectedWallet = wallets.find(wallet => 
      wallet.connectedAt && wallet.walletClientType !== 'solflare'
    );
    
    if (connectedWallet) {
      console.log("Using connected wallet:", connectedWallet.address, connectedWallet.walletClientType);
      return connectedWallet;
    }

    // Last resort: use any wallet
    const fallbackWallet = wallets[0];
    console.log("Using fallback wallet:", fallbackWallet?.address, fallbackWallet?.walletClientType);
    return fallbackWallet;
  };

  // Fetch SOL balance
  const fetchSolBalance = async () => {
    if (!authenticated || !user?.wallet?.address) {
      console.log("Cannot fetch SOL balance - not authenticated or no wallet address");
      return;
    }

    try {
      const wallet = getSolanaWallet();
      const walletAddress = user?.wallet?.address || wallet?.address;
      console.log("Fetching SOL balance for address:", walletAddress);
      
      if (!walletAddress) {
        console.log("No wallet address found");
        return;
      }

      const publicKey = new PublicKey(walletAddress);
      const balance = await connection.getBalance(publicKey);
      const solBalance = balance / 1000000000; // Convert lamports to SOL
      console.log("SOL balance fetched:", solBalance, "SOL");
      setSolBalance(solBalance);
    } catch (error) {
      console.error('Error fetching SOL balance:', error);
      setSolBalance(0);
    }
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

  // Fetch SOL balance when authenticated
  useEffect(() => {
    if (authenticated) {
      fetchSolBalance();
    }
  }, [authenticated, user, connection]);

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

  // Handle Max button click
  const handleMaxClick = () => {
    const isSellingToken = inputMint !== 'So11111111111111111111111111111111111111112';
    
    console.log("Max button clicked:", {
      isSellingToken,
      userTokenBalance,
      solBalance,
      inputMint,
      outputMint
    });
    
    if (isSellingToken && userTokenBalance) {
      // When selling tokens, use the token balance
      console.log("Using token balance:", userTokenBalance);
      setInputAmount(userTokenBalance.toString());
      if (userTokenBalance > 0) {
        getQuote(inputMint, outputMint, userTokenBalance.toString());
      }
      } else {
    // When buying tokens (paying with SOL), use SOL balance minus small fee buffer
    const feeBuffer = Math.min(0.001, solBalance * 0.1); // Use 0.001 SOL or 10% of balance, whichever is smaller
    const maxSol = Math.max(0, solBalance - feeBuffer);
    console.log("Using SOL balance:", solBalance, "Fee buffer:", feeBuffer, "Max SOL:", maxSol);
    if (maxSol > 0) {
      setInputAmount(maxSol.toFixed(6)); // Use fixed decimal to avoid scientific notation
      getQuote(inputMint, outputMint, maxSol.toString());
    } else {
      console.log("No SOL balance available after fee buffer");
    }
  }
  };

  // Execute swap
  const executeSwap = async () => {
    if (!quote || !authenticated) {
      alert('Please connect your wallet and get a quote first');
      return;
    }

    setIsSwapping(true);
    try {
      const wallet = getSolanaWallet();
      if (!wallet) {
        throw new Error('No Solana wallet found');
      }

      // Get the correct wallet address - use consistent logic
      const walletAddress = getCorrectWalletAddress(user, wallets) || wallet.address;
      
      if (!walletAddress) {
        throw new Error('No wallet address found');
      }

      console.log('Using wallet address:', walletAddress);
      console.log('Using wallet type:', wallet.walletClientType);

      // Get swap transaction from Jupiter
      const response = await fetch('https://quote-api.jup.ag/v6/swap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quoteResponse: quote,
          userPublicKey: walletAddress,
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
  const inputToken = tokenMap.get(inputMint);
  const isSellingToken = inputMint !== 'So11111111111111111111111111111111111111112';

  // Calculate USD value of tokens based on SOL equivalent
  const getTokenUSDValue = (tokenAmount: string, isOutput: boolean) => {
    if (!solPriceUSD || !quote) return null;
    
    try {
      const amount = parseFloat(tokenAmount);
      if (isNaN(amount)) return null;
      
      if (isOutput) {
        // For output tokens, calculate based on input SOL amount
        const inputSolAmount = parseFloat(inputAmount);
        if (isNaN(inputSolAmount)) return null;
        
        if (outputMint === 'So11111111111111111111111111111111111111112') {
          // Output is SOL
          return amount * solPriceUSD;
        } else {
          // Output is tokens, calculate based on SOL input value
          return inputSolAmount * solPriceUSD;
        }
      } else {
        // For input tokens
        if (inputMint === 'So11111111111111111111111111111111111111112') {
          // Input is SOL
          return amount * solPriceUSD;
        } else {
          // Input is tokens, calculate based on SOL output value
          const outputSolAmount = parseFloat(outputAmount);
          if (isNaN(outputSolAmount)) return null;
          return outputSolAmount * solPriceUSD;
        }
      }
    } catch (error) {
      return null;
    }
  };

  return (
    <div className={`bg-bg-secondary rounded-lg p-6 border border-fg-primary/10 ${className}`}>
      <Text text={isSellingToken ? "Sell Tokens" : "Buy Tokens"} as="h2" className="text-xl font-semibold mb-4" />
      
      {!authenticated ? (
        <div className="text-center py-6">
          <Text text="Connect your wallet to swap tokens" as="p" className="text-fg-primary text-opacity-75" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Input Amount */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm text-fg-primary text-opacity-75 font-medium">
                {isSellingToken ? "Sell" : "Pay with"} {inputToken?.symbol || (inputMint === 'So11111111111111111111111111111111111111112' ? 'SOL' : 'TOKEN')}
              </label>
              <div className="text-xs text-fg-primary text-opacity-60">
                Balance: {isSellingToken ? 
                  (userTokenBalance?.toFixed(4) || "0") : 
                  solBalance.toFixed(4)
                } {inputToken?.symbol || (inputMint === 'So11111111111111111111111111111111111111112' ? 'SOL' : 'TOKEN')}
              </div>
            </div>
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
              <button
                onClick={handleMaxClick}
                className="px-3 py-2 bg-brand-primary/20 hover:bg-brand-primary/30 text-brand-primary border border-brand-primary/30 rounded-md text-sm font-medium transition-colors"
              >
                Max
              </button>
              <div className="flex items-center gap-2 px-3 py-2 bg-bg-primary/50 border border-fg-primary/10 rounded-md">
                <Text text={inputToken?.symbol || (inputMint === 'So11111111111111111111111111111111111111112' ? 'SOL' : 'TOKEN')} as="span" className="text-sm font-medium text-fg-primary" />
              </div>
            </div>
            {/* USD Value for input */}
            {inputAmount && (
              <div className="text-xs text-fg-primary text-opacity-60 mt-1">
                {(() => {
                  const usdValue = getTokenUSDValue(inputAmount, false);
                  if (usdValue) {
                    return `≈ $${usdValue.toFixed(2)} USD`;
                  } else if (inputMint !== 'So11111111111111111111111111111111111111112') {
                    return `${parseFloat(inputAmount).toLocaleString()} tokens`;
                  } else {
                    return `${parseFloat(inputAmount).toFixed(6)} SOL`;
                  }
                })()}
              </div>
            )}
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
                <Text text={outputToken?.symbol || (outputMint === 'So11111111111111111111111111111111111111112' ? 'SOL' : 'TOKEN')} as="span" className="text-sm font-medium text-fg-primary" />
              </div>
            </div>
            {/* USD Value for output */}
            {outputAmount && (
              <div className="text-xs text-fg-primary text-opacity-60 mt-1">
                {(() => {
                  const usdValue = getTokenUSDValue(outputAmount, true);
                  if (usdValue) {
                    return `≈ $${usdValue.toFixed(2)} USD`;
                  } else if (outputMint !== 'So11111111111111111111111111111111111111112') {
                    return `${parseFloat(outputAmount).toLocaleString()} tokens`;
                  } else {
                    return `${parseFloat(outputAmount).toFixed(6)} SOL`;
                  }
                })()}
              </div>
            )}
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