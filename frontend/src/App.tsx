import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { Outlet } from "react-router-dom"
import "./i18n/i18n"

import Header from "./components/Header/Header"
import Footer from "./components/Footer/Footer"
import EnvBanner from "./components/EnvBanner"
import * as Sentry from "@sentry/react"

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  // Learn more at
  // https://docs.sentry.io/platforms/javascript/configuration/options/#traces-sample-rate
  tracesSampleRate: 1.0,
  environment: import.meta.env.VITE_ENVIRONMENT_TYPE,
})

function App() {
  return (
    <div className="max-w-screen relative flex min-h-screen flex-col items-center justify-start overscroll-x-none bg-accent font-geist text-fg-primary">
      {/* <EnvBanner /> */}
      {/* <ToastContainer /> */}

      {/* <Header /> */}
      <Outlet />
      {/* <Footer /> */}
    </div>
  )
}

export default App
