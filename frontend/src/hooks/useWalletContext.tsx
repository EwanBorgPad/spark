import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react"
import { usePersistedState } from "@/hooks/usePersistedState.ts"
import { isMobile } from "@/utils/isMobile.ts"
import { useSearchParams } from "react-router-dom"

const AUTO_CONNECT_PARAM_KEY = "autoConnect"
const PAGE_URL = window.location.origin
/**
 * I've just hardcoded this to current host, hope it doesn't backfire
 */
const PAGE_DOMAIN = window.location.host

export type WalletState = "NOT_CONNECTED" | "CONNECTING" | "CONNECTED"

const SupportedWallets = ["PHANTOM", "BACKPACK", 'SOLFLARE'] as const
type SupportedWallet = (typeof SupportedWallets)[number]

type Context = {
  address: string
  walletState: WalletState
  walletProvider: SupportedWallet | ""
  signInWithPhantom: () => void
  signInWithBackpack: () => void
  signInWithSolflare: () => void
  signOut: () => void
  truncatedAddress: string
  signMessage: (message: string) => Promise<Uint8Array>
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
 * e.g. window.phantom.solana or window.backpack or window.solflare
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
  //// hooks
  const [address, setAddress] = usePersistedState("address")
  const [walletProvider, setWalletProvider] = usePersistedState<
    SupportedWallet | ""
  >("wallet")
  const initialWalletState: WalletState = address
    ? "CONNECTED"
    : "NOT_CONNECTED"
  const [walletState, setWalletState] =
    useState<WalletState>(initialWalletState)

  // autoConnect feature
  const [searchParams, setSearchParams] = useSearchParams()
  const autoConnect = searchParams.get(AUTO_CONNECT_PARAM_KEY)
  useEffect(() => {
    if (autoConnect === null) return

    if (autoConnect.toUpperCase() === "PHANTOM") {
      signInWithPhantom()
    } else if (autoConnect.toUpperCase() === "BACKPACK") {
      signInWithBackpack()
    } else if (autoConnect.toUpperCase() === 'SOLFLARE') {
      signInWithSolflare()
    }

    setSearchParams((searchParams) => {
      searchParams.delete(AUTO_CONNECT_PARAM_KEY)
      return searchParams
    })
    // don't wanna add signInWithPhantom and signInWithBackpack in deps array
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoConnect, setSearchParams])

  //// not hooks
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

  async function signInWithSolflare() {
    await signInWith({
      wallet: "SOLFLARE",
      // @ts-expect-error no typings
      getProvider: () => window?.solflare,
      signIn: async () => {
        // @ts-expect-error no typings
        const connected = await window?.solflare?.connect({
          domain: PAGE_DOMAIN,
        })
        if (!connected) throw new Error("Connection failed!")
        // @ts-expect-error no typings
        const address = window.solflare.publicKey.toString()
        return address
      },
    })
}

  async function signInWith({ wallet, getProvider, signIn }: SignInWithArgs) {
    const provider = getProvider()

    const isExtensionDetected = Boolean(provider)

    if (!isExtensionDetected) {
      if (isMobile()) {
        const url = `${PAGE_URL}/?autoConnect=${wallet}`
        const encodedUrl = encodeURIComponent(url)
        const encodedPageUrl = encodeURIComponent(PAGE_URL)
        const deepLink = `https://${wallet}.app/ul/browse/${encodedUrl}?ref=${encodedPageUrl}`
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
    // disconnecting needs to be done manually for Solflare wallet
    // @ts-expect-error no typings
    await window.solflare.disconnect()
  }

  async function signMessage(message: string) {
    if (walletProvider === 'PHANTOM') {
      // @ts-expect-error
      const signature = await window.solana.signMessage(Buffer.from(message))
      return signature.signature
    } else if (walletProvider === 'BACKPACK') {
      // @ts-expect-error
      const signature = await window.backpack.signMessage(Buffer.from(message))
      return signature.signature
    } else if (walletProvider === 'SOLFLARE') {
      // @ts-expect-error
      const signature = await window.solflare.signMessage(Buffer.from(message))
      return signature.signature
    } else {
      throw new Error(`Unknown wallet provider: ${walletProvider} !`)
    }
  }

  const truncatedAddress = truncateAddress(address)

  return (
    <WalletContext.Provider
      value={{
        address,
        walletState,
        walletProvider,
        signInWithPhantom,
        signInWithBackpack,
        signInWithSolflare,
        signOut,
        truncatedAddress,
        signMessage,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

function truncateAddress(address: string) {
  return address.slice(0, 4) + "..." + address.slice(-4)
}
