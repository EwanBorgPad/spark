import { useLocation, useNavigate } from "react-router-dom"
import { useRef, useState } from "react"
import { twMerge } from "tailwind-merge"

import hamburgerMenuBg from "@/assets/hamburgerMenuBg.png"

import { WalletDropdown } from "@/components/Header/WalletDropdown.tsx"
import { useWalletContext } from "@/hooks/useWalletContext.tsx"
import useHeaderShadow from "@/hooks/useHeaderShadow"
import { Icon } from "@/components/Icon/Icon.tsx"
import { ConnectButton } from "./ConnectButton"
import { Button } from "../Button/Button"

type NavigationItem = {
  id: string
  label: string
}
type NavigationBarProps = {
  className?: string
  itemClickedCallback: () => void
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
  // {
  //   id: "blog",
  //   label: "Blog",
  // },
  // {
  //   id: "FAQ",
  //   label: "FAQ",
  // },
]

const NavigationBar = ({
  className = "",
  itemClickedCallback,
}: NavigationBarProps) => {
  const location = useLocation()
  const navigate = useNavigate()

  const isItemActive = (item: NavigationItem) => {
    return location.pathname.slice(1) === item.id
  }

  const onItemClick = (item: NavigationItem) => {
    navigate(`/${item.id}`)
    itemClickedCallback()
  }

  return (
    <nav className={twMerge(className)}>
      <ul className="flex flex-col items-start px-5 py-4 md:flex-row md:items-center md:gap-6 md:p-0">
        {navigationItems.map((item) => (
          <li
            key={item.id}
            className={twMerge(
              "relative flex cursor-pointer flex-col items-center gap-1 py-3 text-lg text-fg-secondary transition-colors duration-500 md:py-0 md:text-base",
              isItemActive(item) && "text-brand-primary",
            )}
            onClick={() => onItemClick(item)}
          >
            <span>{item.label}</span>
            {isItemActive(item) && (
              <div
                className={twMerge(
                  "absolute bottom-0 hidden w-4 animate-underline border border-brand-primary md:flex",
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
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false)
  const [closeMenu, setCloseMenu] = useState(false)
  const intersectionReferenceElement = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const { walletState } = useWalletContext()

  useHeaderShadow({ headerRef, intersectionReferenceElement })

  const toggleMenu = () => {
    if (!showHamburgerMenu) {
      setShowHamburgerMenu(true)
      return
    }
    setCloseMenu(true)
    setTimeout(() => {
      setShowHamburgerMenu(false)
      setCloseMenu(false)
    }, 350)
  }

  return (
    <>
      <header
        ref={headerRef}
        className="fixed left-0 top-0 z-[12] flex h-12 w-full flex-row justify-center gap-3 border-b-[1px] border-tertiary bg-default px-4 py-2 pr-2 transition-shadow duration-500 md:h-[72px] md:pr-4"
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

          <NavigationBar
            className="hidden md:flex"
            itemClickedCallback={() => setShowHamburgerMenu(false)}
          />

          {!showHamburgerMenu &&
            (walletState === "CONNECTED" ? (
              <WalletDropdown />
            ) : (
              <ConnectButton />
            ))}
        </div>
        <Button.Icon
          icon={showHamburgerMenu ? "SvgX" : "SvgHamburger"}
          onClick={toggleMenu}
          className="p-1 md:hidden"
          color="plain"
        />
      </header>
      {showHamburgerMenu && (
        <div
          className={twMerge(
            "animate-fade-in-from-above fixed inset-0 z-[11] mt-12 bg-accent",
            closeMenu && "animate-fade-out-to-above",
          )}
        >
          <NavigationBar
            itemClickedCallback={() => setShowHamburgerMenu(false)}
          />
          <img
            src={hamburgerMenuBg}
            className="absolute bottom-0 left-0 right-0"
          />

          <div className="px-5 pt-4">
            {walletState === "CONNECTED" ? (
              <WalletDropdown />
            ) : (
              <ConnectButton btnClassName="w-full" size="md" />
            )}
          </div>
        </div>
      )}

      {/* full height reference element for intersection observer that is used inside useHeaderShadow */}
      <div
        ref={intersectionReferenceElement}
        className="absolute left-0 top-0 z-[-10] h-screen w-2"
      ></div>
    </>
  )
}

export default Header
