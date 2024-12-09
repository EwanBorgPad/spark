import { useTranslation } from "react-i18next"
import { Icon } from "@/components/Icon/Icon"
import { PastOrders } from "./PastOrders"
import TokenRewards from "./TokenRewards"
import { useQuery } from "@tanstack/react-query"
import { backendApi } from "@/data/backendApi"
import { useWalletContext } from "@/hooks/useWalletContext"
import { useParams } from "react-router-dom"
import { useProjectDataContext } from "@/hooks/useProjectData"

// input data for "getExchange"
const baseCurrency = "swissborg"
const targetCurrency = "usd"

const YourContribution = () => {
  const { t } = useTranslation()
  const { address } = useWalletContext()
  const { projectId } = useParams()
  const { projectData } = useProjectDataContext()

  // const liquidityPool = projectData?.info.tge.liquidityPool

  // const hasDistributionStarted =
  //   eventData.id === "REWARD_DISTRIBUTION" &&
  //   liquidityPool?.unlockDate &&
  //   isBefore(liquidityPool.unlockDate, new Date())

  // const alreadyClaimedPercent = +((mainPosition.borg.claimed / mainPosition.borg.total) * 100).toFixed(2)

  // const unlockDate = `${t("sale_over.unlocks_on")}
  // ${liquidityPool?.unlockDate ? formatDateForDisplay(liquidityPool.unlockDate) : "TBC"}`

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
  const { data: exchangeData } = useQuery({
    queryFn: () =>
      backendApi.getExchange({
        baseCurrency,
        targetCurrency,
      }),
    queryKey: ["getExchange", baseCurrency, targetCurrency],
  })
  const borgPriceInUSD = exchangeData?.currentPrice || null
  const tokenPriceInUSD = projectData?.info.tge.fixedTokenPriceInUSD || 0
  const tokenPriceInBORG = !borgPriceInUSD ? null : tokenPriceInUSD / borgPriceInUSD

  const borgDeposits = getDepositsData?.deposits || []
  const totalBorgDeposits = borgDeposits.reduce(
    (accumulator, currentValue) => accumulator + +currentValue.amountDeposited,
    0,
  )

  return (
    <>
      <div className="flex items-center gap-2 text-xl font-semibold">
        <Icon icon="SvgBorgCoin" />
        {/* <span>{formatCurrencyAmount(suppliedBorg.total, false)}</span> */}
        <span>BORG</span>
      </div>
      <PastOrders label="All Orders" className="w-full" />
      <hr className="mt-4 w-full max-w-[227px] border-bd-primary" />
      <span className="text-base font-semibold">{t("sale_over.total_to_be_received")}</span>

      <TokenRewards
        borgCoinInput={totalBorgDeposits.toString()}
        tokenPriceInBORG={tokenPriceInBORG}
        borgPriceInUSD={borgPriceInUSD}
        tokenPriceInUSD={tokenPriceInUSD}
        isYourContribution
      />
    </>
  )
}

export default YourContribution
