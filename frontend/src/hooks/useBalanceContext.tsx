import { createContext, ReactNode, useContext, useEffect, useState } from "react"
import { getSplTokenBalance, TokenAmount } from "../../shared/SolanaWeb3.ts"
import { useWalletContext } from "@/hooks/useWalletContext.tsx"
import { USDC_DEV_ADDRESS } from "../../shared/constants.ts"

type Context = {
  balance: null | TokenAmount
}

const BalanceContext = createContext<Context | undefined>(undefined)

export function useBalanceContext() {
  const context = useContext(BalanceContext)
  if (!context)
    throw new Error("Component is outside of the <BalanceProvider />")
  return context
}

export function BalanceProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState<TokenAmount | null>(null)

  const { address } = useWalletContext()

  async function fetchBalance() {
    if (!address) {
      setBalance(null)
      return
    }

    const tokenAmount = await getSplTokenBalance({
      address,
      tokenAddress: USDC_DEV_ADDRESS,
    })

    if (tokenAmount) {
      setBalance(tokenAmount)
    } else {
      setBalance(null)
    }
  }

  useEffect(() => {
    fetchBalance()
  }, [address])

  return (
    <BalanceContext.Provider
      value={{
        balance
      }}
    >
      {children}
    </BalanceContext.Provider>
  )
}
