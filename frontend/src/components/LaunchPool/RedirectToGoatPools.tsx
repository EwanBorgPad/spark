import { Navigate, useLocation } from "react-router-dom"

/**
 * this function serves only to redirect from "/launch-pools/*" to new path "/goat-pools/*"
 */
const RedirectToGoatPools = () => {
  const { pathname } = useLocation()
  const projectId = pathname.split("/")[2]
  return <Navigate to={`/goat-pools/${projectId ?? ""}`} replace />
}

export default RedirectToGoatPools
