import React, { MutableRefObject, useRef, useState } from "react"
import { AvailableIcons, Icon } from "../Icon/Icon"
import { twMerge } from "tailwind-merge"
import { SupportedWallet, useWalletContext } from "@/hooks/useWalletContext"
import { useCheckOutsideClick } from "@/hooks/useCheckOutsideClick"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"

type Props = {
  onClose: () => void
  excludeOnClickOutside: MutableRefObject<HTMLDivElement | null>[]
}
const MyPositions = ({ onClose, excludeOnClickOutside }: Props) => {
  const { address, truncatedAddress, signOut, walletProvider } = useWalletContext()

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
        "absolute right-0 top-12 w-[343px] p-4",
        "rounded-xl border border-bd-primary bg-default",
        "flex flex-col",
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
      <div className="flex w-full">
        <span className="p-y-2 flex-1 border-b-4 border-fg-brand-secondary text-sm">Pools</span>
        <span className="p-y-2 flex-1 border-b-4 border-fg-brand-secondary text-sm">Draft Picks</span>
        <span className="p-y-2 flex-1 border-b-4 border-fg-brand-secondary text-sm">Referrals</span>
      </div>
    </div>
  )
}

export default MyPositions

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
