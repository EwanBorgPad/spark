import React from "react"
import { twMerge } from "tailwind-merge"

type WrapperProps = {
  label: string
  children: React.ReactNode
  className?: string
}
type InnerWrapperProps = {
  children: React.ReactNode
  className?: string
}

const Wrapper = ({ label, children }: WrapperProps) => {
  return (
    <section className="relative mt-3 flex w-full max-w-[400px] flex-col items-center rounded-3xl border border-bd-secondary bg-secondary bg-texture-zoomed-out bg-cover bg-blend-multiply">
      <span className="absolute -top-[18px] rounded-full bg-brand-primary px-4 py-2 text-fg-alt-default">
        {label}
      </span>
      {children}
    </section>
  )
}

const InnerWrapper = ({ children, className }: InnerWrapperProps) => {
  return (
    <div
      style={{
        // blend mode doesn't work inside twMerge, unknown reason
        backgroundBlendMode: "multiply",
        backgroundColor: "rgb(31,36, 47)",
      }}
      className={twMerge(
        "relative flex w-full flex-col items-center gap-2 rounded-3xl border border-bd-secondary bg-secondary bg-texture bg-contain p-4 text-sm text-fg-primary",
        className,
      )}
    >
      {children}
    </div>
  )
}

export const TgeWrapper = Object.assign(Wrapper, {
  Inner: InnerWrapper,
})
