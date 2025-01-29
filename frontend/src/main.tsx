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
        path: "/",
        element: <LandingPage />,
      },
      // @backOffice
      // {
      //   path: "/back-office",
      //   element: <BackOffice />,
      // },
      // {
      //   path: "/angel-staking",
      //   element: <AngelStaking />,
      // },
      {
        path: "/goat-pools",
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
        path: "/blitz-pools",
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
        path: "/launch-pools/*",
        element: <RedirectToGoatPools />,
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
