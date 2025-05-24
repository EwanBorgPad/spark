import { ScrollRestoration, useNavigate } from "react-router-dom"
import { twMerge } from "tailwind-merge"
import { Button } from "@/components/Button/Button"
import { Input } from "@/components/Input/Input"
import { Icon } from "@/components/Icon/Icon"
import Text from "@/components/Text"
import Img from "@/components/Image/Img"
import { useLoginWithEmail, useSolanaWallets } from '@privy-io/react-auth';
import { useState, startTransition } from 'react';
import { ROUTES } from "@/utils/routes"
import { useQuery } from "@tanstack/react-query"
import { backendSparkApi } from "@/data/api/backendSparkApi"
import { GetUserTokensResponse, UserTokenModel } from "shared/models"


const Profile = () => {
  const navigate = useNavigate();
  const { wallets } = useSolanaWallets();
  const address = wallets[0]?.address
  const [userId, setUserId] = useState('');

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
                  <Text 
                    text={address ? `${address.slice(0, 8)}...${address.slice(-8)}` : "Not connected"} 
                    as="p" 
                    className="text-lg font-medium font-mono"
                  />
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
                  <div className="text-right">
                    <Text 
                      text={userTokens.solBalance.uiAmount.toLocaleString(undefined, { 
                        maximumFractionDigits: 4 
                      })} 
                      as="p" 
                      className="font-medium text-lg"
                    />
                    <Text text="SOL" as="p" className="text-sm opacity-75" />
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
                          text={token.metadata.name || `Token ${token.mint.slice(0, 8)}...`} 
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
                    <div className="text-right">
                      <Text 
                        text={token.uiAmount.toLocaleString(undefined, { 
                          maximumFractionDigits: token.decimals > 6 ? 6 : token.decimals 
                        })} 
                        as="p" 
                        className="font-medium text-lg"
                      />
                      <Text 
                        text={token.metadata.symbol || "TOKEN"} 
                        as="p" 
                        className="text-sm opacity-75"
                      />
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
      <ScrollRestoration />
    </main>
  )
}

export default Profile
