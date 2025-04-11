// see ProjectTester2.tsx
import { mockDate } from "@/utils/mockDate.ts"
mockDate()

import React, { lazy } from "react"
import ReactDOM from "react-dom/client"
import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Outlet, RouterProvider, createBrowserRouter } from "react-router-dom"

import App from "./App"
import { WalletProvider } from "@/hooks/useWalletContext"
import { ProjectDataProvider } from "./hooks/useProjectData"
import SomethingWentWrong from "./components/SomethingWentWrong"

import "./index.css"

import { Buffer } from "buffer"
import { toast } from "react-toastify"
import RedirectToGoatPools from "./components/LaunchPool/RedirectToGoatPools"
import { ROUTES } from "./utils/routes"
// import BackOffice from './pages/BackOffice2'
// import BackOfficeDashboard from "./pages/BackOfficeDashboard"
import { AuthProvider } from "./hooks/useAuthContext"
import ProtectedRoute from "./components/BackOffice/ProtectedRoute"
window.Buffer = Buffer

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => toast.error(error.message, { theme: "colored" }), // catch all useQuery errors
  }),
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
})

const BackOfficeDashboard = lazy(() => import("./pages/BackOfficeDashboard"))
const LandingPage = lazy(() => import("./pages/LandingPage"))
const Project = lazy(() => import("./pages/Project"))
const DraftPickPage = lazy(() => import("./pages/DraftPickPage"))
const DraftPicks = lazy(() => import("./pages/DraftPicks"))
const BlitzPools = lazy(() => import("./pages/BlitzPools"))
const GoatPools = lazy(() => import("./pages/GoatPools"))
const TermsOfUse = lazy(() => import("./pages/TermsOfUse"))
const TermsAndConditions = lazy(() => import("./pages/TermsAndConditions"))
const NotFound = lazy(() => import("./pages/NotFound"))

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <QueryClientProvider client={queryClient}>
        <WalletProvider>
          <App />
        </WalletProvider>
      </QueryClientProvider>
    ),
    children: [
      {
        path: ROUTES.LANDING_PAGE,
        element: <LandingPage />,
      },
      // @backOffice
      {
        path: ROUTES.BACK_OFFICE,
        element: (
          <AuthProvider>
            <ProtectedRoute>
              <BackOfficeDashboard />
            </ProtectedRoute>
          </AuthProvider>
        ),
      },
      // {
      //   path: "/angel-staking",
      //   element: <AngelStaking />,
      // },
      {
        path: ROUTES.GOAT_POOLS,
        errorElement: <SomethingWentWrong />,
        element: <Outlet />,
        children: [
          {
            path: ":projectId",
            element: (
              <ProjectDataProvider>
                <Project />
              </ProjectDataProvider>
            ),
          },
          {
            path: "",
            element: <GoatPools />,
          },
        ],
      },
      {
        path: ROUTES.BLITZ_POOLS,
        errorElement: <SomethingWentWrong />,
        element: <Outlet />,
        children: [
          {
            path: ":projectId",
            element: (
              <ProjectDataProvider>
                <Project />
              </ProjectDataProvider>
            ),
          },
          {
            path: "",
            element: <BlitzPools />,
          },
        ],
      },
      {
        path: ROUTES.DRAFT_PICKS,
        errorElement: <SomethingWentWrong />,
        element: <Outlet />,
        children: [
          {
            path: ":projectId",
            element: (
              <ProjectDataProvider>
                <DraftPickPage />
              </ProjectDataProvider>
            ),
          },
          {
            path: "",
            element: <DraftPicks />,
          },
        ],
      },
      {
        path: "/launch-pools/*",
        element: <RedirectToGoatPools />,
      },
      {
        path: ROUTES.TERMS_OF_USE,
        element: <TermsOfUse />,
      },
      {
        path: ROUTES.TERMS_AND_CONDITIONS,
        element: <TermsAndConditions />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
])

ReactDOM.createRoot(document.getElementById("root")!).render(
  // <React.StrictMode>
  <RouterProvider router={router} />,
  // </React.StrictMode>,
)
