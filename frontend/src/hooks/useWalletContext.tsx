import { createContext, ReactNode, useContext, useState } from "react"
import { usePersistedState } from "@/hooks/usePersistedState.ts"
import { isMobile } from "@/utils/isMobile.ts"

const PAGE_URL = "https://borgpad.pages.dev"
/**
 * I've just hardcoded this to current host, hope it doesn't backfire
 */
const PAGE_DOMAIN = window.location.host

export type WalletState = "NOT_CONNECTED" | "CONNECTING" | "CONNECTED"

const SupportedWallets = ["PHANTOM", "BACKPACK"] as const
type SupportedWallet = (typeof SupportedWallets)[number]

type Context = {
  address: string
  walletState: WalletState
  walletProvider: SupportedWallet | ""
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
 * Provider provided by the extension
 * e.g. window.phantom.solana or window.backpack
 * Typing not complete.
 */
type Provider = {
  signIn: (args: { domain: string }) => Promise<{
    address: { toString(): string }
  }>
  connect: () => Promise<{
    publicKey: { toString(): string }
  }>
}

type SignInWithArgs = {
  wallet: SupportedWallet
  getProvider: () => Provider
  /**
   * SignIn (or connect, tbd) and return the address
   */
  signIn: () => Promise<string>
}

/**
 * Provides wallet connectivity functionality for the app.
 * Question: Should we use SignIn or Connect functionality, what's the difference?
 * @param children
 * @constructor
 */
export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = usePersistedState("address")
  const [walletProvider, setWalletProvider] = usePersistedState<
    SupportedWallet | ""
  >("wallet")

  const initialWalletState: WalletState = address
    ? "CONNECTED"
    : "NOT_CONNECTED"
  const [walletState, setWalletState] =
    useState<WalletState>(initialWalletState)

  async function signInWithPhantom() {
    await signInWith({
      wallet: "PHANTOM",
      // @ts-expect-error no typings
      getProvider: () => window?.phantom?.solana,
      signIn: async () => {
        //// Connect
        // const signInRes = await provider.connect()
        // const address = signInRes.publicKey.toString()
        ///////

        // @ts-expect-error no typings
        const signInRes = await window?.phantom?.solana.signIn({
          domain: PAGE_DOMAIN,
        })
        const address = signInRes.address.toString()
        return address
      },
    })
  }

  async function signInWithBackpack() {
    await signInWith({
      wallet: "BACKPACK",
      // @ts-expect-error no typings
      getProvider: () => window?.backpack,
      signIn: async () => {
        // @ts-expect-error no typings
        const signInRes = await window?.backpack?.signIn({
          domain: PAGE_DOMAIN,
        })
        const address = signInRes.account.address
        return address
      },
    })
  }

  async function signInWith({ wallet, getProvider, signIn }: SignInWithArgs) {
    const provider = getProvider()

    const isExtensionDetected = Boolean(provider)

    if (!isExtensionDetected) {
      if (isMobile()) {
        const url = encodeURIComponent(PAGE_URL)
        const deepLink = `https://${wallet}.app/ul/browse/${url}?ref=${url}`
        window.location.href = deepLink
        return
      } else {
        const message = `${wallet} not detected!`
        // temp solution, throw error until we define how to handle this gracefully
        alert(message)
        throw new Error(message)
      }
    }

    setWalletState("CONNECTING")

    // initiate connection
    try {
      const address = await signIn()

      // connection accepted
      setAddress(address)
      setWalletState("CONNECTED")
      setWalletProvider(wallet)
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
