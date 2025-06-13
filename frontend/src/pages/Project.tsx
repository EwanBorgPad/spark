import { useState, useEffect } from "react"
import { ScrollRestoration, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useParams } from "react-router-dom"
import { useProjectDataContext } from "@/hooks/useProjectData"
import backdropImg from "@/assets/backdropImgMin.png"
import Img from "@/components/Image/Img"
import Text from "@/components/Text"
import { Icon } from "@/components/Icon/Icon"
import { twMerge } from "tailwind-merge"
import { Button } from "@/components/Button/Button"
import { backendSparkApi } from "@/data/api/backendSparkApi"
import { useQuery } from "@tanstack/react-query"
import { GetTokenResponse, DaoModel, GetTokenMarketResponse } from "shared/models"
import TokenChart from "@/components/TokenChart/TokenChart"
import TokenStats from "@/components/TokenStats/TokenStats"
import ProposalVoting from "@/components/ProposalVoting/ProposalVoting"
import GovernanceStatus from "@/components/GovernanceStatus/GovernanceStatus"
import JupiterSwap from "@/components/JupiterSwap"
import { usePrivy, useSolanaWallets } from '@privy-io/react-auth'
import { Connection, PublicKey } from '@solana/web3.js'
import { getAssociatedTokenAddress } from '@solana/spl-token'
import { TokenListProvider, TokenInfo } from '@solana/spl-token-registry'
import { ROUTES } from "@/utils/routes"

