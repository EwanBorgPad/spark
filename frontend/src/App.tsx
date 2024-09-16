import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { Outlet } from "react-router-dom"
import "./i18n/i18n"

import Header from "./components/Header/Header"
import Footer from "./components/Footer/Footer"

function App() {
  return (
    <div className="max-w-screen flex min-h-screen flex-col items-center justify-center  bg-default font-geist text-fg-primary">
      <ToastContainer />

      <Header />
      <Outlet />
      <Footer />
    </div>
  )
}

export default App
