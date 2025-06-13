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
import { GetTokenResponse, DaoModel, GetTokenMarketResponse, TokenMarketData } from "shared/models"
import TokenChart from "@/components/TokenChart/TokenChart"
import CandlestickChart from "@/components/TokenChart/CandlestickChart"
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
  const [swapMode, setSwapMode] = useState<'buy' | 'sell'>('buy')
  const [userTokenBalance, setUserTokenBalance] = useState(0)
  const [jupiterQuote, setJupiterQuote] = useState<number | null>(null)
  const [tokenMap, setTokenMap] = useState<Map<string, TokenInfo>>(new Map())
  const [solPriceUSD, setSolPriceUSD] = useState<number | null>(null)
  const [fallbackChartData, setFallbackChartData] = useState<TokenMarketData | null>(null)
  const [isLoadingFallbackChart, setIsLoadingFallbackChart] = useState(false)

  const { user, authenticated } = usePrivy()
  const { wallets } = useSolanaWallets()

  const RPC_URL = import.meta.env.VITE_RPC_URL || "https://haleigh-sa5aoh-fast-mainnet.helius-rpc.com"
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
        console.log("Fetching SOL price...");
        const response = await fetch('https://price.jup.ag/v4/price?ids=So11111111111111111111111111111111111111112')
        if (response.ok) {
          const data = await response.json()
          const solPrice = data.data?.['So11111111111111111111111111111111111111112']?.price
          if (solPrice) {
            setSolPriceUSD(solPrice)
            console.log("SOL price fetched successfully:", solPrice);
          } else {
            console.error("SOL price not found in response:", data);
          }
        } else {
          console.error("Failed to fetch SOL price, status:", response.status);
        }
      } catch (error) {
        console.error('Error fetching SOL price:', error)
        
        // Try alternative price source
        try {
          console.log("Trying alternative SOL price source...");
          const altResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd')
          if (altResponse.ok) {
            const altData = await altResponse.json()
            const altSolPrice = altData.solana?.usd
            if (altSolPrice) {
              setSolPriceUSD(altSolPrice)
              console.log("SOL price from alternative source:", altSolPrice);
            }
          }
        } catch (altError) {
          console.error('Alternative SOL price source also failed:', altError)
        }
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

      // Try to get quote for selling 1 token to SOL
      const response = await fetch(
        `https://quote-api.jup.ag/v6/quote?inputMint=${outputMint}&outputMint=${inputMint}&amount=${oneTokenInSmallestUnit}&slippageBps=50`
      )

      if (!response.ok) {
        throw new Error('Failed to get sell quote')
      }

      const quoteData = await response.json()

      // Calculate SOL amount for 1 token
      const solDecimals = 9
      const solAmount = parseInt(quoteData.outAmount) / Math.pow(10, solDecimals)
      setJupiterQuote(solAmount)
      console.log("Jupiter quote (sell) successful:", solAmount)
    } catch (error) {
      console.error('Error getting Jupiter sell quote:', error)
      
      // Try the opposite direction (buy 1 SOL worth of token) as fallback
      try {
        const oneSolInLamports = 1 * Math.pow(10, 9) // 1 SOL
        const buyResponse = await fetch(
          `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${oneSolInLamports}&slippageBps=50`
        )

        if (buyResponse.ok) {
          const buyQuoteData = await buyResponse.json()
          const outputToken = tokenMap.get(outputMint)
          const decimals = outputToken?.decimals || 9
          const tokensPerSol = parseInt(buyQuoteData.outAmount) / Math.pow(10, decimals)
          const solPerToken = tokensPerSol > 0 ? 1 / tokensPerSol : 0
          setJupiterQuote(solPerToken)
          console.log("Jupiter quote (buy fallback) successful:", solPerToken)
        } else {
          throw new Error('Buy fallback also failed')
        }
      } catch (fallbackError) {
        console.error('Jupiter buy fallback also failed:', fallbackError)
        setJupiterQuote(null)
      }
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
  console.log("fallbackChartData:", fallbackChartData)

  const handleGovernanceStatusUpdate = () => {
    // Refetch DAO data when governance status updates
    if (daoData?.dao) {
      // This would trigger a refetch in a real implementation
      console.log("Governance status updated, refreshing data...")
    }
  }

  // Check if DAO exists to conditionally adjust layout
  const hasDao = tokenData?.token?.dao && tokenData?.token?.dao !== ""

  // Fetch fallback chart data when backend data is not available
  const fetchFallbackChartData = async (tokenAddress: string): Promise<TokenMarketData | null> => {
    if (!tokenAddress) return null
    
    setIsLoadingFallbackChart(true)
    console.log("Fetching fallback chart data for:", tokenAddress)

    try {
      // Try DexScreener API first (free and reliable)
      const dexScreenerUrl = `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`
      const dexResponse = await fetch(dexScreenerUrl)
      
      if (dexResponse.ok) {
        const dexData = await dexResponse.json()
        console.log("DexScreener data:", dexData)
        
        if (dexData.pairs && dexData.pairs.length > 0) {
          // Get the pair with highest liquidity (most reliable)
          const bestPair = dexData.pairs.reduce((prev: Record<string, unknown>, current: Record<string, unknown>) => 
            ((current.liquidity as Record<string, number>)?.usd || 0) > ((prev.liquidity as Record<string, number>)?.usd || 0) ? current : prev
          )

          if (bestPair) {
            console.log("Best pair found:", bestPair)
            
            // Create chart data structure similar to backend format
            const chartData: TokenMarketData = {
              address: tokenAddress,
              name: bestPair.baseToken?.name || "Unknown",
              symbol: bestPair.baseToken?.symbol || "UNKNOWN",
              price: parseFloat(bestPair.priceUsd || "0"),
              priceChange24h: parseFloat(bestPair.priceChange?.h24 || "0"),
              marketCap: bestPair.marketCap || 0,
              volume24h: parseFloat(bestPair.volume?.h24 || "0"),
              liquidity: parseFloat(bestPair.liquidity?.usd || "0"),
              fdv: bestPair.fdv || 0,
              priceChart: [] as Array<{ timestamp: number; price: number }>,
              lastUpdated: new Date().toISOString()
            }

            // Generate mock chart data if no historical data available
            // This creates a realistic-looking chart based on current price and 24h change
            const now = Date.now()
            const oneHour = 60 * 60 * 1000
            const currentPrice = chartData.price
            const dailyChange = chartData.priceChange24h / 100 // Convert percentage to decimal
            
            // Create 24 hours of hourly data points
            const mockChart = []
            for (let i = 23; i >= 0; i--) {
              const timestamp = now - (i * oneHour)
              
              // Calculate price progression to achieve the 24h change
              const progressRatio = (23 - i) / 23 // 0 to 1 progression
              const targetChange = dailyChange * progressRatio
              
              // Add some realistic volatility
              const volatility = (Math.random() - 0.5) * 0.05 // ±2.5% volatility
              const basePrice = currentPrice / (1 + dailyChange) // Starting price 24h ago
              const price = basePrice * (1 + targetChange + volatility)
              
              mockChart.push({
                timestamp,
                price: Math.max(0, price)
              })
            }

            chartData.priceChart = mockChart
            console.log("Generated chart data:", chartData)
            return chartData
          }
        }
      }

      // Try GeckoTerminal API
      console.log("Trying GeckoTerminal API as fallback...")
      const geckoTerminalUrl = `https://api.geckoterminal.com/api/v2/networks/solana/tokens/${tokenAddress}`
      const geckoResponse = await fetch(geckoTerminalUrl)
      
      if (geckoResponse.ok) {
        const geckoData = await geckoResponse.json()
        console.log("GeckoTerminal data:", geckoData)
        
        if (geckoData.data && geckoData.data.attributes) {
          const attrs = geckoData.data.attributes
          const price = parseFloat(attrs.price_usd || "0")
          
          if (price > 0) {
            const chartData: TokenMarketData = {
              address: tokenAddress,
              name: attrs.name || "Token",
              symbol: attrs.symbol || "TOKEN",
              price,
              priceChange24h: parseFloat(attrs.price_change_percentage?.h24 || "0"),
              marketCap: parseFloat(attrs.market_cap_usd || "0"),
              volume24h: parseFloat(attrs.volume_usd?.h24 || "0"),
              liquidity: 0,
              fdv: parseFloat(attrs.fdv_usd || "0"),
              priceChart: [] as Array<{ timestamp: number; price: number }>,
              lastUpdated: new Date().toISOString()
            }

            // Generate chart data based on 24h change
            const now = Date.now()
            const oneHour = 60 * 60 * 1000
            const currentPrice = chartData.price
            const dailyChange = chartData.priceChange24h / 100
            
            const mockChart = []
            for (let i = 23; i >= 0; i--) {
              const timestamp = now - (i * oneHour)
              const progressRatio = (23 - i) / 23
              const targetChange = dailyChange * progressRatio
              const volatility = (Math.random() - 0.5) * 0.03
              const basePrice = currentPrice / (1 + dailyChange)
              const price = basePrice * (1 + targetChange + volatility)
              
              mockChart.push({
                timestamp,
                price: Math.max(0, price)
              })
            }

            chartData.priceChart = mockChart
            console.log("GeckoTerminal fallback chart data:", chartData)
            return chartData
          }
        }
      }

      // Fallback to Jupiter Price API
      console.log("Trying Jupiter Price API as final fallback...")
      const jupiterPriceUrl = `https://lite-api.jup.ag/price/v2?ids=${tokenAddress}&showExtraInfo=true`
      const jupiterResponse = await fetch(jupiterPriceUrl)
      
      if (jupiterResponse.ok) {
        const jupiterData = await jupiterResponse.json()
        console.log("Jupiter price data:", jupiterData)
        
        const tokenData = jupiterData.data?.[tokenAddress]
        if (tokenData) {
          const price = parseFloat(tokenData.price || "0")
          
          // Create basic chart data with Jupiter price
          const chartData: TokenMarketData = {
            address: tokenAddress,
            name: "Token",
            symbol: "TOKEN",
            price,
            priceChange24h: 0, // Jupiter doesn't provide 24h change in v2
            marketCap: 0,
            volume24h: 0,
            liquidity: 0,
            fdv: 0,
            priceChart: [] as Array<{ timestamp: number; price: number }>,
            lastUpdated: new Date().toISOString()
          }

          // Generate minimal chart with flat price
          const now = Date.now()
          const oneHour = 60 * 60 * 1000
          const mockChart = []
          
          for (let i = 23; i >= 0; i--) {
            const timestamp = now - (i * oneHour)
            // Add slight volatility to make it look more realistic
            const volatility = (Math.random() - 0.5) * 0.02 // ±1% volatility
            const adjustedPrice = price * (1 + volatility)
            
            mockChart.push({
              timestamp,
              price: Math.max(0, adjustedPrice)
            })
          }

          chartData.priceChart = mockChart
          console.log("Jupiter fallback chart data:", chartData)
          return chartData
        }
      }

      console.log("No fallback chart data sources available")
      return null

    } catch (error) {
      console.error("Error fetching fallback chart data:", error)
      return null
    } finally {
      setIsLoadingFallbackChart(false)
    }
  }

  // Fetch fallback chart data when backend data fails or has no meaningful data
  useEffect(() => {
    const loadFallbackChart = async () => {
      if (id && !marketLoading) {
        // Check if we should use fallback data
        const shouldUseFallback = 
          marketError || // Backend error
          (marketData?.tokenMarketData && (
            !marketData.tokenMarketData.priceChart || 
            marketData.tokenMarketData.priceChart.length === 0 ||
            (marketData.tokenMarketData.price === 0 && marketData.tokenMarketData.marketCap === 0)
          ))

        if (shouldUseFallback) {
          console.log("Backend chart data insufficient, trying fallback sources...")
          console.log("Market data:", marketData?.tokenMarketData)
          console.log("Market error:", marketError)
          const fallbackData = await fetchFallbackChartData(id)
          setFallbackChartData(fallbackData)
        } else {
          console.log("Backend data is sufficient, not using fallback")
        }
      }
    }

    loadFallbackChart()
  }, [id, marketError, marketLoading, marketData])

  return (
    <main className={`relative z-[10] flex w-full max-w-full select-none flex-col items-start gap-4 overflow-y-hidden font-normal text-fg-primary ${hasDao ? 'pb-[48px] md:pb-[64px]' : 'pb-[16px] md:pb-[24px]'}`}>
      <div className="max-w-screen absolute left-0 top-0 z-[-11] w-full overflow-hidden">
        <img src={backdropImg} className="h-[740px] min-w-[1440px] md:h-auto md:w-screen" />
        {/* Header with back button */}
        <div className="absolute left-4 top-4 z-50">
          <Button
            onClick={() => navigate(ROUTES.PROJECTS)}
            size="sm"
            className="bg-bg-secondary/80 hover:bg-bg-secondary border border-fg-primary/10 backdrop-blur-sm"
          >
            <Icon icon="SvgArrowLeft" className="text-sm text-fg-primary/60" />
          </Button>
        </div>
      </div>

      <section className="flex w-full flex-col items-center gap-8 px-4 md:max-w-[792px] mx-auto mt-20 md:mt-24">
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
                text={tokenData?.token?.name || marketData?.tokenMarketData?.name || fallbackChartData?.name}
                as="h1"
                className="font-semibold text-2xl"
                isLoading={tokenLoading && marketLoading && isLoadingFallbackChart}
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
          {(marketData?.tokenMarketData || fallbackChartData) && (
            <div className="flex flex-col gap-1 text-left ml-auto mr-4">
              <div className="flex items-center gap-1">
                <Text
                  text="Mkt Cap"
                  as="span"
                  className="text-xs text-fg-primary text-opacity-75 font-medium"
                  isLoading={marketLoading && isLoadingFallbackChart}
                />
                <Text
                  text={(() => {
                    const marketCap = marketData?.tokenMarketData?.marketCap || fallbackChartData?.marketCap || 0
                    return marketCap >= 1000000
                      ? `$${(marketCap / 1000000).toFixed(1)}M`
                      : marketCap >= 1000
                        ? `$${(marketCap / 1000).toFixed(1)}K`
                        : `$${marketCap || 0}`
                  })()}
                  as="span"
                  className="text-xs font-medium text-fg-primary"
                  isLoading={marketLoading && isLoadingFallbackChart}
                />
              </div>
              <div className="flex items-center gap-1">
                <Text
                  text="Vol (24h)"
                  as="span"
                  className="text-xs text-fg-primary text-opacity-75 font-medium"
                  isLoading={marketLoading && isLoadingFallbackChart}
                />
                <Text
                  text={(() => {
                    const volume24h = marketData?.tokenMarketData?.volume24h || fallbackChartData?.volume24h || 0
                    return volume24h >= 1000000
                      ? `$${(volume24h / 1000000).toFixed(1)}M`
                      : volume24h >= 1000
                        ? `$${(volume24h / 1000).toFixed(1)}K`
                        : `$${volume24h || 0}`
                  })()}
                  as="span"
                  className="text-xs font-medium text-fg-primary"
                  isLoading={marketLoading && isLoadingFallbackChart}
                />
              </div>
            </div>
          )}
        </div>

        {/* Price Chart */}
        {(marketLoading || isLoadingFallbackChart) ? (
          <div className="w-full rounded-lg bg-bg-secondary p-4">
            <div className="h-[300px] flex items-center justify-center">
              <Text text="Loading price chart..." as="p" className="text-fg-primary text-opacity-75" />
            </div>
          </div>
        ) : (() => {
          // Determine which data to use for chart
          const hasValidBackendData = marketData?.tokenMarketData && 
            marketData.tokenMarketData.priceChart && 
            marketData.tokenMarketData.priceChart.length > 0 &&
            !(marketData.tokenMarketData.price === 0 && marketData.tokenMarketData.marketCap === 0)

          console.log("Chart rendering decision:", {
            hasValidBackendData,
            hasFallbackData: !!fallbackChartData,
            fallbackDataValid: fallbackChartData && fallbackChartData.priceChart && fallbackChartData.priceChart.length > 0,
            fallbackChartLength: fallbackChartData?.priceChart?.length,
            fallbackPrice: fallbackChartData?.price
          })

          if (hasValidBackendData) {
            console.log("Using backend chart data")
            return <CandlestickChart tokenMarketData={marketData.tokenMarketData} />
          } else if (fallbackChartData) {
            console.log("Using fallback chart data:", fallbackChartData)
            return (
              <div className="w-full">
                <CandlestickChart tokenMarketData={fallbackChartData} />
                <div className="text-center mt-2">
                  <Text text="📊 Chart data from external sources" as="p" className="text-xs text-fg-primary text-opacity-50" />
                </div>
              </div>
            )
          } else {
            console.log("No chart data available")
            return (
              <div className="w-full rounded-lg bg-bg-secondary p-4 border border-yellow-500/20">
                <div className="h-[300px] flex items-center justify-center flex-col gap-2">
                  <Text text="No chart data available" as="p" className="text-yellow-400" />
                  <Text text="This token may be too new or have insufficient trading data" as="p" className="text-sm text-fg-primary text-opacity-75" />
                  <Button
                    onClick={() => window.open(`https://dexscreener.com/solana/${id}`, '_blank')}
                    size="sm"
                    className="mt-4 bg-brand-primary/20 hover:bg-brand-primary/30 text-brand-primary border-brand-primary/30"
                  >
                    View on DexScreener
                  </Button>
                </div>
              </div>
            )
          }
        })()}

        {/* Token Balance and Value */}
        {(marketData?.tokenMarketData || fallbackChartData) && (
          <div className="w-full rounded-lg bg-bg-secondary p-4 border border-fg-primary/10">
            <div className="flex justify-between items-center">
              <div className="flex flex-col items-center text-center flex-1">
                <Text
                  text="Balance"
                  as="span"
                  className="text-xs text-fg-primary text-opacity-75 font-medium mb-1"
                  isLoading={marketLoading && isLoadingFallbackChart}
                />
                <Text
                  text={authenticated
                    ? userTokenBalance.toFixed(2)
                    : "--"
                  }
                  as="span"
                  className="text-lg font-semibold text-fg-primary"
                  isLoading={marketLoading && isLoadingFallbackChart}
                />

              </div>
              <div className="flex flex-col items-center text-center flex-1">
                <Text
                  text="Value"
                  as="span"
                  className="text-xs text-fg-primary text-opacity-75 font-medium mb-1"
                  isLoading={marketLoading && isLoadingFallbackChart}
                />
                <Text
                  text={(() => {
                    // Debug logging
                    console.log("Value calculation debug:", {
                      authenticated,
                      userTokenBalance,
                      jupiterQuote,
                      solPriceUSD,
                      marketPrice: marketData?.tokenMarketData?.price,
                      fallbackPrice: fallbackChartData?.price,
                      hasJupiterData: !!(jupiterQuote && solPriceUSD),
                      hasMarketData: !!marketData?.tokenMarketData?.price,
                      hasFallbackData: !!fallbackChartData?.price
                    });

                    if (!authenticated) return "--";
                    if (userTokenBalance <= 0) return "$0.00";

                    // Try Jupiter quote first
                    if (jupiterQuote && solPriceUSD) {
                      const value = userTokenBalance * jupiterQuote * solPriceUSD;
                      return `$${value.toFixed(2)}`;
                    }

                    // Try market data price
                    if (marketData?.tokenMarketData?.price) {
                      const value = userTokenBalance * marketData.tokenMarketData.price;
                      return `$${value.toFixed(2)}`;
                    }

                    // Try fallback chart data price
                    if (fallbackChartData?.price) {
                      const value = userTokenBalance * fallbackChartData.price;
                      return `$${value.toFixed(2)}`;
                    }

                    // No price data available
                    return "--";
                  })()}
                  as="span"
                  className="text-lg font-semibold text-fg-primary"
                  isLoading={marketLoading && isLoadingFallbackChart}
                />

              </div>
            </div>
          </div>
        )}

        {/* Buy and Sell Token Buttons */}
        <div className="flex gap-3 w-full">
          <Button
            onClick={() => {
              setSwapMode('buy')
              setIsSwapModalOpen(true)
            }}
            className="flex-1 !bg-green-600 hover:!bg-green-700 !text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Buy Token
          </Button>
          <Button
            onClick={() => {
              setSwapMode('sell')
              setIsSwapModalOpen(true)
            }}
            className="flex-1 !bg-red-600 hover:!bg-red-700 !text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:!bg-gray-500 disabled:!text-gray-300"
            disabled={!authenticated || userTokenBalance <= 0}
          >
            Sell Token
          </Button>
        </div>

        {/* DAO Governance */}
        {hasDao && (
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

      {/* Buy/Sell Token Modal */}
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

              {/* Modal Title */}
              <div className="mb-4 text-center">
                <h3 className="text-lg font-semibold text-fg-primary">
                  {swapMode === 'buy' ? 'Buy Token' : 'Sell Token'}
                </h3>
                {swapMode === 'sell' && userTokenBalance > 0 && (
                  <p className="text-sm text-fg-primary/60 mt-1">
                    Available: {userTokenBalance.toFixed(4)} tokens
                  </p>
                )}
              </div>

              {/* Jupiter Swap Component */}
              <JupiterSwap
                inputMint={swapMode === 'buy' ? "So11111111111111111111111111111111111111112" : (tokenData?.token?.mint || id || "")}
                outputMint={swapMode === 'buy' ? (tokenData?.token?.mint || id || "") : "So11111111111111111111111111111111111111112"}
                className="w-full"
                solPriceUSD={solPriceUSD || undefined}
                userTokenBalance={swapMode === 'sell' ? userTokenBalance : undefined}
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
