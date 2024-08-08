import { useState } from "react"
import { twMerge } from "tailwind-merge"
import fallbackImg from "../../assets/fallback1.png"

type Props = {
  src: string | undefined
  size: "4" | "5" | "6" | "10" | "20"
  customClass?: string
}

const avatarSize: Record<Props["size"], string> = {
  "4": "size-4",
  "5": "size-5",
  "6": "size-6",
  "10": "size-10",
  "20": "size-20",
}

const ImgSkeletonLoader = () => {
  return (
    <div
      className={twMerge(
        "h-full w-full shrink-0 animate-pulse overflow-hidden rounded-full",
      )}
    >
      <div className="h-full w-full animate-slide-skeleton bg-white/60"></div>
    </div>
  )
}

const Img = ({ size, src, customClass }: Props) => {
  const [isLoading, setIsLoading] = useState(false)
  const [renderFallback, setRenderFallback] = useState(src ? false : true)

  const onError = () => {
    setRenderFallback(true)
    setIsLoading(false)
  }

  return (
    <div
      className={twMerge(
        "shrink-0 overflow-hidden rounded-full ",
        isLoading && "bg-white/20",
        avatarSize[size],
        customClass,
      )}
    >
      {isLoading ? (
        <ImgSkeletonLoader />
      ) : (
        <img
          src={!renderFallback ? src : fallbackImg}
          onLoad={() => setIsLoading(false)}
          onError={onError}
          className={twMerge("h-full w-full object-cover", avatarSize[size])}
        />
      )}
    </div>
  )
}

export default Img
