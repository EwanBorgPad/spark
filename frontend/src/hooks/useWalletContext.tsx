import { createContext, ReactNode, useContext, useState } from "react"

export type WalletState = "NOT_CONNECTED" | "CONNECTING" | "CONNECTED"

type Context = {
  address: string
  walletState: WalletState
  signIn: () => void
  signOut: () => void
}

const WalletContext = createContext<Context | undefined>(undefined)

export function useWalletContext() {
  const context = useContext(WalletContext)
  if (!context)
    throw new Error("Component is outside of the <WalletProvider />")
  return context
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState("")
  const [walletState, setWalletState] = useState<WalletState>("NOT_CONNECTED")

  async function signIn() {
    // @ts-expect-error no types for phantom yet
    const isPhantom = window?.phantom?.solana?.isPhantom

    if (!isPhantom) {
      const message = "Phantom not detected! Install at: https://phantom.app"
      // temp solution, throw error until we define how to handle this gracefully
      alert(message)
      throw new Error(message)
    }

    setWalletState("CONNECTING")

    // initiate connection
    try {
      // @ts-expect-error no types for phantom yet
      const signInRes = await window.phantom.solana.signIn({})

      // connection accepted
      const address = signInRes.address.toString()
      setAddress(address)
      setWalletState("CONNECTED")
    } catch (e) {
      setWalletState("NOT_CONNECTED")

      if (e instanceof Error && e.message === "User rejected the request.") {
        // connection declined
        alert("Sign in declined by user!")
      } else {
        // rethrow
        throw e
      }
    }
  }

  async function signOut() {
    setAddress("")
    setWalletState("NOT_CONNECTED")
  }

  return (
    <WalletContext.Provider
      value={{
        address,
        walletState,
        signIn,
        signOut,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}
