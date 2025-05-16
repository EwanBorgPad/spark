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

type Props = {
  className?: string
}

const Referral = ({ className }: Props) => {
  const [showModal, setShowModal] = useState(false)
  const { address } = useWalletContext()
  const { projectId } = useParams()
  
  const { data: leaderboardData } = useQuery({
    queryKey: ["getLeaderboard", address],
    queryFn: () => referralApi.getLeaderboard({ projectId: projectId || "" }),
  })

  const userEntry = address && leaderboardData?.leaderboardReferrals
    ? leaderboardData.leaderboardReferrals.find(item => item.referrer_by === address.substring(0, 4))
    : null

  const tickets = userEntry?.total_invested || 0
  const userRanking = address && leaderboardData?.leaderboardReferrals
    ? leaderboardData.leaderboardReferrals.findIndex(item => item.referrer_by === address.substring(0, 4)) + 1 
    : 0

  const btnText = tickets !== 0 
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
              <Icon icon="SvgTicket" className="text-xl text-fg-secondary" />
              {tickets !== 0 && (
                <>
                  <span className="text-fg-brand-primary">{tickets}</span>
                  <SvgPodium className="text-fg-primary" />
                  <span className="text-fg-primary">{userRanking}</span>
                </>
              )}
            </div>
          }
        />
      </div>

      {showModal && <ReferralModal onClose={() => setShowModal(false)} />}
    </>
  )
}

export default Referral
