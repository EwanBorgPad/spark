import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"
import React from "react"
import { WalletProvider } from "@/hooks/useWalletContext"
import {
  Link,
  RouterProvider,
  ScrollRestoration,
  createBrowserRouter,
} from "react-router-dom"
import { Button } from "./components/Button/Button"
import Project from "./pages/Project"

const router = createBrowserRouter([
  {
    path: "/",
    element: <WalletProvider>
      <App />
    </WalletProvider>,
    children: [
      {
        path: "/",
        element: (
          <div className="z-[10] flex h-screen items-center justify-center">
            <Link to={"/project/puffer-finance"}>
              <Button
                size="xl"
                color="primary"
                btnText="Go To Puffer Finance"
              />
            </Link>
          </div>
        ),
      },
      {
        path: "/project/:projectId",
        element: <Project />,
      },
      {
        path: "/terms-of-service",
        element: (
          <div className="flex h-screen flex-col items-center justify-center gap-4">
            <ScrollRestoration />
            <h1>Terms of Service Page</h1>
            <h2>TBD...</h2>
            <Link to={"/project/puffer-finance"}>
              <Button size="xl" color="primary" btnText="Go Back To Project" />
            </Link>
          </div>
        ),
      },
    ],
  },
])

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
