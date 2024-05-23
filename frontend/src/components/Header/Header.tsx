import { ConnectButton } from "./ConnectButton"
import { Icon } from "@/components/Icon/Icon.tsx"
import { useWalletContext } from "@/hooks/useWalletContext.tsx"
import { WalletDropdown } from "@/components/Header/WalletDropdown.tsx"

const Header = () => {
  const { isSignedIn } = useWalletContext()

  return (
    <header className="fixed left-0 top-0 z-[1] flex h-12 w-full flex-row justify-center border-b-[1px] border-tertiary bg-default px-4 py-2 lg:h-[72px]">
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

        {isSignedIn ? <WalletDropdown /> : <ConnectButton />}
      </div>
    </header>
  )
}

export default Header
