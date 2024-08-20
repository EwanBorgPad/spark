import { twMerge } from "tailwind-merge"

type Props = {
  text?: string | number
  isLoading?: boolean
  as?: "span" | "h1" | "h2" | "h3"
  className?: string
}

const skeleton = {
  h1: { class: "h-12 min-w-[280px]" },
  h2: { class: "h-11 min-w-[120px]" },
  h3: { class: "h-10 min-w-[60px]" },
  span: { class: "h-4 min-w-[40px]" },
}

const TextSkeletonLoader = ({ className }: { className?: string }) => {
  return (
    <div
      className={twMerge(
        "h-full w-full shrink-0 animate-pulse overflow-hidden rounded-2xl bg-white/20",
        className,
      )}
    >
      <div
        className={twMerge(
          "h-full w-full animate-slide-skeleton bg-gradient-to-r from-white/0 via-white/40 to-white/0",
        )}
      ></div>
    </div>
  )
}

const Text = ({ text, isLoading, as = "span", className }: Props) => {
  if (isLoading) return <TextSkeletonLoader className={skeleton[as].class} />
  const Component = as
  return <Component className={className}>{text || "TBD"}</Component>
}

export default Text
