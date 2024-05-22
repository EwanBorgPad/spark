import { ConnectButton } from "./ConnectButton"
import { AvailableIcons, Icon } from "@/components/Icon/Icon.tsx"
import { twMerge } from "tailwind-merge"
import { useRef, useState } from "react"
import { useWalletContext } from "@/hooks/useWalletContext.tsx"
import { useCheckOutsideClick } from "@/hooks/useCheckOutsideClick.tsx"

const Header = () => {
  const { isSignedIn } = useWalletContext()

  return (
    <header className="fixed left-0 top-0 z-[1] flex h-12 w-full flex-row justify-center border-b-[1px] border-tertiary bg-default px-4 py-2 lg:h-[72px]">
      <div
        className={
          "flex w-full max-w-[1180px] flex-row items-center justify-between"
        }
      >
        <div className="flex items-center gap-2 py-2">
          <div className="h-[19px] w-[19px] rounded-full bg-brand-primary" />
          <span className="font-bold text-fg-primary">BorgPad</span>
        </div>

        {isSignedIn ? <WalletDropdown /> : <ConnectButton />}
      </div>
    </header>
  )
}

function WalletDropdown() {
  const [isOpen, setIsOpen] = useState(false)

  const { truncatedAddress, walletProvider, signOut } = useWalletContext()

  const toggleDropdown = () => setIsOpen((isOpen) => !isOpen)

  const icon: AvailableIcons =
    walletProvider === "PHANTOM" ? "SvgPhantom" : "SvgBackpack"

  const dropdownButtonRef = useRef<HTMLDivElement | null>(null)
  const dropdownMenuRef = useRef<HTMLDivElement | null>(null)
  useCheckOutsideClick(
    dropdownMenuRef,
    () => isOpen && setIsOpen(false),
    [dropdownButtonRef]
  )

  return (
    <div className="relative">
      {/* dropdown button */}
      <div
        ref={dropdownButtonRef}
        onClick={toggleDropdown}
        className="flex cursor-pointer items-center gap-3 rounded-2xl border border-bd-primary bg-tertiary px-3 py-1.5"
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
            isOpen && 'animate-top-down',
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

function DropdownMenuButton({ icon, onClick }: DropdownMenuButtonProps) {
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

export default Header
