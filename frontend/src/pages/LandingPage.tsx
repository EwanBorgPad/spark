import { ScrollRestoration, useNavigate } from "react-router-dom"
import { Button } from "@/components/Button/Button"
import Img from "@/components/Image/Img"
import { useEffect, useState } from "react"
import { usePrivy, useSolanaWallets } from '@privy-io/react-auth'
import { useQuery } from "@tanstack/react-query"
import { backendSparkApi } from "@/data/api/backendSparkApi"
import { ROUTES } from "@/utils/routes"
import { getCorrectWalletAddress } from "@/utils/walletUtils"

import solanaImg from "@/assets/angelStaking/solana.png"
import logoType from "@/assets/logos/type-png-resized.png"
import boltLogo from "@/assets/landingPage/bolt-logo-small.png"

const LandingPage = () => {
  const navigate = useNavigate()
  const { ready, authenticated, user: privyUser } = usePrivy()
  const { wallets } = useSolanaWallets()
  const [isCheckingConnection, setIsCheckingConnection] = useState(true)
  
  const address = getCorrectWalletAddress(privyUser, wallets)

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', address],
    queryFn: () => address ? backendSparkApi.getUser({ address }) : Promise.resolve(null),
    enabled: !!address,
  })

  // Check if user is connected and redirect to projects
  useEffect(() => {
    if (!ready) return

    const checkConnection = async () => {
      if (authenticated && address) {
        try {
          const userData = await backendSparkApi.getUser({ address })
          if (userData && userData.username) {
            // User is connected and has account, redirect to projects
            navigate(ROUTES.PROJECTS)
            return
          }
        } catch (error) {
          // User might not be fully set up yet
          console.log('User not fully set up:', error)
        }
      }
      
      // Check legacy localStorage connection
      const storedAddress = localStorage.getItem('sparkit-wallet')
      if (storedAddress && !authenticated) {
        try {
          const userData = await backendSparkApi.getUser({ address: storedAddress })
          if (userData && userData.username) {
            navigate(ROUTES.PROJECTS)
            return
          }
        } catch (error) {
          // Clear invalid stored address
          localStorage.removeItem('sparkit-wallet')
        }
      }
      
      setIsCheckingConnection(false)
    }

    checkConnection()
  }, [ready, authenticated, address, navigate])

  if (!ready || isCheckingConnection || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-accent">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-fg-primary text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-accent text-fg-primary">
      <div className="flex flex-col items-center justify-center gap-4">
        <Img src={logoType} size="custom" customClass="w-64 rounded-none" alt="Spark-it" />
        <p className="text-2xl text-fg-primary/80">Coming Soon...</p>
      </div>
      <ScrollRestoration />
    </div>
  )
}

export default LandingPage 