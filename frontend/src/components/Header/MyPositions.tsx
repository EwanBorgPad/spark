import React, { MutableRefObject, useRef, useState } from "react"
import { AvailableIcons, Icon } from "../Icon/Icon"
import { twMerge } from "tailwind-merge"
import { SupportedWallet, useWalletContext } from "@/hooks/useWalletContext"
import { useCheckOutsideClick } from "@/hooks/useCheckOutsideClick"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"
import { MyPositionTabId } from "@/@types/frontend"
import MyPositionsTab from "./MyPositionsTab"

type Props = {
  onClose: () => void
  excludeOnClickOutside: MutableRefObject<HTMLDivElement | null>[]
}
const tabs: { id: MyPositionTabId; label: string }[] = [
  {
    label: "POOLS",
    id: "POOLS",
  },
  {
    label: "DRAFT PICKS",
    id: "DRAFT_PICKS",
  },
  {
    label: "REFERRALS",
    id: "REFERRALS",
  },
]

const MyPositions = ({ onClose, excludeOnClickOutside }: Props) => {
  const { address, truncatedAddress, signOut, walletProvider } = useWalletContext()
  const [activeTab, setActiveTab] = useState<MyPositionTabId>("POOLS")

  const dropdownMenuRef = useRef<HTMLDivElement | null>(null)
  useCheckOutsideClick(dropdownMenuRef, onClose, excludeOnClickOutside)

  const { isCopied, copyToClipboard } = useCopyToClipboard()

  const iconMap: Record<SupportedWallet | "", AvailableIcons> = {
    BACKPACK: "SvgBackpack",
    PHANTOM: "SvgPhantom",
    SOLFLARE: "SvgSolflare",
    "": "SvgX",
  }
  const icon: AvailableIcons = iconMap[walletProvider]

  return (
    <div
      ref={dropdownMenuRef}
      className={twMerge(
        "absolute right-0 top-12 w-[420px] p-4",
        "rounded-xl border border-bd-primary bg-default",
        "flex flex-col gap-4",
        "animate-top-down transition-transform ease-out",
      )}
    >
      <div className="flex w-full items-center justify-between gap-2">
        {/* left side */}
        <div className="flex items-center gap-4">
          <Icon className="text-[32px]" icon={icon} />
          <p className="select-none text-body-l-medium">{truncatedAddress}</p>
        </div>
        {/* right side */}
        <div className="flex items-center gap-3">
          <DropdownMenuButton
            icon={"SvgCopy"}
            tooltipText={isCopied ? "Copied!" : "Copy Wallet Address"}
            onClick={() => copyToClipboard(address)}
          />
          <DropdownMenuButton icon={"SvgShare"} tooltipText={"Share"} onClick={() => alert("Not implemented!")} />
          <DropdownMenuButton icon={"SvgLogOut"} tooltipText={"Disconnect"} onClick={signOut} />
        </div>
      </div>
      <div className="mb-4 flex w-full">
        {tabs.map((tab) => (
          <MyPositionTabButton key={tab.id} tab={tab} activeTab={activeTab} setActiveTab={setActiveTab} />
        ))}
      </div>
      <MyPositionsTab activeTab={activeTab} />
    </div>
  )
}
export default MyPositions

type MyPositionTabButtonProps = {
  activeTab: MyPositionTabId
  setActiveTab: (tab: MyPositionTabId) => void
  tab: {
    id: MyPositionTabId
    label: string
  }
}
const MyPositionTabButton = ({ setActiveTab, activeTab, tab }: MyPositionTabButtonProps) => {
  const isTabActive = activeTab === tab.id
  return (
    <div
      onClick={() => setActiveTab(tab.id)}
      className={twMerge("hover:tabs-text-shadow group relative flex-1 cursor-pointer py-2 text-center text-sm")}
    >
      <span
        className={twMerge(
          "group-hover:tabs-text-shadow font-vcr text-fg-tertiary group-hover:text-fg-brand-primary",
          isTabActive && "tabs-text-shadow text-fg-brand-primary",
        )}
      >
        {tab.label}
      </span>
      <div
        className={twMerge(
          "absolute bottom-0 h-0.5 w-full scale-x-0 transition-transform ",
          isTabActive && "tabs-bottom-border scale-x-100 bg-fg-brand-primary",
        )}
      ></div>
    </div>
  )
}

type DropdownMenuButtonProps = {
  icon: AvailableIcons
  tooltipText: string
  onClick?: () => void
}
const DropdownMenuButton = ({ icon, onClick, tooltipText }: DropdownMenuButtonProps) => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false)

  const classes = twMerge(
    "relative",
    "flex items-center h-[32px] w-[32px] p-2",
    "rounded-lg border border-bd-primary",
    "bg-default hover:bg-secondary",
    "cursor-pointer select-none",
  )

  const tooltipClasses = twMerge(isTooltipVisible && "animate-fade-in")
  return (
    <div
      onMouseEnter={() => setIsTooltipVisible(true)}
      onMouseLeave={() => setIsTooltipVisible(false)}
      className={classes}
      onClick={onClick}
    >
      <Icon icon={icon} />
      {isTooltipVisible && <Tooltip className={tooltipClasses} text={tooltipText} />}
    </div>
  )
}

type TooltipProps = {
  className: string
  text: string
}
const Tooltip = ({ className, text }: TooltipProps) => {
  const classes = twMerge(
    "absolute top-9 -right-0 px-2 py-1",
    "bg-black border border-bd-secondary",
    "whitespace-nowrap",
    "rounded-lg",
    "z-10",
    className,
  )
  return <div className={classes}>{text}</div>
}
