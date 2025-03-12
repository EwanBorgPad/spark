import { ROUTES } from "@/utils/routes"
import { Navigate, useLocation } from "react-router-dom"

/**
 * this function serves only to redirect from "/launch-pools/*" to new path "/goat-pools/*"
 */
const RedirectToGoatPools = () => {
  const { pathname } = useLocation()
  const projectId = pathname.split("/")[2]
  return <Navigate to={`${ROUTES.GOAT_POOLS}/${projectId ?? ""}`} replace />
}

export default RedirectToGoatPools
