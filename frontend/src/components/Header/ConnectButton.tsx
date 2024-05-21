import { Button } from "@/components/Button/Button"
import { useWalletContext } from '@/hooks/useWalletContext'

export const ConnectButton = () => {
  const { walletState, address, signIn, signOut } = useWalletContext()

  const btnText =
    walletState === 'NOT_CONNECTED' ? 'Connect Wallet' :
      walletState === 'CONNECTING' ? 'Connecting...' :
        walletState === 'CONNECTED' ? truncateAddress(address) :
          'Unknown Status'

  function onClick() {
    if (walletState === 'NOT_CONNECTED') signIn()
    else if (walletState === 'CONNECTED') confirm('Disconnect wallet?') && signOut()
  }

  return <Button.IconWithLabel
    icon={'SvgPhantom'}
    onClick={onClick}
    size='xs'
    color='primary'
    btnText={btnText}
  />
}

function truncateAddress(address: string) {
  return address.slice(0, 4) + '...' + address.slice(-4)
}
