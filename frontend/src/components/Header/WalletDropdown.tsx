import { useRef, useState } from "react"
import { SupportedWallet, useWalletContext } from "@/hooks/useWalletContext.tsx"
import { AvailableIcons, Icon } from "@/components/Icon/Icon.tsx"
import { twMerge } from "tailwind-merge"
import MyPositions from "./MyPositions"

type Props = { className?: string }

export const WalletDropdown = ({ className }: Props) => {
  const [isOpen, setIsOpen] = useState(false)

  const { truncatedAddress, walletProvider } = useWalletContext()

  const toggleDropdown = () => setIsOpen((isOpen) => !isOpen)
  const iconMap: Record<SupportedWallet | "", AvailableIcons> = {
    BACKPACK: "SvgBackpack",
    PHANTOM: "SvgPhantom",
    SOLFLARE: "SvgSolflare",
    "": "SvgX",
  }
  const icon: AvailableIcons = iconMap[walletProvider]

  const dropdownButtonRef = useRef<HTMLDivElement | null>(null)

  return (
    <div className={twMerge("relative", className)}>
      {/* dropdown button */}
      <div
        ref={dropdownButtonRef}
        onClick={toggleDropdown}
        className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-bd-primary bg-secondary px-3 py-1.5 hover:bg-tertiary"
      >
        <Icon icon={icon} />
        <p className="select-none text-sm">{truncatedAddress}</p>
        <Icon
          className={twMerge("transition-transform duration-150", isOpen && "rotate-180 transform")}
          icon={"SvgChevronDown"}
        />
      </div>
      {/* dropdown menu */}
      {isOpen && <MyPositions onClose={() => setIsOpen(false)} excludeOnClickOutside={[dropdownButtonRef]} />}
    </div>
  )
}
