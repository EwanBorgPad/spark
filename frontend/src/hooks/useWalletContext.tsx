import { createContext, ReactNode, useContext, useState } from "react"

export type WalletState = "NOT_CONNECTED" | "CONNECTING" | "CONNECTED"

type Context = {
  address: string
  walletState: WalletState
  signInWithPhantom: () => void
  signInWithBackpack: () => void
  signOut: () => void
}

const WalletContext = createContext<Context | undefined>(undefined)

export function useWalletContext() {
  const context = useContext(WalletContext)
  if (!context)
    throw new Error("Component is outside of the <WalletProvider />")
  return context
}

/**
 * Provides wallet connectivity functionality for the app.
 * There's quite a bit of duplicate code below (separate code for Phantom and Backpack), let's leave it like this until we're sure of how it should work.
 * Question: Should we use SignIn or Connect functionality, what's the difference?
 * @param children
 * @constructor
 */
export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState("")
  const [walletState, setWalletState] = useState<WalletState>("NOT_CONNECTED")

  async function signInWithPhantom() {
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

  async function signInWithBackpack() {
    // @ts-expect-error no types
    const isBackpack = window?.backpack?.isBackpack

    if (!isBackpack) {
      const message = "Backpack not detected! Install at: https://backpack.app"
      // temp solution, throw error until we define how to handle this gracefully
      alert(message)
      throw new Error(message)
    }

    setWalletState("CONNECTING")

    // initiate connection
    try {
      // @ts-expect-error no types
      const signInRes = await window.backpack.signIn({})

      // connection accepted
      const address = signInRes.account.address
      setAddress(address)
      setWalletState("CONNECTED")
    } catch (e) {
      setWalletState("NOT_CONNECTED")

      // not sure if this is correct code for Backpack (for Phantom it is)
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
        signInWithPhantom,
        signInWithBackpack,
        signOut,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}
