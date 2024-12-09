import { useTranslation } from "react-i18next"
import { Icon } from "@/components/Icon/Icon"
import { PastOrders } from "./PastOrders"
import { useQuery } from "@tanstack/react-query"
import { backendApi } from "@/data/backendApi"
import { useWalletContext } from "@/hooks/useWalletContext"
import { useParams } from "react-router-dom"
import { formatCurrencyAmount } from "shared/utils/format"
import YourContributionAmounts from "./YourContributionAmounts"

const YourContribution = () => {
  const { t } = useTranslation()
  const { address } = useWalletContext()
  const { projectId } = useParams()

  const { data: getDepositsData } = useQuery({
    queryFn: () => {
      if (!address || !projectId) return
      return backendApi.getDeposits({
        address,
        projectId,
      })
    },
    queryKey: ["getDeposits", address, projectId],
    enabled: Boolean(address) && Boolean(projectId),
  })

  const borgDeposits = getDepositsData?.deposits || []
  const totalBorgDeposits = borgDeposits.reduce((accumulator, currentValue) => {
    const multiplier = Math.pow(10, +currentValue.decimalMultiplier)
    const deposit = +currentValue.amountDeposited * multiplier
    return accumulator + deposit
  }, 0)

  return (
    <>
      <div className="flex items-center gap-2 text-xl font-semibold">
        <Icon icon="SvgBorgCoin" />
        <span>{formatCurrencyAmount(totalBorgDeposits, false)}</span>
        <span>BORG</span>
      </div>
      <PastOrders label="All Orders" className="w-full" />
      <hr className="mt-4 w-full max-w-[227px] border-bd-primary" />
      <span className="text-base font-semibold">{t("sale_over.total_to_be_received")}</span>

      <YourContributionAmounts />
    </>
  )
}

export default YourContribution
