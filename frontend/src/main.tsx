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
import Project from "./pages/Project"
import GetStarted from "./pages/GetStarted"
import Connection from "./pages/Connection"
import EmailConnection from "./pages/EmailConnection"
import Username from "./pages/Username"
import Terms from "./pages/Terms"
import Profile from "./pages/Profile"
import Search from "./pages/Search"
import Projects from "./pages/Projects"
import Providers from "./providers/PrivyProvider"
import LandingPage from "./pages/LandingPage"
import PwaInstall from "./pages/PwaInstall"
import Apply from "./pages/Apply"
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
        <Providers>
          <App />
        </Providers>
      </QueryClientProvider>
    ),
    children: [
      {
        path: ROUTES.LANDING_PAGE,
        element: <LandingPage />,
      },
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
        path: ROUTES.PROJECTS,
        element: <Outlet />,
        children: [
          {
            path: ":id",
            element: (
              <Project />
            ),
          },
          {
            path: "",
            element: <Projects />,
          },
        ],
      },
      {
        path: ROUTES.USERNAME,
        element: <Username />,
      },
      {
        path: ROUTES.PROFILE,
        element: <Profile />,
      },
      {
        path: ROUTES.TERMS,
        element: <Terms />,
      },
      {
        path: ROUTES.SEARCH,
        element: <Search />,
      },
      {
        path: ROUTES.APPLY,
        element: <Apply />,
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
        path: "/pwa-install",
        element: <PwaInstall />,
      },
      // {
      //   path: "*",
      //   element: <NotFound />,
      // },
    ],
  },
])

ReactDOM.createRoot(document.getElementById("root")!).render(
  // <React.StrictMode>
  <RouterProvider router={router} />,
  // </React.StrictMode>,
)