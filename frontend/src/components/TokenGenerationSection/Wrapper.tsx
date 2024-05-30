import React from "react"

type WrapperProps = {
  label: string
  children: React.ReactNode
}
type InnerWrapperProps = {
  children: React.ReactNode
}

const Wrapper = ({ label, children }: WrapperProps) => {
  return (
    <section className="relative mt-3 flex w-full max-w-[400px] flex-col items-center rounded-3xl border border-bd-secondary bg-secondary bg-texture-zoomed-out bg-cover bg-blend-multiply">
      <span className="absolute -top-[18px] rounded-full bg-brand-primary px-4 py-2 text-fg-alt-default">
        {label}
      </span>
      {children}
      {/* <CountDownTimer endsIn={data.distributionStartDate} />
      <WhitelistingLP data={data.whitelisting} /> */}
    </section>
  )
}

const InnerWrapper = ({ children }: InnerWrapperProps) => {
  return (
    <div className="relative flex w-full flex-col items-center gap-2 rounded-3xl border border-bd-secondary bg-secondary bg-texture bg-cover p-6 pt-[26px] text-sm text-fg-primary bg-blend-multiply">
      {children}
    </div>
  )
}

export const TgeWrapper = Object.assign(Wrapper, {
  Inner: InnerWrapper,
})
