// see ProjectTester2.tsx
import { mockDate } from "@/utils/mockDate.ts"
mockDate()

import React from "react"
import ReactDOM from "react-dom/client"
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"
import { Outlet, RouterProvider, createBrowserRouter } from "react-router-dom"

import App from "./App"
import Project from "./pages/Project"
import NotFound from "./pages/NotFound"
import TermsOfUse from "./pages/TermsOfUse"
import GoatPools from "./pages/GoatPools"
import { WalletProvider } from "@/hooks/useWalletContext"
import TermsAndConditions from "./pages/TermsAndConditions"
import { ProjectDataProvider } from "./hooks/useProjectData"
import SomethingWentWrong from "./components/SomethingWentWrong"

import "./index.css"

import { Buffer } from "buffer"
import { toast } from "react-toastify"
import LandingPage from "./pages/LandingPage"
import BlitzPools from "./pages/BlitzPools"
import RedirectToGoatPools from "./components/LaunchPool/RedirectToGoatPools"
import { ROUTES } from "./utils/routes"
import BackOffice from './pages/BackOffice2'
import DraftPicks from "./pages/DraftPicks"
import DraftPickPage from "./pages/DraftPickPage"
import BackOfficeDashboard from "./pages/BackOfficeDashboard"
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
        path: "/back-office",
        element: <BackOffice />,
      },
      {
        path: ROUTES.BACK_OFFICE,
        element: <BackOfficeDashboard />,
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
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
