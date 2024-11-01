// see ProjectTester2.tsx
import { mockDate } from "@/utils/mockDate.ts"
mockDate()


import React from "react"
import ReactDOM from "react-dom/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Outlet, RouterProvider, createBrowserRouter } from "react-router-dom"

import { WalletProvider } from "@/hooks/useWalletContext"
import TermsOfUse from "./pages/TermsOfUse"
import NotFound from "./pages/NotFound"
import Project from "./pages/Project"
import App from "./App"
import { ProjectDataProvider } from "./hooks/useProjectData"
import { BalanceProvider } from "@/hooks/useBalanceContext.tsx"
// @backOffice
// import BackOffice from "./pages/BackOffice"

import { Buffer } from "buffer"
import AngelStaking from "./pages/AngelStaking"
import LaunchPools from "./pages/LaunchPools"
import Manifesto from "./pages/Manifesto"

import "./index.css"
import TermsAndConditions from "./pages/TermsAndConditions"
window.Buffer = Buffer

const queryClient = new QueryClient()

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <QueryClientProvider client={queryClient}>
        <WalletProvider>
          <BalanceProvider>
            <App />
          </BalanceProvider>
        </WalletProvider>
      </QueryClientProvider>
    ),
    children: [
      {
        path: "/",
        element: <LaunchPools />,
      },
      // @backOffice
      // {
      //   path: "/back-office",
      //   element: <BackOffice />,
      // },
      {
        path: "/angel-staking",
        element: <AngelStaking />,
      },
      {
        path: "/launch-pools",
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
        path: "/manifesto",
        element: <Manifesto />,
      },
      {
        path: "/terms-of-use",
        element: <TermsOfUse />,
      },
      {
        path: "/terms-and-conditions",
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
