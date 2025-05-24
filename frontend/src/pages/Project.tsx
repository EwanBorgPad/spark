import { ScrollRestoration } from "react-router-dom"
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

const Project = () => {
  const { id } = useParams()
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


  return (
    <main className="z-[10] flex w-full max-w-full select-none flex-col items-center gap-4 overflow-y-hidden py-[72px] font-normal text-fg-primary md:py-[100px]">
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
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Text
                text={tokenData?.token?.name || marketData?.tokenMarketData?.name}
                as="h1"
                className="font-semibold"
                isLoading={tokenLoading && marketLoading}
                loadingClass="max-w-[120px]"
              />
              {marketData?.tokenMarketData?.symbol && (
                <span className="px-2 py-1 bg-bg-primary/10 rounded text-sm font-medium text-fg-primary text-opacity-75">
                  {marketData.tokenMarketData.symbol}
                </span>
              )}
            </div>
            <Text
              text={tokenData?.token?.dao || `Token Address: ${id?.slice(0, 8)}...${id?.slice(-8)}`}
              as="span"
              className="text-fg-primary text-opacity-75 font-mono text-sm"
              isLoading={tokenLoading}
            />
            {marketData?.tokenMarketData?.price && (
              <div className="flex items-center gap-2 mt-1">
                <Text
                  text={`$${marketData.tokenMarketData.price < 0.001 
                    ? marketData.tokenMarketData.price.toExponential(3)
                    : marketData.tokenMarketData.price.toFixed(marketData.tokenMarketData.price < 1 ? 6 : 4)
                  }`}
                  as="span"
                  className="font-semibold text-lg"
                  isLoading={marketLoading}
                />
                <span className={`text-sm font-medium ${
                  marketData.tokenMarketData.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {marketData.tokenMarketData.priceChange24h >= 0 ? '+' : ''}
                  {marketData.tokenMarketData.priceChange24h.toFixed(2)}%
                </span>
              </div>
            )}
          </div>
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

        {/* Description */}
        <div className="w-full">
          <Text
            text="Project details coming soon. Check back later for more information."
            as="p"
            className="text-fg-primary text-opacity-90"
            isLoading={tokenLoading}
          />
        </div>

        {/* Token Stats */}
        {marketData?.tokenMarketData ? (
          <TokenStats 
            tokenMarketData={marketData.tokenMarketData} 
            isLoading={marketLoading}
          />
        ) : (
          <div className="w-full rounded-lg bg-bg-secondary p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Text text="Market Cap" as="h3" className="text-fg-primary text-opacity-75" />
                <Text 
                  text={marketLoading ? "Loading..." : "N/A"} 
                  as="p" 
                  className="font-semibold" 
                  isLoading={marketLoading} 
                />
              </div>
              <div>
                <Text text="Token Price" as="h3" className="text-fg-primary text-opacity-75" />
                <Text 
                  text={marketLoading ? "Loading..." : "N/A"} 
                  as="p" 
                  className="font-semibold" 
                  isLoading={marketLoading} 
                />
              </div>
            </div>
          </div>
        )}

        {/* DAO Info */}
        {tokenData?.token?.dao && tokenData?.token?.dao !== "" && (
          <div className="w-full space-y-4">
            <Text text="DAO Information" as="h2" className="text-xl font-semibold" />

            {daoLoading && (
              <div className="w-full rounded-lg bg-bg-secondary p-4">
                <Text text="Loading DAO information..." as="p" className="text-fg-primary text-opacity-75" />
              </div>
            )}

            {daoError && (
              <div className="w-full rounded-lg bg-bg-secondary p-4 border border-red-500/20">
                <Text text="Failed to load DAO information" as="p" className="text-red-400" />
                <Text text={daoError?.message || "Unknown error"} as="p" className="text-sm text-fg-primary text-opacity-75 mt-2" />
              </div>
            )}

            {daoData?.dao && (
              <div className="w-full space-y-4">
                {/* DAO Overview */}
                <div className="rounded-lg bg-bg-secondary p-4">
                  <div className="space-y-3">
                    <div>
                      <Text text="DAO Name" as="h3" className="text-fg-primary text-opacity-75 text-sm" />
                      <Text text={daoData.dao.name} as="p" className="font-semibold" />
                    </div>
                    <a href={`https://app.realms.today/dao/${daoData.dao.address}`} target="_blank" rel="noopener noreferrer">
                      <Text text="View on Realms.today" as="p" className="text-fg-primary text-opacity-75 text-sm underline text-blue-500" />
                    </a>

                    <div>
                      <Text text="Description" as="h3" className="text-fg-primary text-opacity-75 text-sm" />
                      <Text text={daoData.dao.description} as="p" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Text text="Version" as="h3" className="text-fg-primary text-opacity-75 text-sm" />
                        <Text text={daoData.dao.version} as="p" className="font-semibold" />
                      </div>
                      <div>
                        <Text text="Proposals" as="h3" className="text-fg-primary text-opacity-75 text-sm" />
                        <Text text={daoData.dao.proposalCount.toString()} as="p" className="font-semibold" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Governance Accounts */}
                {daoData.dao.governances.length > 0 && (
                  <div className="rounded-lg bg-bg-secondary p-4">
                    <Text text="Governance Accounts" as="h3" className="font-semibold mb-3" />
                    <div className="space-y-2">
                      {daoData.dao.governances.map((governance, index) => (
                        <div key={governance.address} className="border border-fg-primary/10 rounded p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <Text text={`Governance #${index + 1}`} as="p" className="font-medium" />
                              <Text text={`${governance.address.slice(0, 8)}...${governance.address.slice(-8)}`} as="p" className="text-sm text-fg-primary text-opacity-75 font-mono" />
                            </div>
                            <div className="text-right">
                              <Text text="Active Proposals" as="p" className="text-xs text-fg-primary text-opacity-75" />
                              <Text text={governance.activeProposalCount.toString()} as="p" className="font-semibold" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Proposals */}
                {daoData.dao.proposals.length > 0 && (
                  <div className="rounded-lg bg-bg-secondary p-4">
                    <Text text="Recent Proposals" as="h3" className="font-semibold mb-3" />
                    <div className="space-y-3">
                      {daoData.dao.proposals.slice(0, 5).map((proposal) => (
                        <div key={proposal.address} className="border border-fg-primary/10 rounded p-3">
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <Text text={proposal.name || "Unnamed Proposal"} as="p" className="font-medium" />
                              {(() => {
                                // Handle proposal state as object (Solana enum format)
                                const stateKey = typeof proposal.state === 'object' && proposal.state !== null
                                  ? Object.keys(proposal.state)[0]
                                  : proposal.state;
                                const stateDisplay = typeof stateKey === 'string'
                                  ? stateKey.charAt(0).toUpperCase() + stateKey.slice(1)
                                  : 'Unknown';

                                return (
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${stateKey === 'voting' ? 'bg-blue-500/20 text-blue-400' :
                                      stateKey === 'succeeded' ? 'bg-green-500/20 text-green-400' :
                                        stateKey === 'completed' ? 'bg-purple-500/20 text-purple-400' :
                                          stateKey === 'defeated' ? 'bg-red-500/20 text-red-400' :
                                            stateKey === 'draft' ? 'bg-yellow-500/20 text-yellow-400' :
                                              stateKey === 'signingOff' ? 'bg-orange-500/20 text-orange-400' :
                                                stateKey === 'executing' ? 'bg-indigo-500/20 text-indigo-400' :
                                                  stateKey === 'cancelled' ? 'bg-gray-500/20 text-gray-400' :
                                                    stateKey === 'vetoed' ? 'bg-red-600/20 text-red-300' :
                                                      'bg-gray-500/20 text-gray-400'
                                    }`}>
                                    {stateDisplay}
                                  </span>
                                );
                              })()}
                            </div>

                            {proposal.description && (
                              <Text text={proposal.description} as="p" className="text-sm text-fg-primary text-opacity-75" />
                            )}

                            <Text text={`${proposal.address.slice(0, 8)}...${proposal.address.slice(-8)}`} as="p" className="text-xs text-fg-primary text-opacity-50 font-mono" />
                          </div>
                        </div>
                      ))}

                      {daoData.dao.proposals.length > 5 && (
                        <Text text={`... and ${daoData.dao.proposals.length - 5} more proposals`} as="p" className="text-sm text-fg-primary text-opacity-75 text-center" />
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      <ScrollRestoration />
    </main>
  )
}

export default Project
