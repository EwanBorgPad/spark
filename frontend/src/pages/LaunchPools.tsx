import { Button } from "@/components/Button/Button"
import React from "react"
import { Link, ScrollRestoration } from "react-router-dom"

const LaunchPools = () => {
  return (
    <main className="h-[900px] p-10 pt-[48px]">
      <h1 className="my-20">Launch Pools</h1>
      <Link to={"/launch-pools/puffer-finance"}>
        <Button size="xl" color="primary" btnText="Go To Puffer Finance" />
      </Link>
      <ScrollRestoration />
    </main>
  )
}

export default LaunchPools
