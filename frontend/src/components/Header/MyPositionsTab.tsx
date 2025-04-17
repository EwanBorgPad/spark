import { MyPositionTabId } from "@/@types/frontend"
import React from "react"
import Img from "../Image/Img"

type Props = {
  activeTab: MyPositionTabId
}

// TAB WRAPPER
const MyPositionsTab = ({ activeTab }: Props) => {
  return <div className="flex flex-col gap-6">{tabs[activeTab]}</div>
}
export default MyPositionsTab

// TABS
const Pools = () => {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col items-start">
        <span className="text-sm text-fg-tertiary">Total Invested</span>
        <span className="text-4xl font-semibold text-fg-primary">$12,421.85</span>
      </div>
      <div className="flex w-full flex-col items-start">
        <span className="text-sm text-fg-tertiary">Investments</span>
        <div className="flex w-full flex-col">
          <div className="flex w-full">
            <Img src="https://imgcdn.stablediffusionweb.com/2024/4/19/5acb9020-70dd-42c5-afca-3fe165e87d2c.jpg" size="6" />
          </div>
        </div>
      </div>
    </div>
  )
}
const tabs: Record<MyPositionTabId, JSX.Element> = {
  POOLS: <Pools />,
  DRAFT_PICKS: <Pools />,
  REFERRALS: <Pools />,
}
