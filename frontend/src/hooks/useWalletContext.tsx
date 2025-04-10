import { createContext, ReactNode, useContext, useEffect, useState } from "react"
import { usePersistedState } from "@/hooks/usePersistedState.ts"
import { isMobile } from "@/utils/isMobile.ts"
import { useSearchParams } from "react-router-dom"
import { PublicKey, Transaction } from "@solana/web3.js"
import { toast } from "react-toastify"

const AUTO_CONNECT_PARAM_KEY = "autoConnect"
const PAGE_URL = window.location.origin
const PAGE_DOMAIN = window.location.host

export type WalletState = "NOT_CONNECTED" | "CONNECTING" | "CONNECTED"

const SupportedWallets = ["PHANTOM", "BACKPACK", "SOLFLARE"] as const
export type SupportedWallet = (typeof SupportedWallets)[number]

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
  signTransaction: (transaction: Transaction, walletType: SupportedWallet) => Promise<Transaction | null>
  isWalletConnected: boolean
  isConnectedWithLedger: boolean
  setIsConnectedWithLedger: (value: boolean) => void
}

const WalletContext = createContext<Context | undefined>(undefined)

export function useWalletContext() {
  const context = useContext(WalletContext)
  if (!context) throw new Error("Component is outside of the <WalletProvider />")
  return context
}

/**
 * Provider provided by the extension
 * e.g. window.phantom.solana or window.backpack or window.solflare
 * Typing not complete.
 */
export type Provider = {
  signIn: (args: { domain: string }) => Promise<{
    address: { toString(): string }
  }>
  connect: () => Promise<{
    publicKey: { toString(): string }
  }>
  signTransaction: (transacton: Transaction) => Promise<Transaction>
  publicKey: PublicKey
  isConnected: boolean
}

