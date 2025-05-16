import { useState } from "react"
import { twMerge } from "tailwind-merge"
import { useWalletContext } from "@/hooks/useWalletContext"
import { useParams } from "react-router-dom"

import { Icon } from "../Icon/Icon"
import { Button } from "../Button/Button"
import ReferralModal from "../Modal/Modals/ReferralModal"
import { useQuery } from "@tanstack/react-query"
import { referralApi } from "@/data/api/referralApi"
import { SvgPodium } from "../Icon/Svg/SvgPodium"
import { useProjectDataContext } from "@/hooks/useProjectData"
import { formatCurrencyAmount } from "shared/utils/format"

type Props = {
  className?: string
}

type LeaderboardReferral = {
  referrer_by: string
  total_invested: number
  result_type: 'ranking' | 'raffle' | 'lost' | null
}

const Referral = ({ className }: Props) => {
  const [showModal, setShowModal] = useState(false)
  const { address } = useWalletContext()
  const { projectId } = useParams()
  const { projectData } = useProjectDataContext()

  const { data: leaderboardData } = useQuery({
    queryKey: ["getLeaderboard", address],
    queryFn: () => referralApi.getLeaderboard({ projectId: projectId || "" }),
  })

  const userEntry = address && leaderboardData?.leaderboardReferrals
    ? leaderboardData.leaderboardReferrals.find(item => item.referrer_by === address.substring(0, 4)) as LeaderboardReferral
    : null

  const tickets = userEntry?.total_invested || 0
  const userRanking = address && leaderboardData?.leaderboardReferrals
    ? leaderboardData.leaderboardReferrals.findIndex(item => item.referrer_by === address.substring(0, 4)) + 1
    : 0

  const calculateUserPrize = () => {
    if (!userEntry || !projectData?.config.referralDistribution) {
      return "0"
    }

    if (userEntry.result_type === 'ranking') {
      const position = userRanking.toString()
      const rankingAmount = projectData.config.referralDistribution.ranking[position]
      return formatCurrencyAmount(rankingAmount || 0)
    } else if (userEntry.result_type === 'raffle') {
      const raffleValues = Object.values(projectData.config.referralDistribution.raffle || {})
      if (raffleValues.length > 0) {
        const avgRaffleAmount = raffleValues.reduce((sum, amount) => sum + amount, 0) / raffleValues.length
        return formatCurrencyAmount(avgRaffleAmount)
      }
    }
    return "0"
  }

  const btnText = userEntry?.result_type && userEntry.result_type !== 'lost'
    ? ""
    : tickets !== 0
      ? ``
      : "Refer & Earn"

  return (
    <>
      <div
        className={twMerge("group cursor-pointer", className)}
        onClick={() => setShowModal(true)}
      >
        <Button
          btnText={btnText}
          color="secondary"
          className="text-sm text-fg-brand-primary bg-gradient-to-r from-[#ACFF731A] to-transparent"
          prefixElement={
            <div className="flex items-center gap-2">
              {tickets === 0 && (
                <>
                  <Icon icon="SvgTicket" className="text-xl text-fg-secondary" />
                </>
              )}
              {tickets !== 0 && !userEntry?.result_type && (
                <>
                  <Icon icon="SvgTicket" className="text-xl text-fg-secondary" />
                  <span className="text-fg-brand-primary">{tickets}</span>
                  <SvgPodium className="text-fg-primary" />
                  <span className="text-fg-primary">{userRanking}</span>
                </>
              )}
            </div>
          }
        >
          {userEntry?.result_type && userEntry.result_type !== 'lost' && (
            <div className="flex items-center gap-1">
              <span className="text-l">💰</span>
              <span>Referral</span>
              <span>Bonus</span>
              <span className="text-fg-primary">{calculateUserPrize()}</span>
              <span className="text-fg-primary">{projectData?.config.launchedTokenData.ticker}</span>
            </div>
          )}
        </Button>
      </div>

      {showModal && <ReferralModal onClose={() => setShowModal(false)} />}
    </>
  )
}

export default Referral
