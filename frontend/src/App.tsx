import "./i18n/i18n"
import backdropImg from "./assets/backdropImgMin.png"
import Header from "./components/Header/Header"
import { Outlet } from "react-router-dom"
import Footer from "./components/Footer/Footer"

function App() {
  return (
    <div className="max-w-screen flex min-h-screen flex-col items-center justify-center overflow-x-hidden overflow-y-scroll bg-default font-geist text-fg-primary">
      <div className="max-w-screen absolute left-0 top-10 -z-[-10] w-full overflow-hidden lg:top-16">
        <img
          src={backdropImg}
          className="h-[740px] min-w-[1440px] lg:h-auto lg:w-screen"
        />
      </div>

      <Header />

      <Outlet />
      <Footer />
    </div>
  )
}

export default App
