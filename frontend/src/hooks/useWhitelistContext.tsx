/**
 * Context Boilerplate
 */

import {
  whitelistDummyData,
  WhitelistStatusType,
} from "@/data/whitelistingData"
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"

type Context = {
  isUserWhitelisted: boolean | undefined
  whitelistStatus: WhitelistStatusType | undefined
  setWhitelistStatus: (whitelistStatus: WhitelistStatusType | undefined) => void
  getWhitelistStatus: () => void
  setWhitelistStatusToEligible: () => void
  setWhitelistStatusToNotEligible: () => void
}

const WhitelistStatusContext = createContext<Context | undefined>(undefined)

export function useWhitelistStatusContext() {
  const context = useContext(WhitelistStatusContext)
  if (!context)
    throw new Error("Component is outside of the <PlaceholderProvider />")
  return context
}

export function WhitelistStatusProvider({ children }: { children: ReactNode }) {
  const [whitelistStatus, setWhitelistStatus] = useState<WhitelistStatusType>()

  const getWhitelistStatus = useCallback(() => {
    setWhitelistStatus(whitelistDummyData)
  }, [])

  const setWhitelistStatusToEligible = useCallback(() => {
    setWhitelistStatus({ ...whitelistDummyData, whitelisted: true })
  }, [])

  const setWhitelistStatusToNotEligible = useCallback(() => {
    setWhitelistStatus({ ...whitelistDummyData, whitelisted: false })
  }, [])

  useEffect(() => {
    getWhitelistStatus()
  }, [getWhitelistStatus])

  const isUserWhitelisted = whitelistStatus?.whitelisted

  return (
    <WhitelistStatusContext.Provider
      value={{
        isUserWhitelisted,
        whitelistStatus,
        setWhitelistStatus,
        getWhitelistStatus,
        setWhitelistStatusToEligible,
        setWhitelistStatusToNotEligible,
      }}
    >
      {children}
    </WhitelistStatusContext.Provider>
  )
}
