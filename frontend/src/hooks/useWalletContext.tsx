import { createContext, ReactNode, useContext, useState } from "react"
import { usePersistedState } from "@/hooks/usePersistedState.ts"

export type WalletState = "NOT_CONNECTED" | "CONNECTING" | "CONNECTED"
/**
 * Different Wallet Providers (not sure if that's the right now)
 * Phantom: https://phantom.app/
 * Backpack: https://backpack.app/
 */
export type WalletProvider = "PHANTOM" | "BACKPACK" | ""

type Context = {
  address: string
  walletState: WalletState
  walletProvider: WalletProvider
  signInWithPhantom: () => void
  signInWithBackpack: () => void
  signOut: () => void
  isSignedIn: boolean
  truncatedAddress: string
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
  const [address, setAddress] = usePersistedState("address")
  const [walletProvider, setWalletProvider] =
    usePersistedState<WalletProvider>("walletProvider")

  const initialWalletState: WalletState = address
    ? "CONNECTED"
    : "NOT_CONNECTED"
  const [walletState, setWalletState] =
    useState<WalletState>(initialWalletState)

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
      setWalletProvider("PHANTOM")
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
      setWalletProvider("BACKPACK")
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
    setWalletProvider("")
  }

  const isSignedIn = Boolean(address)
  const truncatedAddress = truncateAddress(address)

  return (
    <WalletContext.Provider
      value={{
        address,
        walletState,
        walletProvider,
        signInWithPhantom,
        signInWithBackpack,
        signOut,
        isSignedIn,
        truncatedAddress,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

function truncateAddress(address: string) {
  return address.slice(0, 4) + "..." + address.slice(-4)
}
