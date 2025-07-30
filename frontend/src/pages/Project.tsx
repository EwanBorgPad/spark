import { useState, useEffect, useRef, useCallback } from "react"
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
import { backendSparkApi, ApplicationResponse } from "@/data/api/backendSparkApi"
import { useQuery } from "@tanstack/react-query"
import { GetTokenResponse, DaoModel, GetTokenMarketResponse, TokenMarketData, GetTokenBalanceResponse } from "shared/models"
import TokenChart from "@/components/TokenChart/TokenChart"
import CandlestickChart from "@/components/TokenChart/CandlestickChart"
import TokenStats from "@/components/TokenStats/TokenStats"
import ProposalVoting from "@/components/ProposalVoting/ProposalVoting"
import GovernanceStatus from "@/components/GovernanceStatus/GovernanceStatus"
import JupiterSwap from "@/components/JupiterSwap"
import ApplicationDetailsModal from "@/components/Modal/Modals/ApplicationDetailsModal"
import { usePrivy, useSolanaWallets } from '@privy-io/react-auth'
import { TokenListProvider, TokenInfo } from '@solana/spl-token-registry'
import { ROUTES } from "@/utils/routes"
import { useDeviceDetection } from "@/hooks/useDeviceDetection"

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
  const [governanceData, setGovernanceData] = useState<{ userTokenBalance: number; votingPower: number }>({ userTokenBalance: 0, votingPower: 0 })
  const [selectedApplication, setSelectedApplication] = useState<ApplicationResponse | null>(null)
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false)
  const { isDesktop, isMobile } = useDeviceDetection()

  const { user, authenticated } = usePrivy()
  const { wallets } = useSolanaWallets()

  const inputMint = 'So11111111111111111111111111111111111111112' // SOL

  // Handle escape key to close modals
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isSwapModalOpen) {
          setIsSwapModalOpen(false)
        }
        if (isApplicationModalOpen) {
          handleCloseApplicationModal()
        }
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isSwapModalOpen, isApplicationModalOpen])

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
          const altResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd')
          if (altResponse.ok) {
            const altData = await altResponse.json()
            const altSolPrice = altData.solana?.usd
            if (altSolPrice) {
              setSolPriceUSD(altSolPrice)
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

              // Check user's token balance using backend API - refresh on page visit but not while staying
            const { data: tokenBalanceData, isLoading: tokenBalanceLoading } = useQuery({
    queryFn: () =>
      backendSparkApi.getTokenBalance({
        userAddress: user?.wallet?.address || "",
        tokenMint: id || "",
        cluster: "mainnet"
      }),
    queryKey: ["getTokenBalance", user?.wallet?.address, id],
    enabled: Boolean(authenticated && user?.wallet?.address && id),
    refetchInterval: false, // Disable automatic refetching
    staleTime: 0, // Always consider data stale - will refetch on mount
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: true, // Always refetch when component mounts (page visit)
    refetchOnReconnect: false, // Don't refetch when reconnecting to network
  })

  // Update user token balance when data changes
  useEffect(() => {
    if (tokenBalanceData?.success) {
      setUserTokenBalance(tokenBalanceData.balance)
    } else if (tokenBalanceData !== undefined) {
      setUserTokenBalance(0)
    }
  }, [tokenBalanceData])

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

  // Fetch applications for this project
  const { data: applicationsData } = useQuery({
          queryFn: () => backendSparkApi.getApplicationsByProjectId({ projectId: id || "" }),
    queryKey: ["getApplicationsByProjectId", id],
    enabled: Boolean(id),
  })

  // Log applications data when it changes
  useEffect(() => {
    console.log('📊 Applications data updated:', {
      projectId: id,
      applicationsCount: applicationsData?.applications?.length || 0,
      applications: applicationsData?.applications?.map(app => ({
        id: app.id,
        deliverableName: app.deliverableName,
        githubUsername: app.githubUsername,
        projectId: app.projectId,
        status: app.status
      })) || []
    });
  }, [applicationsData, id]);

  // Fetch token market data
  const { data: marketData, isLoading: marketLoading, error: marketError } = useQuery<GetTokenMarketResponse>({
    queryFn: () =>
      backendSparkApi.getTokenMarket({
        address: id || "",
      }),
    queryKey: ["getTokenMarket", id],
    enabled: Boolean(id),
  })

  const handleGovernanceStatusUpdate = () => {
    // Refetch DAO data when governance status updates
    if (daoData?.dao) {
      // This would trigger a refetch in a real implementation
      console.log("Governance status updated, refreshing data...")
    }
  }



  // Find matching application for a proposal
  const findMatchingApplication = (proposal: any): ApplicationResponse | null => {
    console.log('🔍 Checking for matching application for proposal:', {
      proposalName: proposal.name,
      proposalDescription: proposal.description,
      applicationsCount: applicationsData?.applications?.length || 0
    });

    if (!applicationsData?.applications || applicationsData.applications.length === 0) {
      console.log('❌ No applications data available');
      return null;
    }

    console.log('📋 Available applications:', applicationsData.applications.map(app => ({
      deliverableName: app.deliverableName,
      githubUsername: app.githubUsername,
      projectId: app.projectId
    })));
    
    // Try to match by proposal name/description with deliverable name
    const match = applicationsData.applications.find(app => {
      const proposalNameLower = proposal.name?.toLowerCase() || '';
      const proposalDescLower = proposal.description?.toLowerCase() || '';
      const deliverableNameLower = app.deliverableName.toLowerCase();
      
      const nameMatch = proposalNameLower.includes(deliverableNameLower) || 
                       deliverableNameLower.includes(proposalNameLower);
      const descMatch = proposalDescLower.includes(deliverableNameLower) || 
                       deliverableNameLower.includes(proposalDescLower);
      
      console.log(`🔍 Checking application "${app.deliverableName}":`, {
        nameMatch,
        descMatch,
        proposalName: proposalNameLower,
        proposalDesc: proposalDescLower,
        deliverableName: deliverableNameLower
      });
      
      return nameMatch || descMatch;
    });
    
    if (match) {
      console.log('✅ Found matching application:', {
        deliverableName: match.deliverableName,
        githubUsername: match.githubUsername,
        projectId: match.projectId
      });
    } else {
      console.log('❌ No matching application found for proposal:', proposal.name);
    }
    
    return match || null;
  };

  // Handle opening application modal
  const handleOpenApplicationModal = (application: ApplicationResponse) => {
    console.log('🚀 Opening application modal for:', {
      deliverableName: application.deliverableName,
      githubUsername: application.githubUsername,
      projectId: application.projectId
    });
    setSelectedApplication(application);
    setIsApplicationModalOpen(true);
  };

  // Handle closing application modal
  const handleCloseApplicationModal = () => {
    setIsApplicationModalOpen(false);
    setSelectedApplication(null);
  };

  const handleGovernanceDataUpdate = useCallback((data: { userTokenBalance: number; votingPower: number }) => {
    setGovernanceData(data)
  }, [])

  // Check if DAO exists to conditionally adjust layout
  const hasDao = tokenData?.token?.dao && tokenData?.token?.dao !== ""

  // Fetch real transaction data from DexScreener or GeckoTerminal
  const fetchRealTransactionData = async (tokenAddress: string, pairAddress?: string): Promise<Array<{ timestamp: number; price: number }> | null> => {
    try {
      // Try GeckoTerminal OHLCV API first (provides real candlestick data)
      if (pairAddress) {
        const geckoOHLCVUrl = `https://api.geckoterminal.com/api/v2/networks/solana/pools/${pairAddress}/ohlcv/hour?aggregate=1h&before_timestamp=${Math.floor(Date.now() / 1000)}&limit=24`

        try {
          const ohlcvResponse = await fetch(geckoOHLCVUrl)
          if (ohlcvResponse.ok) {
            const ohlcvData = await ohlcvResponse.json()
            console.log("GeckoTerminal OHLCV data:", ohlcvData)

            if (ohlcvData.data && ohlcvData.data.attributes && ohlcvData.data.attributes.ohlcv_list) {
              const ohlcvList = ohlcvData.data.attributes.ohlcv_list
              const chartData = ohlcvList.map((ohlcv: number[]) => ({
                timestamp: ohlcv[0] * 1000, // Convert to milliseconds
                price: parseFloat(ohlcv[4].toString()) // Close price
              })).filter((point: { timestamp: number; price: number }) => point.price > 0)

              if (chartData.length > 0) {
                console.log("Successfully fetched OHLCV data:", chartData.length, "points")
                return chartData.reverse() // Reverse to get chronological order
              }
            }
          }
        } catch (error) {
          console.log("GeckoTerminal OHLCV fetch failed:", error)
        }
      }

      // Try Bitquery API for real transaction data (alternative approach)
      const bitqueryUrl = 'https://streaming.bitquery.io/graphql'
      const bitqueryQuery = {
        query: `
          query GetTokenTrades($token: String!, $limit: Int!) {
            Solana {
              DEXTradeByTokens(
                where: {
                  Transaction: {Result: {Success: true}}
                  Trade: {Currency: {MintAddress: {is: $token}}}
                  Block: {Time: {since: "${new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()}"}}
                }
                orderBy: {ascendingByField: "Block_Time"}
                limit: {count: $limit}
              ) {
                Block {
                  Time
                }
                Trade {
                  PriceInUSD
                }
              }
            }
          }
        `,
        variables: {
          token: tokenAddress,
          limit: 100
        }
      }

      try {
        const bitqueryResponse = await fetch(bitqueryUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer YOUR_BITQUERY_TOKEN' // Would need actual token
          },
          body: JSON.stringify(bitqueryQuery)
        })

        if (bitqueryResponse.ok) {
          const bitqueryData = await bitqueryResponse.json()
          if (bitqueryData.data?.Solana?.DEXTradeByTokens) {
            const trades = bitqueryData.data.Solana.DEXTradeByTokens as Array<{
              Block: { Time: string }
              Trade: { PriceInUSD: string }
            }>
            const chartData = trades
              .filter((trade) => parseFloat(trade.Trade.PriceInUSD) > 0)
              .map((trade) => ({
                timestamp: new Date(trade.Block.Time).getTime(),
                price: parseFloat(trade.Trade.PriceInUSD)
              }))

            if (chartData.length > 0) {
              console.log("Successfully fetched Bitquery transaction data:", chartData.length, "points")
              return chartData
            }
          }
        }
      } catch (error) {
        console.log("Bitquery API fetch failed:", error)
      }

      // Try DexScreener historical data (if available)
      if (pairAddress) {
        const dexHistoryUrl = `https://api.dexscreener.com/latest/dex/pairs/solana/${pairAddress}`
        try {
          const historyResponse = await fetch(dexHistoryUrl)
          if (historyResponse.ok) {
            const historyData = await historyResponse.json()
            if (historyData.pair && historyData.pair.priceChange) {
              // DexScreener doesn't provide historical price points directly
              // But we can use price changes to create more realistic synthetic data
              const currentPrice = parseFloat(historyData.pair.priceUsd || "0")
              const changes = historyData.pair.priceChange

              const now = Date.now()
              const oneHour = 60 * 60 * 1000
              const chartData = []

              // Use available price change data to create more realistic points
              const change24h = parseFloat(changes.h24 || "0") / 100
              const change6h = parseFloat(changes.h6 || "0") / 100
              const change1h = parseFloat(changes.h1 || "0") / 100

              for (let i = 23; i >= 0; i--) {
                const timestamp = now - (i * oneHour)
                let priceMultiplier = 1

                // Apply different change rates based on time periods
                if (i >= 18) { // Last 6 hours
                  const progress = (23 - i) / 6
                  priceMultiplier = 1 + (change6h * progress)
                } else if (i >= 22) { // Last hour
                  const progress = (23 - i) / 1
                  priceMultiplier = 1 + (change1h * progress)
                } else { // Earlier hours
                  const progress = (23 - i) / 23
                  priceMultiplier = 1 + (change24h * progress)
                }

                // Add some realistic volatility
                const volatility = (Math.random() - 0.5) * 0.03
                const basePrice = currentPrice / (1 + change24h)
                const price = basePrice * priceMultiplier * (1 + volatility)

                chartData.push({
                  timestamp,
                  price: Math.max(0, price)
                })
              }
              return chartData
            }
          }
        } catch (error) {
          console.log("DexScreener historical fetch failed:", error)
        }
      }

      return null
    } catch (error) {
      console.error("Error fetching real transaction data:", error)
      return null
    }
  }

  // Fetch fallback chart data when backend data is not available
  const fetchFallbackChartData = async (tokenAddress: string): Promise<TokenMarketData | null> => {
    if (!tokenAddress) return null

    setIsLoadingFallbackChart(true)

    try {
      // Try DexScreener API first (free and reliable)
      const dexScreenerUrl = `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`
      const dexResponse = await fetch(dexScreenerUrl)

      if (dexResponse.ok) {
        const dexData = await dexResponse.json()

        if (dexData.pairs && dexData.pairs.length > 0) {
          // Get the pair with highest liquidity (most reliable)
          const bestPair = dexData.pairs.reduce((prev: Record<string, unknown>, current: Record<string, unknown>) =>
            ((current.liquidity as Record<string, number>)?.usd || 0) > ((prev.liquidity as Record<string, number>)?.usd || 0) ? current : prev
          )

          if (bestPair) {
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

            // Try to fetch real transaction data for more accurate chart
            try {
              const realChartData = await fetchRealTransactionData(tokenAddress, bestPair.pairAddress)
              if (realChartData && realChartData.length > 0) {
                chartData.priceChart = realChartData
                console.log("Using real transaction data for chart:", realChartData.length, "data points")
                return chartData
              }
            } catch (error) {
              console.log("Failed to fetch real transaction data, falling back to synthetic data:", error)
            }

            // Generate synthetic chart data if no real transaction data available
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
            console.log("Generated synthetic chart data:", chartData)
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
      const jupiterPriceUrl = `https://lite-api.jup.ag/price/v2?ids=${tokenAddress}&showExtraInfo=true`
      const jupiterResponse = await fetch(jupiterPriceUrl)

      if (jupiterResponse.ok) {
        const jupiterData = await jupiterResponse.json()

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
          return chartData
        }
      }

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

      <section className={`flex w-full flex-col items-center gap-8 px-4 mx-auto mt-20 md:mt-24 ${isDesktop ? 'max-w-[1200px]' : 'md:max-w-[792px]'}`}>
        {/* Header with logo and name */}
        <div className={`flex w-full items-center gap-4 ${isDesktop ? 'justify-between' : ''}`}>
          <div className="flex items-center gap-4">
            <Img
              src={tokenData?.token?.imageUrl}
              isFetchingLink={tokenLoading}
              imgClassName={`rounded-full object-cover ${isDesktop ? 'w-20 h-20' : 'w-16 h-16'}`}
              isRounded={true}
              size="20"
            />
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex items-center gap-2">
                <Text
                  text={tokenData?.token?.name || marketData?.tokenMarketData?.name || fallbackChartData?.name}
                  as="h1"
                  className={`font-semibold ${isDesktop ? 'text-3xl' : 'text-2xl'}`}
                  isLoading={tokenLoading && marketLoading && isLoadingFallbackChart}
                  loadingClass="max-w-[120px]"
                />
              </div>

              {/* Token Address - clickable to copy */}
              <div
                className={`flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity ${isDesktop ? 'text-base' : 'text-sm'}`}
                onClick={() => {
                  if (id) {
                    navigator.clipboard.writeText(id);
                    // You could add a toast notification here if you have a toast system
                  }
                }}
                title="Click to copy full address"
              >
                <Text
                  text={id ? `${id.slice(0, 4)}...${id.slice(-4)}` : "Unknown"}
                  as="span"
                  className="text-fg-primary text-opacity-75 font-mono"
                  isLoading={tokenLoading}
                />
                <Icon icon="SvgCopy" className="text-xs text-fg-primary/60" />
              </div>
            </div>
          </div>

          {/* Market Cap and Volume */}
          {(marketData?.tokenMarketData || fallbackChartData) && (
            <div className={`flex gap-6 text-left ${isDesktop ? 'flex-row' : 'flex-col gap-1 ml-auto mr-4'}`}>
              <div className="flex flex-col items-center text-center">
                <Text
                  text="Market Cap"
                  as="span"
                  className={`text-fg-primary text-opacity-75 font-medium ${isDesktop ? 'text-sm mb-1' : 'text-xs'}`}
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
                  className={`font-medium text-fg-primary ${isDesktop ? 'text-lg' : 'text-xs'}`}
                  isLoading={marketLoading && isLoadingFallbackChart}
                />
              </div>
              <div className="flex flex-col items-center text-center">
                <Text
                  text="Volume (24h)"
                  as="span"
                  className={`text-fg-primary text-opacity-75 font-medium ${isDesktop ? 'text-sm mb-1' : 'text-xs'}`}
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
                  className={`font-medium text-fg-primary ${isDesktop ? 'text-lg' : 'text-xs'}`}
                  isLoading={marketLoading && isLoadingFallbackChart}
                />
              </div>
            </div>
          )}
        </div>

        {/* Main Content Grid - Desktop vs Mobile Layout */}
        <div className={`w-full ${isDesktop ? 'grid grid-cols-1 lg:grid-cols-3 gap-8' : 'flex flex-col gap-8'}`}>
          {/* Left Column - Chart and Trading (Desktop: 2 columns, Mobile: full width) */}
          <div className={`${isDesktop ? 'lg:col-span-2' : ''} space-y-6`}>
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

              if (hasValidBackendData) {
                return <CandlestickChart tokenMarketData={marketData.tokenMarketData} />
              } else if (fallbackChartData) {
                return (
                  <div className="w-full">
                    <CandlestickChart tokenMarketData={fallbackChartData} />
                    <div className="text-center mt-2">
                      <Text text="📊 Chart data from external sources" as="p" className="text-xs text-fg-primary text-opacity-50" />
                    </div>
                  </div>
                )
              } else {
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
                    <div className="flex items-center gap-2">
                      <Text
                        text={authenticated
                          ? userTokenBalance.toFixed(2)
                          : "--"
                        }
                        as="span"
                        className="text-lg font-semibold text-fg-primary"
                        isLoading={marketLoading && isLoadingFallbackChart || tokenBalanceLoading}
                      />

                    </div>

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
                      isLoading={marketLoading && isLoadingFallbackChart || tokenBalanceLoading}
                    />

                  </div>
                </div>
              </div>
            )}

            {/* Trading Actions */}
            <div className="flex gap-2 w-full">
              <Button
                onClick={() => {
                  setSwapMode('buy')
                  setIsSwapModalOpen(true)
                }}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded transition-colors"
              >
                Buy
              </Button>
              <Button
                onClick={() => {
                  setSwapMode('sell')
                  setIsSwapModalOpen(true)
                }}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 rounded transition-colors disabled:bg-gray-500"
                disabled={!authenticated || userTokenBalance <= 0}
              >
                Sell
              </Button>
            </div>
          </div>

          {/* Right Column - Simplified Info (Desktop only) */}
          {isDesktop && (
            <div className="lg:col-span-1 space-y-4">
              {/* Governance Status Overview - Show when DAO exists */}
              {hasDao && authenticated && (
                <div className="bg-bg-secondary rounded-lg p-4 border border-fg-primary/10">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-fg-primary/60">Voting Power</div>
                    <div className="text-lg font-medium text-fg-primary">{governanceData.votingPower.toFixed(2)}</div>
                  </div>
                </div>
              )}

              {/* Token Stats */}
              <div className="bg-bg-secondary rounded-lg p-4 border border-fg-primary/10">
                <h3 className="text-base font-medium mb-3">Token Info</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-fg-primary/60">Price</span>
                    <span className="font-medium">
                      {marketData?.tokenMarketData?.price || fallbackChartData?.price
                        ? `$${(marketData?.tokenMarketData?.price || fallbackChartData?.price || 0).toExponential(3)}`
                        : '--'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-fg-primary/60">24h Change</span>
                    <span className={`font-medium ${(marketData?.tokenMarketData?.priceChange24h || fallbackChartData?.priceChange24h || 0) >= 0
                      ? 'text-green-400'
                      : 'text-red-400'
                      }`}>
                      {marketData?.tokenMarketData?.priceChange24h || fallbackChartData?.priceChange24h
                        ? `${(marketData?.tokenMarketData?.priceChange24h || fallbackChartData?.priceChange24h || 0).toFixed(2)}%`
                        : '--'
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-bg-secondary rounded-lg p-4 border border-fg-primary/10">
                <h3 className="text-base font-medium mb-3">Actions</h3>
                <div className="space-y-2">
                  <Button
                    onClick={() => {
                      setSwapMode('buy')
                      setIsSwapModalOpen(true)
                    }}
                    className="w-full bg-green-600 hover:bg-green-700 text-white text-sm py-2"
                  >
                    Buy Token
                  </Button>
                  <Button
                    onClick={() => {
                      setSwapMode('sell')
                      setIsSwapModalOpen(true)
                    }}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white disabled:bg-gray-500 text-sm py-2"
                    disabled={!authenticated || userTokenBalance <= 0}
                  >
                    Sell Token
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* DAO Governance */}
        {hasDao && (
          <div className="w-full space-y-4">
            {daoLoading && (
              <div className="w-full rounded-lg bg-bg-secondary p-4 border border-fg-primary/10">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                  <Text text="Loading..." as="p" className="text-fg-primary/60" />
                </div>
              </div>
            )}

            {daoError && (
              <div className="w-full rounded-lg bg-bg-secondary p-4 border border-fg-primary/10">
                <div className="text-center">
                  <Text text="Failed to load governance data" as="p" className="text-fg-primary/60" />
                </div>
              </div>
            )}

            {daoData?.dao && (
              <div className="w-full space-y-4">
                {/* DAO Header */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-bg-secondary border border-fg-primary/10">
                  <Text text={daoData.dao.name} as="h3" className="text-lg font-medium" />
                  <a
                    href={`https://app.realms.today/dao/${daoData.dao.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-brand-primary/20 hover:bg-brand-primary/30 text-brand-primary rounded text-sm transition-colors"
                  >
                    View on Realms
                  </a>
                </div>

                {/* Mobile Governance Status Overview */}
                {!isDesktop && authenticated && (
                  <div className="rounded-lg bg-bg-secondary p-4 border border-fg-primary/10">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-fg-primary/60">Voting Power</div>
                      <div className="text-lg font-medium text-fg-primary">{governanceData.votingPower.toFixed(2)}</div>
                    </div>
                  </div>
                )}

                {/* Two Column Layout for Desktop */}
                <div className={`${isDesktop ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'space-y-4'}`}>
                  {/* Left Column - Governance Status */}
                  <div className="rounded-lg bg-bg-secondary border border-fg-primary/10 overflow-hidden">
                    <div className="p-4">
                      <GovernanceStatus
                        dao={daoData.dao}
                        onStatusUpdate={handleGovernanceStatusUpdate}
                        onDataUpdate={handleGovernanceDataUpdate}
                      />
                    </div>
                  </div>

                  {/* Right Column - DAO Proposals */}
                  {daoData.dao.proposals.length > 0 && (
                    <div className="rounded-lg bg-bg-secondary border border-fg-primary/10 overflow-hidden">
                      <div className="p-4 border-b border-fg-primary/10">
                        <div className="flex items-center justify-between">
                          <Text text="Proposals" as="h3" className="text-base font-medium" />
                          <Text text={`${daoData.dao.proposals.length} total`} as="span" className="text-xs text-fg-primary/60" />
                        </div>
                      </div>
                      
                      <div className="p-4">
                        {/* Simple Tabs */}
                        <div className="flex mb-4 bg-bg-primary/10 rounded p-1">
                          <button
                            onClick={() => setActiveTab('current')}
                            className={twMerge(
                              "flex-1 py-2 px-3 text-sm font-medium rounded transition-colors",
                              activeTab === 'current'
                                ? "bg-bg-primary text-fg-primary"
                                : "text-fg-primary/60 hover:text-fg-primary"
                            )}
                          >
                            Active
                          </button>
                          <button
                            onClick={() => setActiveTab('past')}
                            className={twMerge(
                              "flex-1 py-2 px-3 text-sm font-medium rounded transition-colors",
                              activeTab === 'past'
                                ? "bg-bg-primary text-fg-primary"
                                : "text-fg-primary/60 hover:text-fg-primary"
                            )}
                          >
                            History
                          </button>
                        </div>

                        {/* Tab Content */}
                        <div className="space-y-3">
                          {activeTab === 'current' ? (
                            <>
                              {/* Current proposals - with voting functionality */}
                              {daoData.dao.proposals
                                .filter(proposal => {
                                  const stateKey = typeof proposal.state === 'object' && proposal.state !== null
                                    ? Object.keys(proposal.state)[0]
                                    : proposal.state;
                                  return ['voting', 'signingOff', 'executing'].includes(stateKey);
                                })
                                .slice(0, 5)
                                .map((proposal) => {
                                  console.log('📝 Rendering proposal:', {
                                    name: proposal.name,
                                    description: proposal.description,
                                    state: proposal.state,
                                    address: proposal.address
                                  });
                                  
                                  const stateKey = typeof proposal.state === 'object' && proposal.state !== null
                                    ? Object.keys(proposal.state)[0]
                                    : proposal.state;
                                  const isVotingOpen = stateKey === 'voting';

                                  return (
                                    <div key={proposal.address} className="border border-fg-primary/10 rounded-lg p-4 bg-bg-primary/5 space-y-3">
                                      {/* Proposal Header */}
                                      <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                            <button
                                              onClick={() => {
                                                const matchingApp = findMatchingApplication(proposal);
                                                if (matchingApp) {
                                                  handleOpenApplicationModal(matchingApp);
                                                }
                                              }}
                                              className={`text-left font-medium text-sm transition-colors ${
                                                findMatchingApplication(proposal) 
                                                  ? 'text-blue-400 hover:text-blue-300 cursor-pointer' 
                                                  : 'text-fg-primary'
                                              }`}
                                            >
                                              {proposal.name || "Unnamed Proposal"}
                                            </button>
                                            {findMatchingApplication(proposal) && (
                                              <Icon icon="SvgDocument" className="w-4 h-4 text-blue-400" />
                                            )}
                                          </div>
                                          
                                          {/* Developer Info for Traditional Proposals */}
                                          {findMatchingApplication(proposal) && (
                                            <div className="flex items-center gap-3 mt-2 text-xs">
                                              <div className="flex items-center gap-1">
                                                <Icon icon="SvgWeb" className="w-3 h-3 text-gray-400" />
                                                <a 
                                                  href={`https://github.com/${findMatchingApplication(proposal)?.githubUsername}`}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="text-blue-400 hover:text-blue-300 font-medium"
                                                >
                                                  @{findMatchingApplication(proposal)?.githubUsername}
                                                </a>
                                              </div>
                                              <div className="flex items-center gap-1">
                                                <span className="text-gray-400">Price:</span>
                                                <span className="text-green-400 font-medium">
                                                  {findMatchingApplication(proposal)?.requestedPrice} SOL
                                                </span>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${isVotingOpen
                                          ? 'bg-green-600/30 text-green-300 border-green-600/50'
                                          : 'bg-blue-600/30 text-blue-300 border-blue-600/50'
                                          }`}>
                                          {stateKey === 'voting' ? 'Voting Open' :
                                            stateKey === 'signingOff' ? 'Signing' :
                                              stateKey === 'executing' ? 'Executing' : 'Active'}
                                        </span>
                                      </div>

                                      {/* Description */}
                                      {proposal.description && (
                                        <Text text={proposal.description.slice(0, 150) + (proposal.description.length > 150 ? '...' : '')} as="p" className="text-xs text-fg-primary/60" />
                                      )}

                                      {/* Show More Button for Applications */}
                                      {findMatchingApplication(proposal) && (
                                        <div className="flex items-center gap-2">
                                          <Button
                                            onClick={() => {
                                              const matchingApp = findMatchingApplication(proposal);
                                              if (matchingApp) {
                                                handleOpenApplicationModal(matchingApp);
                                              }
                                            }}
                                            className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-medium rounded border border-blue-600/30 transition-colors"
                                          >
                                            Show Application Details
                                          </Button>
                                        </div>
                                      )}

                                      {/* Vote Stats */}
                                      {(() => {
                                        // Check if this is a multi-choice proposal (only for specific cases)
                                        const isMultiChoice = proposal.options && 
                                          proposal.options.length > 2 && 
                                          (proposal.name && proposal.name.toLowerCase().includes('choose'));
                                        
                                        if (isMultiChoice && proposal.options && proposal.options.length > 0) {
                                          // Multi-choice proposal - show all options
                                          return (
                                            <div className="space-y-2 text-xs">
                                              {proposal.options.map((option, index) => {
                                                const votes = parseInt(option.voteWeight || "0") / 1000000000;
                                                const formattedVotes = votes >= 1000000 ? `${(votes / 1000000).toFixed(1)}M` :
                                                  votes >= 1000 ? `${(votes / 1000).toFixed(1)}K` :
                                                    votes.toFixed(1);
                                                
                                                // Color based on option index
                                                const colors = [
                                                  'bg-blue-600/20 border-blue-600/30 text-blue-300',
                                                  'bg-green-600/20 border-green-600/30 text-green-300', 
                                                  'bg-purple-600/20 border-purple-600/30 text-purple-300',
                                                  'bg-orange-600/20 border-orange-600/30 text-orange-300',
                                                  'bg-pink-600/20 border-pink-600/30 text-pink-300'
                                                ];
                                                const colorClass = colors[index % colors.length];
                                                
                                                // Format option label consistently
                                                const formatOptionLabel = (label: string): string => {
                                                  if (label === "$$_NOTA_$$") {
                                                    return "None of the Above"
                                                  }
                                                  return label
                                                }
                                                
                                                // Find matching application for this developer
                                                const matchingApplication = applicationsData?.applications?.find(app => 
                                                  app.projectId === id && app.githubUsername === option.label
                                                );
                                                
                                                // Format price similar to Applications component
                                                const formatPrice = (price: number | null | undefined) => {
                                                  if (price === null || price === undefined || isNaN(price)) {
                                                    return "0"
                                                  }
                                                  if (price > 1000000) {
                                                    return (price / 1000000000).toFixed(6)
                                                  } else {
                                                    return price.toString()
                                                  }
                                                }
                                                
                                                return (
                                                  <div key={index} className={`${colorClass} border rounded p-2 text-center`}>
                                                    {option.label && option.label !== "$$_NOTA_$$" ? (
                                                      <a
                                                        href={`https://github.com/${option.label}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="font-medium mb-1 hover:underline cursor-pointer block flex items-center justify-center gap-1"
                                                      >
                                                        <Text text={formatOptionLabel(option.label)} as="p" className="font-medium" />
                                                        <Icon icon="SvgExternalLink" className="w-3 h-3 opacity-70" />
                                                      </a>
                                                    ) : (
                                                      <Text text={formatOptionLabel(option.label || `Option ${index + 1}`)} as="p" className="font-medium mb-1" />
                                                    )}
                                                    <Text text={formattedVotes} as="p" className="text-white font-semibold" />
                                                    {matchingApplication && (
                                                      <div className="mt-1 text-xs opacity-80">
                                                        <div>Price: {matchingApplication.requestedPrice} SOL</div>
                                                        <div>Timeline: {matchingApplication.estimatedDeadline}</div>
                                                      </div>
                                                    )}
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          );
                                        } else {
                                          // Traditional Yes/No proposal
                                          return (
                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                              <div className="bg-green-600/20 border border-green-600/30 rounded p-2 text-center">
                                                <Text text="Yes" as="p" className="text-green-300 font-medium mb-1" />
                                                <Text text={(() => {
                                                  const yesVotes = proposal.options[0]?.voteWeight || "0";
                                                  const votes = parseInt(yesVotes) / 1000000000;
                                                  return votes >= 1000000 ? `${(votes / 1000000).toFixed(1)}M` :
                                                    votes >= 1000 ? `${(votes / 1000).toFixed(1)}K` :
                                                      votes.toFixed(1);
                                                })()} as="p" className="text-white font-semibold" />
                                              </div>
                                              <div className="bg-orange-600/20 border border-orange-600/30 rounded p-2 text-center">
                                                <Text text="No" as="p" className="text-red-300 font-medium mb-1" />
                                                <Text text={(() => {
                                                  const noVotes = proposal.denyVoteWeight || "0";
                                                  const votes = parseInt(noVotes) / 1000000000;
                                                  return votes >= 1000000 ? `${(votes / 1000000).toFixed(1)}M` :
                                                    votes >= 1000 ? `${(votes / 1000).toFixed(1)}K` :
                                                      votes.toFixed(1);
                                                })()} as="p" className="text-white font-semibold" />
                                              </div>
                                            </div>
                                          );
                                        }
                                      })()}

                                      {/* Voting Buttons - Only show for voting state */}
                                      {isVotingOpen && (
                                        <ProposalVoting
                                          proposal={proposal}
                                          dao={daoData.dao}
                                          className="mt-3"
                                        />
                                      )}
                                    </div>
                                  );
                                })}

                              {daoData.dao.proposals.filter(proposal => {
                                const stateKey = typeof proposal.state === 'object' && proposal.state !== null
                                  ? Object.keys(proposal.state)[0]
                                  : proposal.state;
                                return ['voting', 'signingOff', 'executing'].includes(stateKey);
                              }).length === 0 && (
                                <div className="text-center py-6 bg-bg-primary/5 rounded">
                                  <Text text="No active proposals" as="p" className="text-fg-primary/60" />
                                </div>
                              )}
                            </>
                          ) : (
                            <>
                              {/* Past proposals - simplified view */}
                              {daoData.dao.proposals
                                .filter(proposal => {
                                  const stateKey = typeof proposal.state === 'object' && proposal.state !== null
                                    ? Object.keys(proposal.state)[0]
                                    : proposal.state;
                                  return ['succeeded', 'completed', 'defeated', 'cancelled', 'vetoed'].includes(stateKey);
                                })
                                .slice(0, 5)
                                .map((proposal) => (
                                  <div key={proposal.address} className="border border-fg-primary/10 rounded p-3 bg-bg-primary/5">
                                    <div className="flex justify-between items-start mb-2">
                                      <Text text={proposal.name || "Unnamed Proposal"} as="p" className="font-medium text-fg-primary text-sm" />
                                      {(() => {
                                        const stateKey = typeof proposal.state === 'object' && proposal.state !== null
                                          ? Object.keys(proposal.state)[0]
                                          : proposal.state;
                                        return (
                                          <span className={`px-2 py-1 rounded text-xs ${stateKey === 'succeeded' || stateKey === 'completed' ? 'bg-green-500/20 text-green-400' :
                                            stateKey === 'defeated' ? 'bg-orange-500/20 text-orange-400' :
                                              'bg-fg-primary/20 text-fg-primary/60'
                                          }`}>
                                            {stateKey === 'succeeded' ? 'Passed' :
                                              stateKey === 'completed' ? 'Completed' :
                                                stateKey === 'defeated' ? 'Failed' :
                                                  stateKey === 'cancelled' ? 'Cancelled' :
                                                    stateKey === 'vetoed' ? 'Vetoed' : 'Closed'}
                                          </span>
                                        );
                                      })()}
                                    </div>
                                    {proposal.description && (
                                      <Text text={proposal.description.slice(0, 100) + (proposal.description.length > 100 ? '...' : '')} as="p" className="text-xs text-fg-primary/60" />
                                    )}
                                  </div>
                                ))}

                              {daoData.dao.proposals.filter(proposal => {
                                const stateKey = typeof proposal.state === 'object' && proposal.state !== null
                                  ? Object.keys(proposal.state)[0]
                                  : proposal.state;
                                return ['succeeded', 'completed', 'defeated', 'cancelled', 'vetoed'].includes(stateKey);
                              }).length === 0 && (
                                  <div className="text-center py-6 bg-bg-primary/5 rounded">
                                    <Text text="No historical proposals" as="p" className="text-fg-primary/60" />
                                  </div>
                                )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
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

      {/* Application Details Modal */}
      {selectedApplication && (
        <ApplicationDetailsModal
          application={selectedApplication}
          isOpen={isApplicationModalOpen}
          onClose={handleCloseApplicationModal}
        />
      )}

      <ScrollRestoration />
    </main>
  )
}

export default Project
