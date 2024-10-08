import { Outlet, RouterProvider, createBrowserRouter } from "react-router-dom"
import ReactDOM from "react-dom/client"
import React from "react"
import "./index.css"

import { WalletProvider } from "@/hooks/useWalletContext"
import TermsOfService from "./pages/TermsOfService"
import NotFound from "./pages/NotFound"
// import Homepage from "./pages/Homepage"
import Project from "./pages/Project"
import App from "./App"
import { WhitelistStatusProvider } from "./hooks/useWhitelistContext"
import { ProjectDataProvider } from "./hooks/useProjectData"
import { BalanceProvider } from "@/hooks/useBalanceContext.tsx"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import BackOffice from "./pages/BackOffice"

import { Buffer } from "buffer"
import AngelStaking from "./pages/AngelStaking"
import LaunchPools from "./pages/LaunchPools"
import Manifesto from "./pages/Manifesto"
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
      {
        path: "/back-office",
        element: <BackOffice />,
      },
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
        path: "/terms-of-service",
        element: <TermsOfService />,
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
    <WhitelistStatusProvider>
      <RouterProvider router={router} />
    </WhitelistStatusProvider>
  </React.StrictMode>,
)
