import React from "react"

const EnvBanner = () => {
  if (window.location.href.slice(0, 16) === "http://localhost") {
    return (
      <div className="fixed left-[-100px] top-10 z-[100] flex w-[320px] rotate-[-45deg] justify-center border-2 border-l-0 border-black bg-brand-primary py-2">
        <span className="text-black">LOCALHOST</span>
      </div>
    )
  }
  if (import.meta.env.VITE_ENVIRONMENT_TYPE === "develop")
    return (
      <>
        <div className="fixed left-[-100px] top-10 z-[100] flex w-[320px] rotate-[-45deg] justify-center border-2 border-l-0 border-black bg-brand-primary py-2">
          <span className="text-black">STAGE</span>
        </div>
      </>
    )
  return <></>
}

export default EnvBanner
