// see ProjectTester2.tsx
import { mockDate } from "@/utils/mockDate.ts"
mockDate()

import React from "react"
import ReactDOM from "react-dom/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Outlet, RouterProvider, createBrowserRouter } from "react-router-dom"

import App from "./App"
import Project from "./pages/Project"
import NotFound from "./pages/NotFound"
import Manifesto from "./pages/Manifesto"
import TermsOfUse from "./pages/TermsOfUse"
import LaunchPools from "./pages/LaunchPools"
import AngelStaking from "./pages/AngelStaking"
import { WalletProvider } from "@/hooks/useWalletContext"
import TermsAndConditions from "./pages/TermsAndConditions"
import { ProjectDataProvider } from "./hooks/useProjectData"
import { BalanceProvider } from "@/hooks/useBalanceContext.tsx"
import SomethingWentWrong from "./components/SomethingWentWrong"

import "./index.css"

import { Buffer } from "buffer"
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
