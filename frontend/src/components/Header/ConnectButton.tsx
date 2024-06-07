import { Button } from "@/components/Button/Button"
import { useWalletContext } from "@/hooks/useWalletContext"
import { SimpleModal } from "@/components/Modal/SimpleModal.tsx"
import { useEffect, useState } from "react"
import { AvailableIcons, Icon } from "@/components/Icon/Icon.tsx"
import { twMerge } from "tailwind-merge"

/**
 * Connect button which opens a modal for choosing a wallet to connect to.
 * @constructor
 */
export const ConnectButton = () => {
  const {
    walletState,
    truncatedAddress,
    signInWithPhantom,
    signInWithBackpack,
    signOut,
  } = useWalletContext()

  const [showModal, setShowModal] = useState(false)
  const [showNoWallet, setShowNoWallet] = useState(false)

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
        <SimpleModal showCloseBtn={!showNoWallet} onClose={() => {
          setShowModal(false)
          setShowNoWallet(false)
        }}>
          <div className="flex flex-col items-center justify-center max-sm:h-full">
            { showNoWallet
              ? <NoWalletModalContent close={() => setShowNoWallet(false)} />
              : <>
                {/* Heading */}
                <div className="w-full p-[17px] text-center">
                  <h1 className="text-body-xl-semibold text-white">
                    Connect a Solana Wallet
                  </h1>
                </div>
                {/* Body */}
                <div className={twMerge(
                  'w-full flex grow flex-col justify-start',
                  'px-4 pt-14 lg:px-10 lg:pt-11'
                )}>
                  <div
                    className={twMerge(
                      'flex w-full flex-col lg:flex-row items-center justify-center',
                      'gap-4 lg:gap-6',
                      // 'p-4 lg:flex-row lg:gap-6 lg:p-[56px] lg:pb-[40px]',
                    )}>
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
                  <div className='mt-4 lg:mt-5 mb-8'>
                    <p
                      onClick={() => setShowNoWallet(true)}
                      className="p-3 text-center text-fg-primary select-none cursor-pointer hover:underline">I don't
                      have a wallet</p>
                  </div>
                </div>
              </>}
          </div>
        </SimpleModal>
      )}
    </>
  )
}
function NoWalletModalContent({ close }: { close: () => void }) {
  const iconCss = twMerge(
    'text-2xl hover:bg-tertiary rounded-full',
    'select-none cursor-pointer',
  )
  return <>
    {/* Heading */}
    <div className="w-full p-[17px] text-center flex items-center">
      <Icon icon={'SvgArrowLeft'} onClick={close} className={iconCss} />
      <h1 className="grow text-body-xl-semibold text-white">
        No wallet?
      </h1>
      <div className="w-6"></div>
    </div>
    {/* Body */}
    <div className={twMerge(
      'w-full flex flex-col grow items-center justify-start lg:justify-center',
      'gap-5 px-10 pt-14 lg:pt-3 pb-8',
    )}>
      <p className="text-body-l-regular text-fg-tertiary">New to DeFI? Create a wallet now:</p>
      <WalletProvider
        icon={"SvgPhantom"}
        label={"Create a Phantom Wallet"}
        onClick={() => window.open('https://phantom.app','_blank')}
      />
      <p className="text-center text-fg-secondary">Phantom is a robust, multi-chain wallet<br />trusted by
        over 3 million users.</p>
    </div>
  </>
}



type WalletProviderProps = {
  icon: AvailableIcons
  label: string
  onClick: () => void
}

function WalletProvider({ icon, label, onClick }: WalletProviderProps) {
  const className = twMerge(
    "flex flex-col items-center justify-center gap-4",
    "p-[40px]",
    "w-full border border-bd-primary rounded-2xl hover:bg-tertiary cursor-pointer",
  )
  return (
    <div onClick={onClick} className={className}>
      <Icon className="text-[60px]" icon={icon} />
      <p className="text-body-l-medium text-white">{label}</p>
    </div>
  )
}
