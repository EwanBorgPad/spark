import { RouterProvider, createBrowserRouter } from "react-router-dom"
import ReactDOM from "react-dom/client"
import React from "react"
import "./index.css"

import { WalletProvider } from "@/hooks/useWalletContext"
import TermsOfService from "./pages/TermsOfService"
import NotFound from "./pages/NotFound"
import Homepage from "./pages/Homepage"
import Project from "./pages/Project"
import App from "./App"
import { WhitelistStatusProvider } from "./hooks/useWhitelistContext"
import { BalanceProvider } from "@/hooks/useBalanceContext.tsx"
import { TwitterProvider } from "@/hooks/useTwitterContext.tsx"

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <TwitterProvider>
        <WalletProvider>
          <BalanceProvider>
            <App />
          </BalanceProvider>
        </WalletProvider>
      </TwitterProvider>
    ),
    children: [
      {
        path: "/",
        element: <Homepage />,
      },
      {
        path: "/project/:projectId",
        element: <Project />,
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
