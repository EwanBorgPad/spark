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
    element: <App />,
    children: [
      {
        path: "/",
        element: (
          <div>
            <Link to={"/project"}>
              <Button size="xl" color="primary" btnText="Go To Project" />
            </Link>
          </div>
        ),
      },
      {
        path: "/project",
        element: <Project />,
      },
      {
        path: "/terms-and-services",
        element: (
          <div className="flex h-screen flex-col items-center justify-center">
            <ScrollRestoration />
            <Link to={"/project"}>
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
    <WalletProvider>
      <RouterProvider router={router} />
    </WalletProvider>
  </React.StrictMode>,
)
