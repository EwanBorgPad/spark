import { Button } from "@/components/Button/Button"
import { useWalletContext } from "@/hooks/useWalletContext"
import { SimpleModal } from "@/components/Modal/SimpleModal.tsx"
import { useEffect, useState } from "react"
import { AvailableIcons, Icon } from "@/components/Icon/Icon.tsx"
import { twMerge } from "tailwind-merge"

export const ConnectButton = () => {
  const {
    walletState,
    truncatedAddress,
    signInWithPhantom,
    signInWithBackpack,
    signOut,
  } = useWalletContext()
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (walletState === "CONNECTED") {
      setShowModal(false)
    }
  }, [walletState, showModal])

  const btnText =
    walletState === "NOT_CONNECTED"
      ? "Connect Wallet"
      : walletState === "CONNECTING"
        ? "Connecting..."
        : walletState === "CONNECTED"
          ? truncatedAddress
          : "Unknown Status"

  function onClick() {
    if (walletState === "NOT_CONNECTED") {
      setShowModal(true)
    } else if (walletState === "CONNECTED") {
      confirm("Disconnect wallet?") && signOut()
    }
  }

  return (
    <>
      <Button onClick={onClick} size="xs" color="primary" btnText={btnText} />
      {showModal && (
        <SimpleModal onClose={() => setShowModal(false)}>
          <div className="flex flex-col items-center justify-center">
            {/* Heading */}
            <div className="w-full p-[17px] text-center">
              <h1 className="text-body-xl-semibold text-white">
                Connect a Solana Wallet
              </h1>
            </div>
            {/* Body */}
            <div className="flex w-full flex-col items-center justify-center gap-4 p-4 lg:flex-row lg:gap-6 lg:p-[56px]">
              <WalletProvider
                icon={"SvgPhantom"}
                label={"Phantom"}
                onClick={signInWithPhantom}
              />
              <WalletProvider
                icon={"SvgBackpack"}
                label={"Backpack"}
                onClick={signInWithBackpack}
              />
            </div>
          </div>
        </SimpleModal>
      )}
    </>
  )
}

type WalletProviderProps = {
  icon: AvailableIcons
  label: string
  onClick: () => void
}
function WalletProvider({ icon, label, onClick }: WalletProviderProps) {
  const className = twMerge(
    "flex flex-col items-center justify-center gap-4",
    "lg:p-[40px]",
    "w-full lg:w-[180px] h-[180px] border border-bd-primary rounded-2xl hover:bg-emphasis cursor-pointer",
  )
  return (
    <div onClick={onClick} className={className}>
      <Icon className="text-[60px]" icon={icon} />
      <p className="text-body-l-medium text-white">{label}</p>
    </div>
  )
}
