import { useRef, useState } from "react"
import { useWalletContext } from "@/hooks/useWalletContext.tsx"
import { AvailableIcons, Icon } from "@/components/Icon/Icon.tsx"
import { useCheckOutsideClick } from "@/hooks/useCheckOutsideClick.tsx"
import { twMerge } from "tailwind-merge"

export const WalletDropdown = () => {
  const [isOpen, setIsOpen] = useState(false)

  const { truncatedAddress, walletProvider, signOut } = useWalletContext()

  const toggleDropdown = () => setIsOpen((isOpen) => !isOpen)

  const icon: AvailableIcons =
    walletProvider === "PHANTOM" ? "SvgPhantom" : "SvgBackpack"

  const dropdownButtonRef = useRef<HTMLDivElement | null>(null)
  const dropdownMenuRef = useRef<HTMLDivElement | null>(null)
  useCheckOutsideClick(dropdownMenuRef, () => isOpen && setIsOpen(false), [
    dropdownButtonRef,
  ])

  return (
    <div className="relative">
      {/* dropdown button */}
      <div
        ref={dropdownButtonRef}
        onClick={toggleDropdown}
        className="flex cursor-pointer items-center gap-3 rounded-2xl border border-bd-primary bg-secondary hover:bg-tertiary px-3 py-1.5"
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
            <DropdownMenuButton icon={"SvgCopy"} />
            <DropdownMenuButton icon={"SvgShare"} />
            <DropdownMenuButton icon={"SvgLogOut"} onClick={signOut} />
          </div>
        </div>
      )}
    </div>
  )
}

type DropdownMenuButtonProps = {
  icon: AvailableIcons
  onClick?: () => void
}

const DropdownMenuButton = ({ icon, onClick }: DropdownMenuButtonProps) => {
  const classes = twMerge(
    "flex items-center h-[32px] w-[32px]  rounded-lg border border-bd-primary p-2",
    onClick && "cursor-pointer",
  )
  return (
    <div className={classes} onClick={onClick}>
      <Icon icon={icon} />
    </div>
  )
}
