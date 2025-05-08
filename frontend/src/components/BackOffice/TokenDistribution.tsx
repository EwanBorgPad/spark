import React, { useMemo, useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useWalletContext } from "@/hooks/useWalletContext"
import { GetProjectsProjectResponse, GetProjectsResponse } from "shared/models"
import { backendApi } from "@/data/api/backendApi"
import { toast } from "react-toastify"
import { Button } from "../Button/Button"
import { useProjectStatusUtils } from "./ProjectStatus/useProjectStatusUtils"
import { formatCurrencyAmount } from "shared/utils/format"
import { UpcomingProjectCard } from "./ProjectStatus/UpcomingProjectCard"

type TokenDistributionData = {
  fromAddress: string
  totalAmountDeposited: number
  lastDepositDate: string
  depositCount: number
}

const TokenDistribution = () => {
  const { address, signMessage, signTransaction, walletProvider, isWalletConnected } = useWalletContext()
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0)

  const { data, refetch, isLoading: isLoadingProjects } = useQuery<GetProjectsResponse>({
    queryFn: () => backendApi.getProjects({ page: 1, limit: 999 }),
    queryKey: ["getProjects", "all"],
  })

  const upcomingProjects = useMemo(() => {
    if (!data?.projects) return []

    const now = new Date()

    return data.projects
      .filter(project => {
        const saleOpensEvent = project.info.timeline.find(event => event.id === "SALE_CLOSES")
        return saleOpensEvent &&
          saleOpensEvent.date &&
          new Date(saleOpensEvent.date) > now
      })
      .sort((a, b) => {
        const aDate = new Date(a.info.timeline.find(event => event.id === "SALE_OPENS")?.date || 0)
        const bDate = new Date(b.info.timeline.find(event => event.id === "SALE_OPENS")?.date || 0)
        return bDate.getTime() - aDate.getTime()
      })
  }, [data])

  const nextProjectToGoLive = useMemo(() => {
    return upcomingProjects[currentProjectIndex] || null
  }, [upcomingProjects, currentProjectIndex])

  const { data: saleData, isLoading: isLoadingSaleResults } = useQuery({
    queryFn: async () => {
      if (!nextProjectToGoLive?.id) return null
      return await backendApi.getSaleResults({
        projectId: nextProjectToGoLive.id,
      })
    },
    queryKey: ["saleResults", nextProjectToGoLive?.id],
    enabled: Boolean(nextProjectToGoLive?.id),
    staleTime: 30 * 1000,
  })

  const { formatDate } = useProjectStatusUtils()

  const { data: tokenDistributionData, isLoading: isLoadingDistribution } = useQuery({
    queryFn: () => {
      if (!nextProjectToGoLive?.id) return null
      return backendApi.getTokenDistribution({ projectId: nextProjectToGoLive.id })
    },
    queryKey: ["getTokenDistribution", nextProjectToGoLive?.id],
    enabled: !!nextProjectToGoLive?.id
  })

  const { mutate: distributeTokens, isPending: isDistributing } = useMutation({
    mutationFn: async () => {
      if (!nextProjectToGoLive?.id) throw new Error("No project selected")
      const message = "I confirm I am an admin by signing this message."
      const signature = Array.from(await signMessage(message))
      const auth = { address, message, signature }
      return backendApi.distributeTokens({ projectId: nextProjectToGoLive.id, auth })
    },
    onSuccess: () => {
      toast.success("Tokens distributed successfully!")
      refetch()
    },
    onError: (error) => {
      toast.error(error.message || "Failed to distribute tokens")
    }
  })

  const goToNextProject = () => {
    if (currentProjectIndex < upcomingProjects.length - 1) {
      setCurrentProjectIndex(currentProjectIndex + 1)
    }
  }

  const goToPreviousProject = () => {
    if (currentProjectIndex > 0) {
      setCurrentProjectIndex(currentProjectIndex - 1)
    }
  }

  const totalTokensPerUSDC = nextProjectToGoLive ? Number(nextProjectToGoLive.config.totalTokensForLiquidityPool) / Number(nextProjectToGoLive.config.raiseTargetInUsd) : 0
  const totalAmountRaised = saleData ? Number(saleData.totalAmountRaised.amountInUsd) : 0
  const totalTokensToDistribute = totalAmountRaised * totalTokensPerUSDC

  return (
    <main className="z-[10] flex h-full w-full max-w-full flex-col items-center gap-10 py-[100px] font-normal text-fg-primary lg:py-[20px]">
      <div className="flex w-full max-w-3xl justify-between items-center">
        <h1 className="text-center text-2xl font-semibold mx-auto">Token Distribution</h1>
        <Button
          btnText={isLoadingProjects ? "Refreshing..." : "Refresh Data"}
          size="sm"
          onClick={() => refetch()}
          disabled={isLoadingProjects}
          className="ml-4"
        />
      </div>

      {nextProjectToGoLive && (
        <UpcomingProjectCard
          nextProjectToGoLive={nextProjectToGoLive}
          currentProjectIndex={currentProjectIndex}
          upcomingProjects={upcomingProjects}
          goToPreviousProject={goToPreviousProject}
          goToNextProject={goToNextProject}
          selectProject={() => { }}
          formatDate={formatDate}
          showSelectButton={false}
          customFields={[
            {
              label: "Project",
              value: nextProjectToGoLive.info.title
            },
            {
              label: "Rewards Distribution Opens",
              value: (() => {
                const rewardDistributionEvent = nextProjectToGoLive.info.timeline.find(event => event.id === "REWARD_DISTRIBUTION")
                return rewardDistributionEvent?.date ? formatDate(rewardDistributionEvent.date) : "Not yet open"
              })()
            },
            {
              label: "Tokens per USDC",
              value: formatCurrencyAmount(totalTokensPerUSDC)
            },
            {
              label: "Total Amount Raised",
              value: `$${formatCurrencyAmount(totalAmountRaised)}`
            },
            {
              label: "Total Tokens to distribute",
              value: formatCurrencyAmount(totalTokensToDistribute)
            }
          ]}
        />
      )}

      {tokenDistributionData?.data && (
        <div className="w-full max-w-3xl">
          <h2 className="text-xl font-semibold mb-4">Token Distribution List</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-bg-secondary">
                  <th className="text-left p-1">Address</th>
                  <th className="text-left p-1">Total Amount Invested</th>
                  <th className="text-left p-1">Tokens to Receive</th>
                  <th className="text-left p-1">Last Deposit</th>
                </tr>
              </thead>
              <tbody>
                {tokenDistributionData.data.map((item: TokenDistributionData) => (
                  <tr key={item.fromAddress} className="border-b border-bg-secondary hover:bg-bg-tertiary">
                    <td className="p-1">
                      {`${item.fromAddress.slice(0, 4)}...${item.fromAddress.slice(-4)}`}
                    </td>
                    <td className="p-1">${formatCurrencyAmount(item.totalAmountDeposited)}</td>
                    <td className="p-1">{formatCurrencyAmount(item.totalAmountDeposited * totalTokensPerUSDC)}</td>
                    <td className="p-1">
                      {new Date(item.lastDepositDate).toLocaleString('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {nextProjectToGoLive && (
        <div className="w-full max-w-3xl flex justify-end">
          <Button
            btnText={isDistributing ? "Distributing..." : "Distribute Tokens"}
            size="md"
            onClick={() => distributeTokens()}
            disabled={!isWalletConnected || isDistributing}
          />
        </div>
      )}
    </main>
  )
}

export default TokenDistribution
