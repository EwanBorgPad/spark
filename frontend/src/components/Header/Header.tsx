import { ConnectButton } from "./ConnectButton"
import { Icon } from "@/components/Icon/Icon.tsx"
import { useWalletContext } from "@/hooks/useWalletContext.tsx"
import { WalletDropdown } from "@/components/Header/WalletDropdown.tsx"
import { useRef } from "react"
import useHeaderShadow from "@/hooks/useHeaderShadow"
import { useLocation, useNavigate } from "react-router-dom"
import { twMerge } from "tailwind-merge"

type NavigationItem = {
  id: string
  label: string
}
const navigationItems: NavigationItem[] = [
  {
    id: "angel-staking",
    label: "Angel Staking",
  },
  {
    id: "launch-pools",
    label: "Launch Pools",
  },
  {
    id: "manifesto",
    label: "Manifesto",
  },
]

const NavigationBar = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const isItemActive = (item: NavigationItem) => {
    return location.pathname.slice(1) === item.id
  }

  return (
    <nav className="hidden md:flex">
      <ul className="flex gap-6">
        {navigationItems.map((item) => (
          <li
            key={item.id}
            className={twMerge(
              "relative flex cursor-pointer flex-col items-center gap-1 text-fg-secondary transition-colors duration-500",
              isItemActive(item) && "text-brand-primary",
            )}
            onClick={() => navigate(`/${item.id}`)}
          >
            <span>{item.label}</span>
            {isItemActive(item) && (
              <div
                className={twMerge(
                  "animate-underline w-4 border border-brand-primary",
                )}
              ></div>
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}

const Header = () => {
  const intersectionReferenceElement = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const { walletState } = useWalletContext()

  useHeaderShadow({ headerRef, intersectionReferenceElement })

  return (
    <>
      <header
        ref={headerRef}
        className="fixed left-0 top-0 z-[11] flex h-12 w-full flex-row justify-center border-b-[1px] border-tertiary bg-default px-4 py-2 transition-shadow duration-500 md:h-[72px]"
      >
        <div
          className={
            "flex w-full max-w-[1180px] flex-row items-center justify-between"
          }
        >
          <div className="flex items-center gap-1 py-2">
            {/* <div className="h-[19px] w-[19px] rounded-full bg-brand-primary" /> */}
            <Icon icon="SvgLogo" className="mb-[4px] h-[20px] text-2xl" />
            <span className="font-sulphur-point text-2xl leading-[28px] text-fg-primary">
              BorgPad
            </span>
          </div>

          <NavigationBar />

          {walletState === "CONNECTED" ? <WalletDropdown /> : <ConnectButton />}
        </div>
      </header>

      {/* full height reference element for intersection observer that is used inside useHeaderShadow */}
      <div
        ref={intersectionReferenceElement}
        className="absolute left-0 top-0 z-[-10] h-screen w-2 bg-transparent"
      ></div>
    </>
  )
}

export default Header
