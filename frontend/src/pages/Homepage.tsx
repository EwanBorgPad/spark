import { Button } from "@/components/Button/Button"
import React from "react"
import { Link } from "react-router-dom"

const Homepage = () => {
  return (
    <div className="z-[10] flex h-screen items-center justify-center">
      <Link to={"/project/puffer-finance"}>
        <Button size="xl" color="primary" btnText="Go To Puffer Finance" />
      </Link>
    </div>
  )
}

export default Homepage
