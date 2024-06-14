import { Button } from "@/components/Button/Button"
import React from "react"
import { Link, ScrollRestoration } from "react-router-dom"

const TermsOfService = () => {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <ScrollRestoration />
      <h1>Terms of Service Page</h1>
      <h2>TBD...</h2>
      <Link to={"/project/puffer-finance"}>
        <Button size="xl" color="primary" btnText="Go Back To Project" />
      </Link>
    </div>
  )
}

export default TermsOfService
