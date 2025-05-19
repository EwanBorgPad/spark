// see ProjectTester2.tsx
import { mockDate } from "@/utils/mockDate.ts"
mockDate()

import React, { lazy, Suspense } from "react"
import ReactDOM from "react-dom/client"
import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Outlet, RouterProvider, createBrowserRouter } from "react-router-dom"
import { PrivyProvider } from "@privy-io/react-auth"
import App from "./App"
import { WalletProvider } from "@/hooks/useWalletContext"
import { ProjectDataProvider } from "./hooks/useProjectData"
import SomethingWentWrong from "./components/SomethingWentWrong"

import "./index.css"

import { Buffer } from "buffer"
import { toast } from "react-toastify"
import RedirectToLaunchPools from "./components/LaunchPool/RedirectToLaunchPools"
import { ROUTES } from "./utils/routes"
// import BackOffice from './pages/BackOffice2'
// import BackOfficeDashboard from "./pages/BackOfficeDashboard"
import { AuthProvider } from "./hooks/useAuthContext"
import ProtectedRoute from "./components/BackOffice/ProtectedRoute"
import LandingPage from "./pages/LandingPage2"
import Project from "./pages/Project"
import DraftPickPage from "./pages/DraftPickPage"
import DraftPicks from "./pages/DraftPicks"
import LaunchPools from "./pages/LaunchPools"
import GetStarted from "./pages/GetStarted"
import Connection from "./pages/Connection"
import EmailConnection from "./pages/EmailConnection"
import LandingPage2 from "./pages/LandingPage2"
import Username from "./pages/Username"
import Terms from "./pages/Terms"
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
const TermsOfUse = lazy(() => import("./pages/TermsOfUse"))
const TermsAndConditions = lazy(() => import("./pages/TermsAndConditions"))
const NotFound = lazy(() => import("./pages/NotFound"))

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <QueryClientProvider client={queryClient}>
        <PrivyProvider
          appId={import.meta.env.VITE_PRIVY_APP_ID || ''}
          clientId={import.meta.env.VITE_PRIVY_CLIENT_ID || ''}
          config={{
            embeddedWallets: {
              solana: {
                createOnLogin: 'all-users',
              },
            },
            appearance: {
              accentColor: "#6A6FF5",
              theme: "#222224",
              showWalletLoginFirst: false,
              logo: "https://auth.privy.io/logos/privy-logo-dark.png",
              landingHeader: 'Spark',
              loginMessage: 'Your gateway to the future of DeFi',
              walletChainType: "solana-only",
              walletList: [
                "detected_wallets",
                "metamask",
                "phantom"
              ]
            },
            loginMethods: [
              "email",
              "twitter",
              "apple",
              "google"
            ],
            fundingMethodConfig: {
              moonpay: {
                useSandbox: true
              }
            },
            mfa: {
              noPromptOnMfaRequired: false
            },
            solanaClusters: [
              { name: 'mainnet-beta', rpcUrl: import.meta.env.VITE_MAINNET_RPC_URL },
              { name: 'devnet', rpcUrl: import.meta.env.VITE_DEVNET_RPC_URL },
            ]
          }}
        >
          <App />
        </PrivyProvider>

      </QueryClientProvider>
    ),
    children: [
      {
        path: ROUTES.GET_STARTED,
        element: <GetStarted />,
      },
      {
        path: ROUTES.CONNECTION,
        element: <Connection />,
      },
      {
        path: ROUTES.EMAIL_CONNECTION,
        element: <EmailConnection />,
      },
      {
        path: ROUTES.LANDING_PAGE,
        element: <LandingPage />,
      },
      {
        path: ROUTES.LANDING_PAGE_2,
        element: <LandingPage2 />,
      },
      {
        path: ROUTES.USERNAME,
        element: <Username />,
      },
      {
        path: ROUTES.TERMS,
        element: <Terms />,
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
        path: ROUTES.LAUNCH_POOLS,
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
            element: <LaunchPools />,
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
        path: "/goat-pools/*",
        element: <RedirectToLaunchPools />,
      },
      {
        path: "/blitz-pools/*",
        element: <RedirectToLaunchPools />,
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