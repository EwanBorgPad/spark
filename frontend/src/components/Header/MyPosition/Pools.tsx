import React from "react"
import { MyPositionTabId } from "@/@types/frontend"
import Img from "../../Image/Img"
import { useQuery } from "@tanstack/react-query"
import { userApi } from "@/data/userApi"
import { useWalletContext } from "@/hooks/useWalletContext"
import { UserInvestmentByProjects } from "shared/types/user-types"
import { getProjectRoute } from "@/utils/routes"
import { isAfter } from "date-fns"
import { formatCurrencyAmount } from "shared/utils/format"

const Pools = () => {
  const { address, truncatedAddress, signOut, walletProvider, isWalletConnected } = useWalletContext()

  const { data, isLoading } = useQuery({
    queryFn: () => userApi.getUsersInvestments({ address }),
    queryKey: ["getUsersInvestments", address],
    enabled: isWalletConnected,
    refetchOnMount: false,
  })
  // console.log(data.length)
  const investments = data?.investments
  const totalInvestmentsValue = data?.sumInvestments
    ? formatCurrencyAmount(data.sumInvestments, {
      withDollarSign: true,
      customDecimals: 2,
    })
    : 0

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col items-start">
        <span className="text-sm text-fg-tertiary">Total Invested</span>
        <span className="text-4xl font-semibold text-fg-primary">{totalInvestmentsValue}</span>
      </div>
      <div className="flex max-h-[500px] w-full flex-col items-start overflow-y-auto">
        <span className="text-sm text-fg-tertiary">Investments</span>
        {investments?.map((investment) => <InvestedAsset key={investment.projectId} investment={investment} />)}
      </div>
    </div>
  )
}

const InvestedAsset = ({
  investment: { project, projectId, totalInvestmentInUSD },
}: {
  investment: UserInvestmentByProjects
}) => {
  const saleOverDate = project.info.timeline.find((phase) => phase.id === "SALE_CLOSES")?.date
  const displayRewardsAvailable = saleOverDate ? isAfter(new Date(), saleOverDate) : false
  const projectUrl = `${window.location.origin}${getProjectRoute(project)}`
  const totalInvestmentValue = formatCurrencyAmount(totalInvestmentInUSD, {
    withDollarSign: true,
    maxDecimals: 1,
    minDecimals: 1,
  })

  return (
    <div className="flex w-full items-center justify-between gap-4 py-3">
      <div className="flex w-full items-center gap-4">
        <Img isRounded src={project.info.logoUrl} size="6" />
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium text-fg-primary">{project.info.title}</span>
          {displayRewardsAvailable && (
            <a href={projectUrl} target="_blank" rel="noopener noreferrer">
              <span className="text-sm text-brand-primary underline">Rewards available</span>
            </a>
          )}
        </div>
      </div>
      <span className="text-fg-primary">{totalInvestmentValue}</span>
    </div>
  )
}

export default Pools
