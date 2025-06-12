import { ScrollRestoration, useNavigate } from "react-router-dom"
import { twMerge } from "tailwind-merge"
import { Button } from "@/components/Button/Button"
import { Input } from "@/components/Input/Input"
import { Icon } from "@/components/Icon/Icon"
import Text from "@/components/Text"
import Img from "@/components/Image/Img"
import { useLoginWithEmail, useSolanaWallets, usePrivy } from '@privy-io/react-auth';
import { useState, startTransition } from 'react';
import { ROUTES } from "@/utils/routes"
import { useQuery } from "@tanstack/react-query"
import { backendSparkApi } from "@/data/api/backendSparkApi"
import { GetUserTokensResponse, UserTokenModel } from "shared/models"
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js"
import { TOKEN_PROGRAM_ID, createTransferInstruction, getAssociatedTokenAddress } from "@solana/spl-token"


const Profile = () => {
  const navigate = useNavigate();
  const { wallets } = useSolanaWallets();
  const { user: privyUser } = usePrivy();
  const address = wallets[0]?.address
  const [userId, setUserId] = useState('');
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<UserTokenModel | null>(null);
  const [sendForm, setSendForm] = useState({
    recipientAddress: '',
    amount: ''
  });
  const [isSending, setIsSending] = useState(false);
  const [txSuccess, setTxSuccess] = useState<string | null>(null);

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['user', address],
    queryFn: () => address ? backendSparkApi.getUser({ address: address }) : Promise.resolve(null),
    enabled: !!address,
  });

  const { data: userTokens, isLoading: tokensLoading, error: tokensError } = useQuery({
    queryKey: ['userTokens', address],
    queryFn: () => backendSparkApi.getUserTokens({ address: address! }),
    enabled: !!address,
  });

  const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUserId = e.target.value;
    setUserId(newUserId);

    startTransition(() => {
      setUserId(newUserId);
    });
  };

  const copyAddressToClipboard = async () => {
    if (!address) return;

    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  const openSendModal = (token: UserTokenModel) => {
    setSelectedToken(token);
    setSendModalOpen(true);
    setSendForm({ recipientAddress: '', amount: '' });
  };

  const openSOLSendModal = () => {
    if (!userTokens) return;
    setSelectedToken(userTokens.solBalance);
    setSendModalOpen(true);
    setSendForm({ recipientAddress: '', amount: '' });
  };

  const closeSendModal = () => {
    setSendModalOpen(false);
    setSelectedToken(null);
    setSendForm({ recipientAddress: '', amount: '' });
    setIsSending(false);
    setTxSuccess(null);
  };

  const handleSendFormChange = (field: 'recipientAddress' | 'amount', value: string) => {
    setSendForm(prev => ({ ...prev, [field]: value }));
  };

    const handleSendToken = async () => {
    if (!selectedToken || !address || !sendForm.recipientAddress || !sendForm.amount || !wallets[0]) {
      alert('Please fill in all fields and ensure wallet is connected');
      return;
    }

    setIsSending(true);
    setTxSuccess(null);

    try {
      // Validate recipient address
      let recipientPubKey: PublicKey;
      try {
        recipientPubKey = new PublicKey(sendForm.recipientAddress);
      } catch (error) {
        alert('Invalid recipient address format');
        setIsSending(false);
        return;
      }

      // Create connection
      const connection = new Connection(
        import.meta.env.VITE_RPC_URL || 'https://api.mainnet-beta.solana.com'
      );

      const senderPubKey = new PublicKey(address);
      const amount = parseFloat(sendForm.amount);

      let transaction: Transaction;

      // Check if this is SOL or SPL token
      if (selectedToken.mint === "So11111111111111111111111111111111111111112") {
        // SOL Transfer
        const lamports = Math.floor(amount * LAMPORTS_PER_SOL);
        
        transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: senderPubKey,
            toPubkey: recipientPubKey,
            lamports,
          })
        );
      } else {
        // SPL Token Transfer
        const mintPubKey = new PublicKey(selectedToken.mint);
        
        // Get token accounts
        const fromTokenAccount = await getAssociatedTokenAddress(
          mintPubKey,
          senderPubKey
        );
        
        const toTokenAccount = await getAssociatedTokenAddress(
          mintPubKey,
          recipientPubKey
        );

        // Check if recipient token account exists
        const toAccountInfo = await connection.getAccountInfo(toTokenAccount);
        
        transaction = new Transaction();

        // If recipient doesn't have token account, we'll need to create it
        if (!toAccountInfo) {
          const { createAssociatedTokenAccountInstruction } = await import("@solana/spl-token");
          transaction.add(
            createAssociatedTokenAccountInstruction(
              senderPubKey, // payer
              toTokenAccount,
              recipientPubKey, // owner
              mintPubKey
            )
          );
        }

        // Add transfer instruction
        const transferAmount = Math.floor(amount * Math.pow(10, selectedToken.decimals));
        transaction.add(
          createTransferInstruction(
            fromTokenAccount,
            toTokenAccount,
            senderPubKey,
            transferAmount
          )
        );
      }

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = senderPubKey;

      // Sign and send transaction using Privy wallet
      const signedTransaction = await wallets[0].signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      
      // Confirm transaction
      await connection.confirmTransaction(signature);
      
      setTxSuccess(signature);
      alert(`Transaction successful! Signature: ${signature}`);
      
      // Refresh user tokens
      setTimeout(() => {
        window.location.reload(); // Simple refresh to update balances
      }, 2000);

    } catch (error) {
      console.error('Failed to send token:', error);
      alert(`Failed to send token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSending(false);
    }
  };

  console.log("user", user)
  console.log("userTokens", userTokens)

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Text text="Loading profile..." as="p" className="text-lg" />
      </div>
    );
  }

  return (
    <main className="relative z-[10] flex min-h-screen w-full max-w-[100vw] flex-col bg-accent font-normal text-fg-primary">
      {/* Header with back button */}
      <div className="absolute left-4 top-4 z-50">
        <Button
          onClick={() => navigate(ROUTES.PROJECTS)}
          size="lg"
          className="bg-brand-primary hover:bg-brand-primary/80"
        >
          <Icon icon="SvgArrowLeft" className="text-xl text-fg-primary" />
        </Button>
      </div>

      {/* Main content */}
      <div className="flex-1 px-4 py-20 md:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Profile Header */}
          <div className="text-center mb-12">
            <Text
              text="Profile"
              as="h1"
              className="text-[40px] font-medium leading-[48px] tracking-[-0.4px] md:text-[68px] md:leading-[74px] mb-4 text-brand-primary"
            />
            <Text
              text="Your Account & Token Portfolio"
              as="h2"
              className="text-xl md:text-2xl opacity-75"
            />
          </div>

          {/* Account Information Card */}
          <div className="bg-bg-secondary rounded-xl p-6 mb-8 border border-border-primary/20">
            <Text text="Account Information" as="h3" className="text-xl font-semibold mb-6" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-brand-primary/20 flex items-center justify-center">
                  <Icon icon="SvgTwoAvatars" className="text-brand-primary text-xl" />
                </div>
                <div>
                  <Text text="Username" as="span" className="text-sm font-medium opacity-75" />
                  <Text text={user?.username || "Not set"} as="p" className="text-lg font-medium" />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-brand-primary/20 flex items-center justify-center">
                  <Icon icon="SvgWalletFilled" className="text-brand-primary text-xl" />
                </div>
                <div className="flex-1 min-w-0">
                  <Text text="Wallet Address" as="span" className="text-sm font-medium opacity-75" />
                  <div
                    onClick={copyAddressToClipboard}
                    className="cursor-pointer hover:bg-bg-primary rounded px-2 py-1 -mx-2 -my-1 transition-colors"
                    title="Click to copy address"
                  >
                    <Text
                      text={address ? `${address.slice(0, 4)}...${address.slice(-4)}` : "Not connected"}
                      as="p"
                      className="text-lg font-medium font-mono"
                    />
                    {copiedAddress && (
                      <Text text="Copied!" as="span" className="text-sm text-green-400 mt-1" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Token Portfolio */}
          <div className="bg-bg-secondary rounded-xl p-6 border border-border-primary/20">
            <div className="flex items-center justify-between mb-6">
              <Text text="Token Portfolio" as="h3" className="text-xl font-semibold" />
              {userTokens && (
                <Text
                  text={`${userTokens.tokenCount + 1} tokens`}
                  as="span"
                  className="text-sm opacity-75"
                />
              )}
            </div>

            {tokensLoading && (
              <div className="text-center py-12">
                <Text text="Loading tokens..." as="p" className="text-lg opacity-75" />
              </div>
            )}

            {tokensError && (
              <div className="text-center py-12">
                <Text text="Failed to load tokens" as="p" className="text-lg text-red-400" />
              </div>
            )}

            {userTokens && (
              <div className="space-y-3">
                {/* SOL Balance */}
                <div className="flex items-center justify-between p-4 bg-bg-primary rounded-lg border border-border-primary/10">
                  <div className="flex items-center gap-4">
                    <Img
                      src={userTokens.solBalance.metadata.image}
                      imgClassName="w-12 h-12 rounded-full"
                      isRounded={true}
                    />
                    <div>
                      <Text
                        text={userTokens.solBalance.metadata.name || "Solana"}
                        as="p"
                        className="font-medium"
                      />
                      <Text
                        text={userTokens.solBalance.metadata.symbol || "SOL"}
                        as="p"
                        className="text-sm opacity-75"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <Text
                        text={userTokens.solBalance.uiAmount.toLocaleString(undefined, {
                          maximumFractionDigits: 4
                        })}
                        as="p"
                        className="font-medium text-lg"
                      />
                      {/* <Text text="SOL" as="p" className="text-sm opacity-75" /> */}
                    </div>
                    <Button
                      onClick={openSOLSendModal}
                      size="sm"
                      className="bg-brand-primary/20 hover:bg-brand-primary/30 text-brand-primary border-brand-primary/30"
                    >
                      Send
                    </Button>
                  </div>
                </div>

                {/* Other Tokens */}
                {userTokens.tokens.map((token: UserTokenModel) => (
                  <div
                    key={token.mint}
                    className="flex items-center justify-between p-4 bg-bg-primary rounded-lg border border-border-primary/10"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-primary/20 to-brand-primary/10 flex items-center justify-center">
                        <Text
                          text={token.metadata.symbol?.slice(0, 2) || token.mint.slice(0, 2)}
                          as="span"
                          className="font-bold text-brand-primary"
                        />
                      </div>
                      <div>
                        <Text
                          text={token.metadata.name?.slice(0, 10) || `Token ${token.mint.slice(0, 4)}...`}
                          as="p"
                          className="font-medium"
                        />
                        <Text
                          text={token.metadata.symbol || token.mint.slice(0, 4).toUpperCase()}
                          as="p"
                          className="text-sm opacity-75"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <Text
                          text={token.uiAmount.toLocaleString(undefined, {
                            maximumFractionDigits: token.decimals > 4 ? 4 : token.decimals
                          })}
                          as="p"
                          className="font-medium text-lg"
                        />
                        {/* <Text
                          text={token.metadata.symbol || "TOKEN"}
                          as="p"
                          className="text-sm opacity-75"
                        /> */}
                      </div>
                      <Button
                        onClick={() => openSendModal(token)}
                        size="sm"
                        className="bg-brand-primary/20 hover:bg-brand-primary/30 text-brand-primary border-brand-primary/30"
                      >
                        Send
                      </Button>
                    </div>
                  </div>
                ))}

                {userTokens.tokens.length === 0 && (
                  <div className="text-center py-12">
                    <Text text="No tokens found in this wallet" as="p" className="text-lg opacity-75" />
                    <Text text="Only SOL balance is available" as="p" className="text-sm opacity-50 mt-2" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Send Token Modal */}
      {sendModalOpen && selectedToken && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-bg-secondary rounded-xl p-6 w-full max-w-md border border-border-primary/20 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <Text
                text={`Send ${selectedToken.metadata.symbol || selectedToken.metadata.name || 'Token'}`}
                as="h3"
                className="text-xl font-semibold"
              />
              <Button
                onClick={closeSendModal}
                size="sm"
                className="bg-transparent hover:bg-bg-primary text-fg-primary"
              >
                <Icon icon="SvgClose" className="text-lg" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Token Info */}
              <div className="flex items-center gap-3 p-3 bg-bg-primary rounded-lg">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary/20 to-brand-primary/10 flex items-center justify-center">
                  <Text
                    text={selectedToken.metadata.symbol?.slice(0, 2) || selectedToken.mint.slice(0, 2)}
                    as="span"
                    className="font-bold text-brand-primary"
                  />
                </div>
                <div>
                  <Text
                    text={selectedToken.metadata.name || `Token ${selectedToken.mint.slice(0, 8)}...`}
                    as="p"
                    className="font-medium"
                  />
                  <Text
                    text={`Balance: ${selectedToken.uiAmount.toLocaleString(undefined, {
                      maximumFractionDigits: selectedToken.decimals > 6 ? 6 : selectedToken.decimals
                    })}`}
                    as="p"
                    className="text-sm opacity-75"
                  />
                </div>
              </div>

              {/* Recipient Address */}
              <div>
                <Text text="Recipient Address" as="span" className="block text-sm font-medium mb-2" />
                <Input
                  value={sendForm.recipientAddress}
                  onChange={(e) => handleSendFormChange('recipientAddress', e.target.value)}
                  placeholder="Enter Solana wallet address..."
                  className="w-full"
                />
              </div>

              {/* Amount */}
              <div>
                <Text text="Amount" as="span" className="block text-sm font-medium mb-2" />
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={sendForm.amount}
                    onChange={(e) => handleSendFormChange('amount', e.target.value)}
                    placeholder="0.00"
                    className="flex-1"
                    step="any"
                    min="0"
                    max={selectedToken.uiAmount.toString()}
                  />
                  <Button
                    onClick={() => handleSendFormChange('amount', selectedToken.uiAmount.toString())}
                    size="sm"
                    className="bg-bg-primary hover:bg-brand-primary/20 text-fg-primary"
                  >
                    Max
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={closeSendModal}
                  size="lg"
                  className="flex-1 bg-bg-primary hover:bg-border-primary/20 text-fg-primary"
                >
                  Cancel
                </Button>
                                 <Button
                   onClick={handleSendToken}
                   size="lg"
                   className="flex-1 bg-brand-primary hover:bg-brand-primary/80 text-fg-primary disabled:opacity-50"
                   disabled={!sendForm.recipientAddress || !sendForm.amount || parseFloat(sendForm.amount) <= 0 || isSending}
                 >
                   {isSending ? 'Sending...' : 'Send Token'}
                 </Button>
              </div>

                             {txSuccess && (
                 <div className="text-center pt-2">
                   <Text 
                     text={`✅ Transaction successful! Signature: ${txSuccess.slice(0, 8)}...`} 
                     as="p" 
                     className="text-xs opacity-75 text-green-400"
                   />
                 </div>
               )}
               
               {isSending && (
                 <div className="text-center pt-2">
                   <Text 
                     text="🔄 Processing transaction..." 
                     as="p" 
                     className="text-xs opacity-75 text-blue-400"
                   />
                 </div>
               )}
            </div>
          </div>
        </div>
      )}

      <ScrollRestoration />
    </main>
  )
}

export default Profile