const Project = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'current' | 'past'>('current')
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false)
  const [userTokenBalance, setUserTokenBalance] = useState(0)
  const [jupiterQuote, setJupiterQuote] = useState<number | null>(null)
  const [tokenMap, setTokenMap] = useState<Map<string, TokenInfo>>(new Map())
  const [solPriceUSD, setSolPriceUSD] = useState<number | null>(null)

  const { user, authenticated } = usePrivy()
  const { wallets } = useSolanaWallets()

  const RPC_URL = import.meta.env.VITE_RPC_URL || "https://api.mainnet-beta.solana.com"
  const connection = new Connection(RPC_URL)
  const inputMint = 'So11111111111111111111111111111111111111112' // SOL

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isSwapModalOpen) {
        setIsSwapModalOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isSwapModalOpen])

  // Load token list
  useEffect(() => {
    const loadTokens = async () => {
      try {
        const tokens = await new TokenListProvider().resolve()
        const tokenList = tokens.filterByChainId(101).getList() // Mainnet

        const map = new Map()
        tokenList.forEach((token) => {
          map.set(token.address, token)
        })
        setTokenMap(map)
      } catch (error) {
        console.error('Error loading tokens:', error)
      }
    }

    loadTokens()
  }, [])

  // Get SOL price in USD
  useEffect(() => {
    const getSolPrice = async () => {
      try {
        const response = await fetch('https://price.jup.ag/v4/price?ids=So11111111111111111111111111111111111111112')
        if (response.ok) {
          const data = await response.json()
          const solPrice = data.data?.['So11111111111111111111111111111111111111112']?.price
          if (solPrice) {
            setSolPriceUSD(solPrice)
          }
        }
      } catch (error) {
        console.error('Error fetching SOL price:', error)
      }
    }

    getSolPrice()
  }, [])

  // Get Jupiter quote for 1 token to SOL
  const getJupiterQuote = async (outputMint: string) => {
    if (!outputMint || tokenMap.size === 0) return

    try {
      const outputToken = tokenMap.get(outputMint)
      const decimals = outputToken?.decimals || 9
      const oneTokenInSmallestUnit = Math.pow(10, decimals) // 1 token

      const response = await fetch(
        `https://quote-api.jup.ag/v6/quote?inputMint=${outputMint}&outputMint=${inputMint}&amount=${oneTokenInSmallestUnit}&slippageBps=50`
      )

      if (!response.ok) {
        throw new Error('Failed to get quote')
      }

      const quoteData = await response.json()

      // Calculate SOL amount for 1 token
      const solDecimals = 9
      const solAmount = parseInt(quoteData.outAmount) / Math.pow(10, solDecimals)
      setJupiterQuote(solAmount)
    } catch (error) {
      console.error('Error getting Jupiter quote:', error)
      setJupiterQuote(null)
    }
  }

  // Fetch Jupiter quote when token map is loaded and we have an ID
  useEffect(() => {
    if (id && tokenMap.size > 0) {
      getJupiterQuote(id)
    }
  }, [id, tokenMap])

  // Check user's token balance
  useEffect(() => {
    const checkUserTokenBalance = async () => {
      if (!authenticated || !user?.wallet?.address || !id) return

      try {
        const userPubkey = new PublicKey(user.wallet.address)
        const tokenMint = new PublicKey(id)

        // Get user's token account balance
        const userTokenAccount = await getAssociatedTokenAddress(
          tokenMint,
          userPubkey
        )

        try {
          const tokenAccountInfo = await connection.getTokenAccountBalance(userTokenAccount)
          setUserTokenBalance(tokenAccountInfo.value.uiAmount || 0)
        } catch (error) {
          console.log("User token account doesn't exist yet")
          setUserTokenBalance(0)
        }

      } catch (error) {
        console.error("Error checking user token balance:", error)
        setUserTokenBalance(0)
      }
    }

    checkUserTokenBalance()
  }, [authenticated, user, id, connection])

  const { data: tokenData, isLoading: tokenLoading, refetch: tokenRefetch } = useQuery<GetTokenResponse>({
    queryFn: () =>
      backendSparkApi.getToken({
        mint: id || "",
      }),
    queryKey: ["getToken", id],
  })

  // Fetch DAO information if token has a DAO address
  const { data: daoData, isLoading: daoLoading, error: daoError } = useQuery({
    queryFn: () =>
      backendSparkApi.getDao({
        address: tokenData?.token?.dao || "",
      }),
    queryKey: ["getDao", tokenData?.token?.dao],
    enabled: Boolean(tokenData?.token?.dao && tokenData?.token?.dao !== ""),
  })

  // Fetch token market data
  const { data: marketData, isLoading: marketLoading, error: marketError } = useQuery<GetTokenMarketResponse>({
    queryFn: () =>
      backendSparkApi.getTokenMarket({
        address: id || "",
      }),
    queryKey: ["getTokenMarket", id],
    enabled: Boolean(id),
  })

  console.log("tokenData:", tokenData)
  console.log("daoData:", daoData)
  console.log("daoError:", daoError)
  console.log("marketData:", marketData)
  console.log("marketError:", marketError)
  console.log("marketCap:", marketData?.tokenMarketData?.marketCap)
  console.log("volume24h:", marketData?.tokenMarketData?.volume24h)

  const handleGovernanceStatusUpdate = () => {
    // Refetch DAO data when governance status updates
    if (daoData?.dao) {
      // This would trigger a refetch in a real implementation
      console.log("Governance status updated, refreshing data...")
    }
  }


  return (
    <main className="relative z-[10] flex w-full max-w-full select-none flex-col items-center gap-4 overflow-y-hidden py-[72px] font-normal text-fg-primary md:py-[100px]">
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

      <div className="max-w-screen absolute left-0 top-10 z-[-11] w-full overflow-hidden md:top-16">
        <img src={backdropImg} className="h-[740px] min-w-[1440px] md:h-auto md:w-screen" />
      </div>

      <section className="flex w-full flex-col items-center gap-8 px-4 md:max-w-[792px]">
        {/* Header with logo and name */}
        <div className="flex w-full items-center gap-4">
          <Img
            src={tokenData?.token?.imageUrl}
            isFetchingLink={tokenLoading}
            imgClassName="w-16 h-16 rounded-full object-cover"
            isRounded={true}
            size="20"
          />
          <div className="flex flex-col gap-2 flex-1">
            <div className="flex items-center gap-2">
              <Text
                text={tokenData?.token?.name || marketData?.tokenMarketData?.name}
                as="h1"
                className="font-semibold text-2xl"
                isLoading={tokenLoading && marketLoading}
                loadingClass="max-w-[120px]"
              />
            </div>

            {/* Token Address - first 4 and last 4 characters */}
            <Text
              text={id ? `${id.slice(0, 4)}...${id.slice(-4)}` : "Unknown"}
              as="span"
              className="text-fg-primary text-opacity-75 font-mono text-sm"
              isLoading={tokenLoading}
            />
          </div>

          {/* Market Cap and Volume */}
          {marketData?.tokenMarketData && (
            <div className="flex flex-col gap-1 text-left ml-auto mr-4">
              <div className="flex items-center gap-1">
                <Text
                  text="Mkt Cap"
                  as="span"
                  className="text-xs text-fg-primary text-opacity-75 font-medium"
                  isLoading={marketLoading}
                />
                <Text
                  text={marketData.tokenMarketData.marketCap >= 1000000
                    ? `$${(marketData.tokenMarketData.marketCap / 1000000).toFixed(1)}M`
                    : marketData.tokenMarketData.marketCap >= 1000
                      ? `$${(marketData.tokenMarketData.marketCap / 1000).toFixed(1)}K`
                      : `$${marketData.tokenMarketData.marketCap || 0}`
                  }
                  as="span"
                  className="text-xs font-medium text-fg-primary"
                  isLoading={marketLoading}
                />
              </div>
              <div className="flex items-center gap-1">
                <Text
                  text="Vol (24h)"
                  as="span"
                  className="text-xs text-fg-primary text-opacity-75 font-medium"
                  isLoading={marketLoading}
                />
                <Text
                  text={marketData.tokenMarketData.volume24h >= 1000000
                    ? `$${(marketData.tokenMarketData.volume24h / 1000000).toFixed(1)}M`
                    : marketData.tokenMarketData.volume24h >= 1000
                      ? `$${(marketData.tokenMarketData.volume24h / 1000).toFixed(1)}K`
                      : `$${marketData.tokenMarketData.volume24h || 0}`
                  }
                  as="span"
                  className="text-xs font-medium text-fg-primary"
                  isLoading={marketLoading}
                />
              </div>
            </div>
          )}
        </div>

        {/* Price Chart */}
        {marketLoading ? (
          <div className="w-full rounded-lg bg-bg-secondary p-4">
            <div className="h-[300px] flex items-center justify-center">
              <Text text="Loading price chart..." as="p" className="text-fg-primary text-opacity-75" />
            </div>
          </div>
        ) : marketError ? (
          <div className="w-full rounded-lg bg-bg-secondary p-4 border border-red-500/20">
            <div className="h-[300px] flex items-center justify-center flex-col gap-2">
              <Text text="Failed to load price chart" as="p" className="text-red-400" />
              <Text text="Market data may not be available for this token" as="p" className="text-sm text-fg-primary text-opacity-75" />
            </div>
          </div>
        ) : marketData?.tokenMarketData ? (
          <TokenChart tokenMarketData={marketData.tokenMarketData} />
        ) : (
          <div className="w-full rounded-lg bg-bg-secondary p-4">
            <div className="h-[300px] flex items-center justify-center">
              <Text text="No market data available" as="p" className="text-fg-primary text-opacity-75" />
            </div>
          </div>
        )}

        {/* Token Balance and Value */}
        {marketData?.tokenMarketData && (
          <div className="w-full rounded-lg bg-bg-secondary p-4 border border-fg-primary/10">
            <div className="flex justify-between items-center">
              <div className="flex flex-col items-center text-center flex-1">
                <Text
                  text="Balance"
                  as="span"
                  className="text-xs text-fg-primary text-opacity-75 font-medium mb-1"
                  isLoading={marketLoading}
                />
                <Text
                  text={authenticated
                    ? userTokenBalance.toFixed(2)
                    : "--"
                  }
                  as="span"
                  className="text-lg font-semibold text-fg-primary"
                  isLoading={marketLoading}
                />

              </div>
              <div className="flex flex-col items-center text-center flex-1">
                <Text
                  text="Value"
                  as="span"
                  className="text-xs text-fg-primary text-opacity-75 font-medium mb-1"
                  isLoading={marketLoading}
                />
                <Text
                  text={authenticated && userTokenBalance > 0 && jupiterQuote && solPriceUSD
                    ? `$${(userTokenBalance * jupiterQuote * solPriceUSD).toFixed(2)}`
                    : authenticated && userTokenBalance > 0 && marketData.tokenMarketData.price
                      ? `$${(userTokenBalance * marketData.tokenMarketData.price).toFixed(2)}`
                      : "--"
                  }
                  as="span"
                  className="text-lg font-semibold text-fg-primary"
                  isLoading={marketLoading}
                />

              </div>
            </div>
          </div>
        )}

        {/* Buy Token Button */}
        <Button
          onClick={() => setIsSwapModalOpen(true)}
          className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          Buy Token
        </Button>

        {/* DAO Governance */}
        {tokenData?.token?.dao && tokenData?.token?.dao !== "" && (
          <div className="w-full space-y-6">
            <div className="text-center">
              <Text text="🏛️ DAO Governance" as="h2" className="text-2xl font-bold mb-2" />
              <Text text="Participate in decentralized governance and shape the future of this project" as="p" className="text-sm text-fg-primary text-opacity-75" />
            </div>

            {daoLoading && (
              <div className="w-full rounded-xl bg-bg-secondary p-6 border border-fg-primary/10">
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                  <Text text="Loading governance data..." as="p" className="text-fg-primary text-opacity-75" />
                </div>
              </div>
            )}

            {daoError && (
              <div className="w-full rounded-xl bg-red-500/5 p-6 border border-red-500/20">
                <div className="text-center space-y-2">
                  <Text text="❌ Failed to load governance data" as="p" className="text-red-400 font-medium" />
                  <Text text={daoError?.message || "Unknown error occurred"} as="p" className="text-xs text-fg-primary text-opacity-75" />
                </div>
              </div>
            )}

            {daoData?.dao && (
              <div className="w-full space-y-6">
                {/* DAO Name and Realms Link */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-bg-secondary border border-fg-primary/10">
                  <Text text={daoData.dao.name} as="h3" className="text-xl font-bold text-brand-primary" />
                  <a
                    href={`https://app.realms.today/dao/${daoData.dao.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-lg transition-colors font-medium text-sm"
                  >
                    View on Realms
                  </a>
                </div>

                {/* Governance Status */}
                <div className="rounded-xl bg-bg-secondary border border-fg-primary/10 overflow-hidden">
                  <GovernanceStatus
                    dao={daoData.dao}
                    onStatusUpdate={handleGovernanceStatusUpdate}
                  />
                </div>

                {/* DAO Proposals */}
                {daoData.dao.proposals.length > 0 && (
                  <div className="rounded-xl bg-bg-secondary p-6 border border-fg-primary/10">
                    <div className="flex items-center justify-between mb-6">
                      <Text text="📋 Governance Proposals" as="h3" className="text-lg font-semibold" />
                      <div className="px-3 py-1 bg-brand-primary/10 rounded-full">
                        <Text text={`${daoData.dao.proposals.length} total`} as="span" className="text-xs text-brand-primary font-medium" />
                      </div>
                    </div>

                    {/* Enhanced Tabs */}
                    <div className="flex mb-6 bg-bg-primary/5 rounded-lg p-1">
                      <button
                        onClick={() => setActiveTab('current')}
                        className={twMerge(
                          "flex-1 py-3 px-4 text-sm font-medium rounded-md transition-all duration-200",
                          activeTab === 'current'
                            ? "bg-brand-primary text-white shadow-lg"
                            : "text-fg-secondary hover:text-fg-primary hover:bg-bg-primary/10"
                        )}
                      >
                        🗳️ Active Proposals
                      </button>
                      <button
                        onClick={() => setActiveTab('past')}
                        className={twMerge(
                          "flex-1 py-3 px-4 text-sm font-medium rounded-md transition-all duration-200",
                          activeTab === 'past'
                            ? "bg-brand-primary text-white shadow-lg"
                            : "text-fg-secondary hover:text-fg-primary hover:bg-bg-primary/10"
                        )}
                      >
                        📚 Proposal History
                      </button>
                    </div>

                    {/* Tab Content */}
                    <div className="space-y-4">
                      {activeTab === 'current' ? (
                        <>
                          {/* Current proposals (voting, signingOff, executing) - NO DRAFTS */}
                          {daoData.dao.proposals
                            .filter(proposal => {
                              const stateKey = typeof proposal.state === 'object' && proposal.state !== null
                                ? Object.keys(proposal.state)[0]
                                : proposal.state;
                              return ['voting', 'signingOff', 'executing'].includes(stateKey); // Removed 'draft'
                            })
                            .slice(0, 3)
                            .map((proposal) => (
                              <div key={proposal.address} className="border border-fg-primary/10 rounded-xl overflow-hidden bg-gradient-to-r from-bg-primary/5 to-transparent">
                                <ProposalVoting
                                  proposal={proposal}
                                  dao={daoData.dao}
                                />
                              </div>
                            ))}

                          {/* Additional current proposals in enhanced compact view */}
                          {daoData.dao.proposals
                            .filter(proposal => {
                              const stateKey = typeof proposal.state === 'object' && proposal.state !== null
                                ? Object.keys(proposal.state)[0]
                                : proposal.state;
                              return ['voting', 'signingOff', 'executing'].includes(stateKey); // Removed 'draft'
                            })
                            .slice(3)
                            .map((proposal) => (
                              <div key={proposal.address} className="border border-fg-primary/10 rounded-lg p-4 bg-bg-primary/5 hover:bg-bg-primary/10 transition-colors">
                                <div className="space-y-3">
                                  <div className="flex justify-between items-start">
                                    <Text text={proposal.name || "Unnamed Proposal"} as="p" className="font-medium text-fg-primary" />
                                    {(() => {
                                      const stateKey = typeof proposal.state === 'object' && proposal.state !== null
                                        ? Object.keys(proposal.state)[0]
                                        : proposal.state;
                                      const stateDisplay = typeof stateKey === 'string'
                                        ? stateKey.charAt(0).toUpperCase() + stateKey.slice(1)
                                        : 'Unknown';

                                      const getStatusEmoji = (state: string) => {
                                        switch (state) {
                                          case 'voting': return '🗳️';
                                          case 'signingOff': return '✍️';
                                          case 'executing': return '⚡';
                                          default: return '📄';
                                        }
                                      };

                                      return (
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${stateKey === 'voting' ? 'bg-blue-500/20 text-blue-400' :
                                            stateKey === 'signingOff' ? 'bg-orange-500/20 text-orange-400' :
                                              stateKey === 'executing' ? 'bg-indigo-500/20 text-indigo-400' :
                                                'bg-gray-500/20 text-gray-400'
                                          }`}>
                                          <span>{getStatusEmoji(stateKey)}</span>
                                          {stateDisplay}
                                        </span>
                                      );
                                    })()}
                                  </div>
                                  {proposal.description && (
                                    <Text text={proposal.description} as="p" className="text-sm text-fg-primary text-opacity-75 line-clamp-2" />
                                  )}
                                </div>
                              </div>
                            ))}

                          {daoData.dao.proposals.filter(proposal => {
                            const stateKey = typeof proposal.state === 'object' && proposal.state !== null
                              ? Object.keys(proposal.state)[0]
                              : proposal.state;
                            return ['voting', 'signingOff', 'executing'].includes(stateKey); // Removed 'draft'
                          }).length === 0 && (
                              <div className="text-center py-12 bg-bg-primary/5 rounded-lg">
                                <div className="text-4xl mb-3">🗳️</div>
                                <Text text="No Active Proposals" as="p" className="text-lg font-medium mb-2" />
                                <Text text="There are currently no proposals open for voting" as="p" className="text-sm text-fg-primary text-opacity-50" />
                              </div>
                            )}
                        </>
                      ) : (
                        <>
                          {/* Past proposals (succeeded, completed, defeated, cancelled, vetoed) */}
                          {daoData.dao.proposals
                            .filter(proposal => {
                              const stateKey = typeof proposal.state === 'object' && proposal.state !== null
                                ? Object.keys(proposal.state)[0]
                                : proposal.state;
                              return ['succeeded', 'completed', 'defeated', 'cancelled', 'vetoed'].includes(stateKey);
                            })
                            .map((proposal) => (
                              <div key={proposal.address} className="border border-fg-primary/10 rounded-lg p-4 bg-bg-primary/5 hover:bg-bg-primary/10 transition-colors">
                                <div className="space-y-3">
                                  <div className="flex justify-between items-start">
                                    <Text text={proposal.name || "Unnamed Proposal"} as="p" className="font-medium text-fg-primary" />
                                    {(() => {
                                      const stateKey = typeof proposal.state === 'object' && proposal.state !== null
                                        ? Object.keys(proposal.state)[0]
                                        : proposal.state;
                                      const stateDisplay = typeof stateKey === 'string'
                                        ? stateKey.charAt(0).toUpperCase() + stateKey.slice(1)
                                        : 'Unknown';

                                      const getHistoryEmoji = (state: string) => {
                                        switch (state) {
                                          case 'succeeded': return '✅';
                                          case 'completed': return '🎉';
                                          case 'defeated': return '❌';
                                          case 'cancelled': return '🚫';
                                          case 'vetoed': return '⛔';
                                          default: return '📋';
                                        }
                                      };

                                      return (
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${stateKey === 'succeeded' ? 'bg-green-500/20 text-green-400' :
                                            stateKey === 'completed' ? 'bg-purple-500/20 text-purple-400' :
                                              stateKey === 'defeated' ? 'bg-red-500/20 text-red-400' :
                                                stateKey === 'cancelled' ? 'bg-gray-500/20 text-gray-400' :
                                                  stateKey === 'vetoed' ? 'bg-red-600/20 text-red-300' :
                                                    'bg-gray-500/20 text-gray-400'
                                          }`}>
                                          <span>{getHistoryEmoji(stateKey)}</span>
                                          {stateDisplay}
                                        </span>
                                      );
                                    })()}
                                  </div>
                                  {proposal.description && (
                                    <Text text={proposal.description} as="p" className="text-sm text-fg-primary text-opacity-75 line-clamp-2" />
                                  )}
                                  <div className="flex justify-between items-center text-xs bg-bg-primary/10 rounded-lg p-3">
                                    <div className="flex items-center gap-1">
                                      <span className="text-green-400">👍</span>
                                      <span className="text-fg-primary text-opacity-60">
                                        {(() => {
                                          const weight = parseInt(proposal.options[0]?.voteWeight || "0");
                                          if (weight === 0) return "0";
                                          const formatted = weight / 1000000000;
                                          if (formatted >= 1000000) return `${(formatted / 1000000).toFixed(1)}M`;
                                          else if (formatted >= 1000) return `${(formatted / 1000).toFixed(1)}K`;
                                          else return formatted.toFixed(1);
                                        })()}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className="text-red-400">👎</span>
                                      <span className="text-fg-primary text-opacity-60">
                                        {(() => {
                                          const weight = parseInt(proposal.denyVoteWeight || "0");
                                          if (weight === 0) return "0";
                                          const formatted = weight / 1000000000;
                                          if (formatted >= 1000000) return `${(formatted / 1000000).toFixed(1)}M`;
                                          else if (formatted >= 1000) return `${(formatted / 1000).toFixed(1)}K`;
                                          else return formatted.toFixed(1);
                                        })()}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}

                          {daoData.dao.proposals.filter(proposal => {
                            const stateKey = typeof proposal.state === 'object' && proposal.state !== null
                              ? Object.keys(proposal.state)[0]
                              : proposal.state;
                            return ['succeeded', 'completed', 'defeated', 'cancelled', 'vetoed'].includes(stateKey);
                          }).length === 0 && (
                              <div className="text-center py-12 bg-bg-primary/5 rounded-lg">
                                <div className="text-4xl mb-3">📚</div>
                                <Text text="No Historical Proposals" as="p" className="text-lg font-medium mb-2" />
                                <Text text="No proposals have been completed yet" as="p" className="text-sm text-fg-primary text-opacity-50" />
                              </div>
                            )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Buy Token Modal */}
      {isSwapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Modal Background Overlay */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsSwapModalOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative z-10 w-full max-w-md">
            <div className="relative">
              {/* Close Button */}
              <button
                onClick={() => setIsSwapModalOpen(false)}
                className="absolute -top-2 -right-2 z-20 w-8 h-8 bg-bg-secondary border border-fg-primary/20 rounded-full flex items-center justify-center hover:bg-bg-primary transition-colors"
              >
                <Icon icon="SvgClose" className="w-4 h-4 text-fg-primary" />
              </button>

              {/* Jupiter Swap Component */}
              <JupiterSwap
                outputMint={tokenData?.token?.mint || id || ""}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}

      <ScrollRestoration />
    </main>
  )
}

export default Project
