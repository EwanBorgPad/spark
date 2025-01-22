import { twMerge } from "tailwind-merge"

import { ExternalLink } from "@/components/Button/ExternalLink"
import { formatDateForDisplay } from "@/utils/date-helpers"
import Accordion from "@/components/Accordion/Accordion"
import { formatCurrencyAmount } from "shared/utils/format"
import { useQuery } from "@tanstack/react-query"
import { backendApi } from "@/data/backendApi.ts"
import { useWalletContext } from "@/hooks/useWalletContext.tsx"
import { useParams } from "react-router-dom"
import { useProjectDataContext } from "@/hooks/useProjectData.tsx"
import Img from "@/components/Image/Img.tsx"


const MAX_ACCORDION_CONTAINER_HEIGHT = 317


type PastOrdersProps = {
  label?: string
  className?: string
}
export const PastOrders = ({ label, className }: PastOrdersProps) => {
  const { address } = useWalletContext()
  const { projectId } = useParams()
  const { projectData } = useProjectDataContext()

  const baseCurrency = projectData?.config.raisedTokenData.coinGeckoName
  const targetCurrency = "usd"
  const { data } = useQuery({
    queryFn: () =>
      backendApi.getExchange({
        baseCurrency,
        targetCurrency,
      }),
    queryKey: ["getExchange", baseCurrency, targetCurrency],
    enabled: Boolean(baseCurrency),
  })
  const raisedTokenPriceInUsd = data?.currentPrice || 0

  const { data: getDepositsData } = useQuery({
    queryFn: () => {
      if (!address || !projectId) return
      return backendApi.getDeposits({
        address, projectId,
      })
    },
    queryKey: ["getDeposits", address, projectId],
    enabled: Boolean(address) && Boolean(projectId),
  })

  const deposits = getDepositsData?.deposits || []
  const depositsCount = deposits.length

  return (
    <Accordion
      label={label || "Past Orders"}
      subLabel={`(${depositsCount})`}
      maxChildrenHeight={MAX_ACCORDION_CONTAINER_HEIGHT}
      className={className}
    >
      {deposits.map((deposit, index) => {
        return (
          <PastOrder
            key={deposit.transactionId}
            transactionUrl={deposit.transactionUrl}
            numberOfPastOrders={depositsCount}
            createdAt={new Date(deposit.createdAt)}
            uiAmount={deposit.uiAmount}
            index={index}
            raisedTokenPriceInUsd={raisedTokenPriceInUsd}
          />
        )
      })}
    </Accordion>
  )
}

type PastOrderProps = {
  transactionUrl: string
  createdAt: Date
  numberOfPastOrders: number
  index: number
  uiAmount: string
  raisedTokenPriceInUsd: number
}
export const PastOrder = ({
  transactionUrl,
  createdAt,
  numberOfPastOrders,
  index,
  uiAmount,
  raisedTokenPriceInUsd,
}: PastOrderProps) => {
  const raisedTokenValueInUsd = formatCurrencyAmount(raisedTokenPriceInUsd * Number(uiAmount), { withDollarSign: true })
  const { projectData } = useProjectDataContext()

  return (
    <div
      className={twMerge(
        "flex w-full flex-col border-b-[1px] border-b-bd-primary p-4",
        index + 1 === numberOfPastOrders && "border-none",
      )}
    >
      <div className="flex w-full items-center justify-between gap-1">
        <div className="flex items-center gap-1">
          <span className="text-base font-medium">{formatCurrencyAmount(uiAmount)}</span>
          <span>{projectData?.config.raisedTokenData.ticker}</span>
          <Img size={"4"} src={projectData?.config.raisedTokenData.iconUrl} />
        </div>
        <div className="relative h-6 w-6">
          <ExternalLink.Icon
            externalLink={{ iconType: "OUTER_LINK", url: transactionUrl }}
            className="absolute -left-1 -top-1.5 border-none text-xl text-fg-tertiary"
          />
        </div>
      </div>
      <div className="flex w-full items-center justify-between text-sm text-fg-tertiary">
        <span>{raisedTokenValueInUsd}</span>
        <span>{formatDateForDisplay(createdAt)}</span>
      </div>
    </div>
  )
}
