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
  path: string
  label: string
}
type NavigationBarProps = {
  className?: string
  itemClickedCallback: () => void
}
const navigationItems: NavigationItem[] = [
  {
    path: "/angel-staking",
    label: "Angel Staking",
  },
  {
    path: "/launch-pools",
    label: "Launch Pools",
  },
  // {
  //   path: "/manifesto",
  //   label: "Manifesto",
  // },
  // {
  //   path: "blog",
  //   label: "Blog",
  // },
  // {
  //   path: "faq",
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
    if (location.pathname === "/" && item.path === "/launch-pools") return true
    return location.pathname === item.path
  }

  const onItemClick = (item: NavigationItem) => {
    navigate(item.path)
    itemClickedCallback()
  }

  return (
    <nav className={twMerge(className)}>
      <ul className="flex flex-col items-start px-5 py-4 md:flex-row md:items-center md:gap-6 md:p-0">
        {navigationItems.map((item) => (
          <li
            key={item.path}
            className={twMerge(
              "relative flex w-full cursor-pointer flex-col items-start gap-1 py-3 text-left text-lg text-fg-secondary transition-colors duration-500 md:w-fit md:items-center md:py-0 md:text-center md:text-base",
              isItemActive(item) && "text-brand-primary",
            )}
            onClick={() => onItemClick(item)}
          >
            <span>{item.label}</span>
            {isItemActive(item) && (
              <div
                className={twMerge(
                  "absolute bottom-[-4px] hidden w-4 animate-underline border border-brand-primary md:flex",
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
  const [isMenuClosed, setIsMenuClosed] = useState(false)
  const intersectionReferenceElement = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const { walletState } = useWalletContext()
  const navigate = useNavigate()

  useHeaderShadow({ headerRef, intersectionReferenceElement })

  const closeMenu = () => {
    setIsMenuClosed(true)
    setTimeout(() => {
      setShowHamburgerMenu(false)
      setIsMenuClosed(false)
    }, 350)
  }

  const toggleMenu = () => {
    if (!showHamburgerMenu) {
      setShowHamburgerMenu(true)
      return
    }
    closeMenu()
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
          <Button
            color="plain"
            className="flex items-center gap-1 py-2"
            onClick={() => navigate("/")}
          >
            <Icon icon="SvgLogo" className="mb-[4px] h-[20px] text-2xl" />
            <span className="font-sulphur-point text-2xl leading-[28px] text-fg-primary">
              BorgPad
            </span>
          </Button>

          <NavigationBar
            className="hidden md:flex"
            itemClickedCallback={closeMenu}
          />

          {!showHamburgerMenu &&
            (walletState === "CONNECTED" ? (
              <WalletDropdown className="animate-fade-in" />
            ) : (
              <ConnectButton btnClassName="animate-fade-in" />
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
            "fixed inset-0 z-[11] mt-12 animate-fade-in-from-above bg-accent",
            isMenuClosed && "animate-fade-out-to-above",
          )}
        >
          <NavigationBar itemClickedCallback={closeMenu} />
          <img
            src={hamburgerMenuBg}
            className="absolute bottom-0 left-0 right-0 z-[-1]"
          />

          <div className="z-[1] px-5 pt-4">
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
