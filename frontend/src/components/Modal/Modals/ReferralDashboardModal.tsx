import { useState } from "react"
import { twMerge } from "tailwind-merge"
import { Button } from "../../Button/Button"
import { SimpleModal } from "../SimpleModal"
import { Icon } from "../../Icon/Icon"

type Props = {
  onClose: () => void
}

const ReferralDashboardModal = ({ onClose }: Props) => {
  const [copied, setCopied] = useState(false)
  const referralCode = "j21a891l"
  
  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  return (
    <SimpleModal
      title="Invite Friends, get $SOLID"
      onClose={onClose}
      className="max-w-6xl"
      showCloseBtn={true}
    >
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold">How Does it Work?</h2>
          <div className="flex items-center gap-2 text-fg-primary">
            <span>Raffle happens & leaderboard closes in</span>
            <span className="font-medium">1d : 20h : 24m : 45s</span>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="flex flex-col gap-2 rounded-lg border border-bd-primary p-4">
            <h3 className="text-sm text-fg-primary/70">Your Rewards</h3>
            <p className="text-2xl font-semibold">0</p>
            <p className="text-sm text-fg-primary/70">$SOLID</p>
          </div>
          
          <div className="flex flex-col gap-2 rounded-lg border border-bd-primary p-4">
            <h3 className="text-sm text-fg-primary/70">Your referral code</h3>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-semibold">{referralCode}</p>
              <Button
                btnText={copied ? "Copied!" : "Copy"}
                color="secondary"
                size="xs"
                onClick={handleCopy}
              />
            </div>
            <p className="text-sm text-fg-primary/70">Total issued: 2,000</p>
          </div>
          
          <div className="flex flex-col gap-2 rounded-lg border border-bd-primary p-4">
            <h3 className="text-sm text-fg-primary/70">Your Tickets</h3>
            <p className="text-2xl font-semibold">0</p>
          </div>
          
          <div className="flex flex-col gap-2 rounded-lg border border-bd-primary p-4">
            <h3 className="text-sm text-fg-primary/70">Reward Pool</h3>
            <p className="text-2xl font-semibold">10,000,000</p>
            <p className="text-sm text-fg-primary/70">$SOLID</p>
          </div>
        </div>
        
        {/* Tables */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Referred Users Table */}
          <div className="flex flex-col gap-3">
            <h3 className="text-lg font-medium">Referred</h3>
            <div className="overflow-hidden rounded-lg border border-bd-primary">
              <table className="w-full">
                <thead className="bg-bd-primary/20">
                  <tr>
                    <th className="p-3 text-left text-sm font-medium">User</th>
                    <th className="p-3 text-left text-sm font-medium">Connected</th>
                    <th className="p-3 text-left text-sm font-medium">Invested</th>
                    <th className="p-3 text-left text-sm font-medium">Tickets</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-fg-primary/70">
                      No one used your referral code yet.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Leaderboard Table */}
          <div className="flex flex-col gap-3">
            <h3 className="text-lg font-medium">Leaderboard</h3>
            <div className="overflow-hidden rounded-lg border border-bd-primary">
              <table className="w-full">
                <thead className="bg-bd-primary/20">
                  <tr>
                    <th className="p-3 text-left text-sm font-medium">Pos.</th>
                    <th className="p-3 text-left text-sm font-medium">User</th>
                    <th className="p-3 text-left text-sm font-medium">Tickets</th>
                    <th className="p-3 text-left text-sm font-medium">Prize</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-bd-primary">
                    <td className="p-3">1</td>
                    <td className="p-3">7181...9310</td>
                    <td className="p-3">1,200</td>
                    <td className="p-3">2,500,000</td>
                  </tr>
                  <tr className="border-t border-bd-primary">
                    <td className="p-3">2</td>
                    <td className="p-3">7181...9310</td>
                    <td className="p-3">1,100</td>
                    <td className="p-3">500,000</td>
                  </tr>
                  <tr className="border-t border-bd-primary">
                    <td className="p-3">3</td>
                    <td className="p-3">7181...9310</td>
                    <td className="p-3">1,000</td>
                    <td className="p-3">500,000</td>
                  </tr>
                  <tr className="border-t border-bd-primary">
                    <td className="p-3">4</td>
                    <td className="p-3">7181...9310</td>
                    <td className="p-3">900</td>
                    <td className="p-3">400,000</td>
                  </tr>
                  <tr className="border-t border-bd-primary">
                    <td className="p-3">5</td>
                    <td className="p-3">7181...9310</td>
                    <td className="p-3">850</td>
                    <td className="p-3">400,000</td>
                  </tr>
                  <tr className="border-t border-bd-primary">
                    <td className="p-3">6</td>
                    <td className="p-3">7181...9310</td>
                    <td className="p-3">800</td>
                    <td className="p-3">400,000</td>
                  </tr>
                  <tr className="border-t border-bd-primary">
                    <td className="p-3">7</td>
                    <td className="p-3">7181...9310</td>
                    <td className="p-3">750</td>
                    <td className="p-3">100,000</td>
                  </tr>
                  <tr className="border-t border-bd-primary">
                    <td className="p-3">8</td>
                    <td className="p-3">7181...9310</td>
                    <td className="p-3">700</td>
                    <td className="p-3">100,000</td>
                  </tr>
                  <tr className="border-t border-bd-primary">
                    <td className="p-3">9</td>
                    <td className="p-3">7181...9310</td>
                    <td className="p-3">650</td>
                    <td className="p-3">100,000</td>
                  </tr>
                  <tr className="border-t border-bd-primary">
                    <td className="p-3">10</td>
                    <td className="p-3">7181...9310</td>
                    <td className="p-3">600</td>
                    <td className="p-3">100,000</td>
                  </tr>
                  <tr className="border-t border-bd-primary bg-brand-primary/10">
                    <td className="p-3">120</td>
                    <td className="p-3">You</td>
                    <td className="p-3">0</td>
                    <td className="p-3">0</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </SimpleModal>
  )
}

export default ReferralDashboardModal 