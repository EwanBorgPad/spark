import "./i18n/i18n"
import backdropImg from "./assets/backdropImgMin.png"
import Header from "./components/Header/Header"
import { Link, RouterProvider, createBrowserRouter } from "react-router-dom"
import Project from "./pages/Project"
import { Button } from "./components/Button/Button"

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <div>
        <Link to={"/project"}>
          <Button size='xl' color='primary' btnText='Go To Project' />
        </Link>
      </div>
    ),
  },
  {
    path: "/project",
    element: <Project />,
  },
])
function App() {
  return (
    <div className='max-w-screen flex min-h-screen flex-col items-center justify-center overflow-x-hidden overflow-y-scroll bg-default font-geist text-fg-primary'>
      <div className='max-w-screen absolute left-0 top-0 -z-[0] w-full overflow-hidden'>
        <img
          src={backdropImg}
          className='h-[740px] min-w-[1440px] lg:h-auto lg:w-screen'
        />
      </div>

      <Header />

      <RouterProvider router={router} />
    </div>
  )
}

export default App
