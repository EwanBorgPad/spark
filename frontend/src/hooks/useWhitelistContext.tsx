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

  // @TODO - REMOVE code below and add API for fetching whitelisting status data
  const getWhitelistStatus = useCallback(() => {
    setWhitelistStatus(whitelistDummyData)
  }, [])
  useEffect(() => {
    getWhitelistStatus()
  }, [getWhitelistStatus])

  // USED FOR TESTING
  const setWhitelistStatusToEligible = useCallback(() => {
    setWhitelistStatus({ ...whitelistDummyData, whitelisted: true })
  }, [])

  // USED FOR TESTING
  const setWhitelistStatusToNotEligible = useCallback(() => {
    setWhitelistStatus({ ...whitelistDummyData, whitelisted: false })
  }, [])

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
