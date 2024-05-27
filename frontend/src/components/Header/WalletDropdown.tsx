import { useRef, useState } from "react"
import { useWalletContext } from "@/hooks/useWalletContext.tsx"
import { AvailableIcons, Icon } from "@/components/Icon/Icon.tsx"
import { useCheckOutsideClick } from "@/hooks/useCheckOutsideClick.tsx"
import { twMerge } from "tailwind-merge"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard.ts"

export const WalletDropdown = () => {
  const [isOpen, setIsOpen] = useState(false)

  const { address, truncatedAddress, walletProvider, signOut } =
    useWalletContext()

  const toggleDropdown = () => setIsOpen((isOpen) => !isOpen)

  const icon: AvailableIcons =
    walletProvider === "PHANTOM" ? "SvgPhantom" : "SvgBackpack"

  const dropdownButtonRef = useRef<HTMLDivElement | null>(null)
  const dropdownMenuRef = useRef<HTMLDivElement | null>(null)
  useCheckOutsideClick(dropdownMenuRef, () => isOpen && setIsOpen(false), [
    dropdownButtonRef,
  ])

  const { isCopied, copyToClipboard } = useCopyToClipboard()

  return (
    <div className="relative">
      {/* dropdown button */}
      <div
        ref={dropdownButtonRef}
        onClick={toggleDropdown}
        className="flex cursor-pointer items-center gap-3 rounded-2xl border border-bd-primary bg-secondary px-3 py-1.5 hover:bg-tertiary"
      >
        <Icon icon={icon} />
        <p className="select-none">{truncatedAddress}</p>
        <Icon
          className={twMerge(
            "transition-transform duration-150",
            isOpen && "rotate-180 transform",
          )}
          icon={"SvgChevronDown"}
        />
      </div>
      {/* dropdown menu */}
      {isOpen && (
        <div
          ref={dropdownMenuRef}
          className={twMerge(
            "absolute right-0 top-12 w-[343px] p-4",
            "rounded-xl border border-bd-primary bg-default",
            "flex items-center justify-between",
            "transition-transform ease-out",
            isOpen && "animate-top-down",
          )}
        >
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
            <DropdownMenuButton
              icon={"SvgShare"}
              tooltipText={"Share"}
              onClick={() => alert("Not implemented!")}
            />
            <DropdownMenuButton
              icon={"SvgLogOut"}
              tooltipText={"Disconnect"}
              onClick={signOut}
            />
          </div>
        </div>
      )}
    </div>
  )
}

type DropdownMenuButtonProps = {
  icon: AvailableIcons
  tooltipText: string
  onClick?: () => void
}
const DropdownMenuButton = ({
  icon,
  onClick,
  tooltipText,
}: DropdownMenuButtonProps) => {
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
      {isTooltipVisible && (
        <Tooltip className={tooltipClasses} text={tooltipText} />
      )}
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