export type signTransactionArgs = {
  walletType: SupportedWallet
  tokenAmount: number
  rpcUrl: string
  tokenMintAddress: PublicKey
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
  const [walletProvider, setWalletProvider] = usePersistedState<SupportedWallet | "">("wallet")
  const initialWalletState: WalletState = address ? "CONNECTED" : "NOT_CONNECTED"
  const [walletState, setWalletState] = useState<WalletState>(initialWalletState)
  const [isConnectedWithLedger, setIsConnectedWithLedger] = useState(false)

  const isWalletConnected = walletState === "CONNECTED" && Boolean(address)

  // autoConnect feature
  const [searchParams, setSearchParams] = useSearchParams()
  const autoConnect = searchParams.get(AUTO_CONNECT_PARAM_KEY)
  useEffect(() => {
    if (autoConnect === null) return

    if (autoConnect.toUpperCase() === "PHANTOM") {
      signInWithPhantom()
    } else if (autoConnect.toUpperCase() === "BACKPACK") {
      signInWithBackpack()
    } else if (autoConnect.toUpperCase() === "SOLFLARE") {
      signInWithSolflare()
    }

    setSearchParams((searchParams) => {
      searchParams.delete(AUTO_CONNECT_PARAM_KEY)
      return searchParams
    })
    // don't wanna add signInWithPhantom and signInWithBackpack in deps array
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoConnect, setSearchParams])

  // Check if user is connected with Ledger after page reload
  useEffect(() => {
    if (!address || !walletProvider) return

    const checkLedgerConnection = async () => {
      try {
        const storedLedgerPreference = localStorage.getItem("isUsingLedger")
        if (storedLedgerPreference === "true") {
          setIsConnectedWithLedger(true)
          return
        }
      } catch (error) {
        console.error("Error checking Ledger connection:", error)
      }
    }

    checkLedgerConnection()
  }, [address, walletProvider])

  // Set up wallet event listeners
  useEffect(() => {
    if (!walletProvider) return

    console.log(`Setting up event listeners for ${walletProvider}`)

    // Handle connect event
    const handleConnect = (publicKey: any) => {
      console.log("Wallet connected:", publicKey)
      if (publicKey) {
        // Handle different formats of publicKey based on wallet provider
        let address = ""
        if (walletProvider === "BACKPACK") {
          // Backpack returns an object with a publicKey property
          if (typeof publicKey === 'object' && publicKey.publicKey) {
            address = publicKey.publicKey
          } else {
            address = typeof publicKey === 'string' ? publicKey : publicKey.toString()
          }
        } else {
          // For Phantom and Solflare
          address = publicKey.toString()
        }
        
        console.log("Setting address to:", address)
        setAddress(address)
        setWalletState("CONNECTED")
        // toast.info("Wallet connected")
      }
    }

    // Handle disconnect event
    const handleDisconnect = () => {
      console.log("Wallet disconnected")
      setAddress("")
      setWalletState("NOT_CONNECTED")
      setWalletProvider("")
      toast.info("Wallet disconnected")
    }

    // Set up event listeners based on the wallet provider
    let cleanupFunctions: (() => void)[] = []

    if (walletProvider === "PHANTOM") {
      // @ts-expect-error no typings
      const phantom = window?.phantom?.solana
      console.log("Phantom provider:", phantom)
      console.log("Phantom provider details:", {
        isConnected: phantom?.isConnected,
        publicKey: phantom?.publicKey?.toString(),
        _events: phantom?._events,
        _eventsCount: phantom?._eventsCount
      })
      
      if (phantom) {
        // Add event listeners directly to the Phantom provider
        console.log("Adding connect event listener to Phantom")
        phantom.on("connect", (publicKey: any) => {
          console.log("Phantom connect event triggered with:", publicKey)
          handleConnect(publicKey)
        })
        
        console.log("Adding disconnect event listener to Phantom")
        phantom.on("disconnect", () => {
          console.log("Phantom disconnect event triggered")
          handleDisconnect()
        })
        
        // Use the exact approach from the Phantom documentation
        const handlePhantomAccountChanged = (publicKey: any) => {
          console.log("Phantom accountChanged event received:", publicKey)
          console.log("Phantom accountChanged event type:", typeof publicKey)
          console.log("Phantom accountChanged event properties:", Object.keys(publicKey || {}))
          
          if (publicKey) {
            // Set new public key and continue as usual
            try {
              const address = publicKey.toBase58()
              console.log(`Switched to account ${address}`)
              setAddress(address)
              // toast.info(`Wallet account changed to ${truncateAddress(address)}`)
            } catch (error) {
              console.error("Error calling toBase58():", error)
              // Fallback to toString() if toBase58() fails
              try {
                const address = publicKey.toString()
                console.log(`Switched to account (fallback) ${address}`)
                setAddress(address)
              } catch (error) {
                console.error("Error calling toString():", error)
                console.log("Raw publicKey value:", publicKey)
              }
            }
          } else {
            // Attempt to reconnect to Phantom
            console.log("No public key provided, attempting to reconnect")
            phantom.connect().catch((error: Error) => {
              console.error("Failed to reconnect to Phantom:", error)
            })
          }
        }
        
        // Try multiple approaches to detect account changes
        console.log("Adding accountChanged event listener to Phantom")
        phantom.on("accountChanged", handlePhantomAccountChanged)
        
        // Add event listeners for page visibility and focus changes
        const handleVisibilityChange = () => {
          if (document.visibilityState === 'visible') {
            console.log("Page became visible, checking Phantom account")
            if (phantom.publicKey) {
              const currentAddress = phantom.publicKey.toString()
              console.log("Current Phantom address on visibility change:", currentAddress)
              if (currentAddress !== address) {
                console.log(`Account changed from ${address} to ${currentAddress} (detected via visibility change)`)
                setAddress(currentAddress)
              }
            }
          }
        }
        
        const handleFocusChange = () => {
          console.log("Window focused, checking Phantom account")
          if (phantom.publicKey) {
            const currentAddress = phantom.publicKey.toString()
            console.log("Current Phantom address on focus change:", currentAddress)
            if (currentAddress !== address) {
              console.log(`Account changed from ${address} to ${currentAddress} (detected via focus change)`)
              setAddress(currentAddress)
            }
          }
        }
        
        // Add event listeners
        document.addEventListener('visibilitychange', handleVisibilityChange)
        window.addEventListener('focus', handleFocusChange)
        
        // Add cleanup functions
        cleanupFunctions.push(() => {
          console.log("Cleaning up Phantom event listeners")
          phantom.removeListener("connect", handleConnect)
          phantom.removeListener("disconnect", handleDisconnect)
          phantom.removeListener("accountChanged", handlePhantomAccountChanged)
          document.removeEventListener('visibilitychange', handleVisibilityChange)
          window.removeEventListener('focus', handleFocusChange)
        })
        
        // SIMPLIFIED APPROACH: Use a direct method to detect account changes
        console.log("Setting up direct account change detection for Phantom")
        
        // Create a function to check the current account
        const checkCurrentAccount = async () => {
          try {
            // Try to get the current account directly
            const currentAccount = await phantom.connect({ onlyIfTrusted: true })
            console.log("Direct account check result:", currentAccount)
            
            if (currentAccount && currentAccount.publicKey) {
              const newAddress = currentAccount.publicKey.toString()
              console.log(`Direct account check: Current address is ${newAddress}`)
              
              if (newAddress !== address) {
                console.log(`Account changed from ${address} to ${newAddress} (detected via direct check)`)
                setAddress(newAddress)
              }
            }
          } catch (error) {
            console.log("Direct account check error (expected if not trusted):", error)
          }
        }
        
        // Check the account immediately
        checkCurrentAccount()
        
        // Try to use the Phantom provider's connect method with a callback
        console.log("Setting up Phantom connect with callback")
        const originalConnect = phantom.connect
        phantom.connect = function(...args: any[]) {
          console.log("Phantom connect called with args:", args)
          return originalConnect.apply(this, args).then((result: any) => {
            console.log("Phantom connect result:", result)
            if (result && result.publicKey) {
              const newAddress = result.publicKey.toString()
              console.log(`Phantom connect: Setting address to ${newAddress}`)
              setAddress(newAddress)
            }
            return result
          })
        }
        
        cleanupFunctions.push(() => {
          console.log("Restoring original Phantom connect method")
          phantom.connect = originalConnect
        })
      } else {
        console.error("Phantom provider not found!")
      }
    } else if (walletProvider === "BACKPACK") {
      // @ts-expect-error no typings
      const backpack = window?.backpack
      console.log("Backpack provider:", backpack)
      
      if (backpack) {
        // Add event listeners to the Backpack provider
        backpack.on("connect", handleConnect)
        backpack.on("disconnect", handleDisconnect)
        
        // Handle account change event for Backpack
        const handleBackpackAccountChanged = (publicKey: any) => {
          console.log("Backpack accountChanged event received:", publicKey)
          if (publicKey) {
            // Handle Backpack's specific format
            let address = ""
            if (typeof publicKey === 'object' && publicKey.publicKey) {
              address = publicKey.publicKey
            } else {
              address = typeof publicKey === 'string' ? publicKey : publicKey.toString()
            }
            
            console.log(`Account changed to ${address}`)
            setAddress(address)
            // toast.info(`Wallet account changed to ${truncateAddress(address)}`)
          } else {
            // Attempt to reconnect
            console.log("No public key provided, attempting to reconnect")
            backpack.connect().catch((error: Error) => {
              console.error("Failed to reconnect to Backpack:", error)
            })
          }
        }
        
        backpack.on("accountChanged", handleBackpackAccountChanged)
        
        // Add cleanup functions
        cleanupFunctions.push(() => {
          backpack.removeListener("connect", handleConnect)
          backpack.removeListener("disconnect", handleDisconnect)
          backpack.removeListener("accountChanged", handleBackpackAccountChanged)
        })
      }
    } else if (walletProvider === "SOLFLARE") {
      // @ts-expect-error no typings
      const solflare = window?.solflare
      console.log("Solflare provider:", solflare)
      
      if (solflare) {
        // Add event listeners to the Solflare provider
        solflare.on("connect", handleConnect)
        solflare.on("disconnect", handleDisconnect)
        
        // Handle account change event for Solflare
        const handleSolflareAccountChanged = (publicKey: any) => {
          console.log("Solflare accountChanged event received:", publicKey)
          if (publicKey) {
            const address = publicKey.toString()
            console.log(`Account changed to ${address}`)
            setAddress(address)
            // toast.info(`Wallet account changed to ${truncateAddress(address)}`)
          } else {
            // Attempt to reconnect
            console.log("No public key provided, attempting to reconnect")
            solflare.connect().catch((error: Error) => {
              console.error("Failed to reconnect to Solflare:", error)
            })
          }
        }
        
        solflare.on("accountChanged", handleSolflareAccountChanged)
        
        // Add cleanup functions
        cleanupFunctions.push(() => {
          solflare.removeListener("connect", handleConnect)
          solflare.removeListener("disconnect", handleDisconnect)
          solflare.removeListener("accountChanged", handleSolflareAccountChanged)
        })
      }
    }

    // Clean up event listeners when component unmounts or wallet changes
    return () => {
      console.log("Cleaning up event listeners")
      cleanupFunctions.forEach(cleanup => cleanup())
    }
  }, [walletProvider, setAddress, setWalletProvider, setWalletState, address])

  // Try to eagerly connect on page load if we have a stored wallet provider
  useEffect(() => {
    if (!walletProvider || walletState !== "NOT_CONNECTED") return

    const eagerConnect = async () => {
      try {
        let provider: any = null
        if (walletProvider === "PHANTOM") {
          // @ts-expect-error no typings
          provider = window?.phantom?.solana
        } else if (walletProvider === "BACKPACK") {
          // @ts-expect-error no typings
          provider = window?.backpack
        } else if (walletProvider === "SOLFLARE") {
          // @ts-expect-error no typings
          provider = window?.solflare
        }

        if (!provider) return

        // Try to connect without prompting the user
        const resp = await provider.connect({ onlyIfTrusted: true })
        if (resp?.publicKey) {
          console.log("Eagerly connected to wallet:", resp.publicKey.toString())
          setAddress(resp.publicKey.toString())
          setWalletState("CONNECTED")
        }
      } catch (error) {
        console.log("Eager connection failed, user will need to connect manually")
      }
    }

    eagerConnect()
  }, [walletProvider, walletState, setAddress, setWalletState])

  //// not hooks
  async function signInWithPhantom() {
    await signInWith({
      wallet: "PHANTOM",
      // @ts-expect-error no typings
      getProvider: () => window?.phantom?.solana,
      signIn: async () => {
        // @ts-expect-error no typings
        const provider = window?.phantom?.solana
        try {
          const signInRes = await provider.connect()
          const address = signInRes.publicKey.toString()
          return address
        } catch (error) {
          console.error("Connection error:", error)
          throw error
        }
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
        const provider = window?.backpack
        try {
          const signInRes = await provider.connect()
          const address = signInRes.publicKey.toString()
          return address
        } catch (error) {
          console.error("Connection error:", error)
          throw error
        }
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
        if (wallet === "SOLFLARE") {
          const deepLink = `https://${wallet}.com/ul/v1/browse/${encodedUrl}?ref=${encodedPageUrl}`
          window.location.href = deepLink
        } else {
          const deepLink = `https://${wallet}.app/ul/browse/${encodedUrl}?ref=${encodedPageUrl}`
          window.location.href = deepLink
        }
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
  async function signTransaction(transaction: Transaction, walletType: SupportedWallet): Promise<Transaction | null> {
    let provider
    try {
      if (walletType === "BACKPACK") {
        // @ts-expect-error no typing
        provider = window?.backpack
        if (!provider.isConnected) {
          toast("Wallet session timed out, please sign in again")
          await signInWithBackpack()
        }
      } else if (walletType === "PHANTOM") {
        // @ts-expect-error no typing
        provider = window?.phantom.solana
        if (!provider.isConnected) {
          toast("Wallet session timed out, please sign in again")
          await signInWithPhantom()
        }
      } else if (walletType === "SOLFLARE") {
        // @ts-expect-error no typing
        provider = window?.solflare
        if (!provider.isConnected) {
          toast("Wallet session timed out, please sign in again")
          await signInWithSolflare()
        }
      }
      if (!provider) throw new Error("Provider not found!")
      const signedTx = await provider.signTransaction(transaction)

      return signedTx
    } catch (error) {
      console.error(error)
      return null
    }
  }

  async function signOut() {
    setAddress("")
    setWalletState("NOT_CONNECTED")
    setWalletProvider("")
    setIsConnectedWithLedger(false)
    // disconnecting needs to be done manually for Solflare wallet
    // @ts-expect-error no typings
    await window.solflare.disconnect()
  }

  async function signMessage(message: string) {
    if (walletProvider === "PHANTOM") {
      // @ts-expect-error no typing
      const signature = await window.solana.signMessage(Buffer.from(message))
      return signature.signature
    } else if (walletProvider === "BACKPACK") {
      // @ts-expect-error no typing
      const signature = await window.backpack.signMessage(Buffer.from(message))
      return signature.signature
    } else if (walletProvider === "SOLFLARE") {
      // @ts-expect-error no typing
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
        signTransaction,
        isWalletConnected,
        isConnectedWithLedger,
        setIsConnectedWithLedger,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

function truncateAddress(address: string) {
  return address.slice(0, 4) + "..." + address.slice(-4)
}
