import { useState } from "react"
import { twMerge } from "tailwind-merge"
import fallbackImg from "../../assets/fallback1.png"

type ImgSizes = "4" | "5" | "6" | "10" | "20" | "custom"

type Props = {
  src: string | undefined
  size?: ImgSizes
  customClass?: string
  showFallback?: boolean
  isFetchingLink?: boolean
  imgClassName?: string
  role?: string
  alt?: string
}

const avatarSize: Record<ImgSizes, string> = {
  "4": "size-4",
  "5": "size-5",
  "6": "size-6",
  "10": "size-10",
  "20": "size-20",
  custom: "",
}

const ImgSkeletonLoader = () => {
  return (
    <div
      className={twMerge(
        "h-full w-full shrink-0 animate-pulse overflow-hidden rounded-full bg-white/20",
      )}
    >
      <div className="h-full w-full animate-slide-skeleton bg-gradient-to-r from-white/0 via-white/40 to-white/0"></div>
    </div>
  )
}

const Img = ({
  alt,
  src,
  customClass,
  imgClassName,
  size = "custom",
  showFallback = true,
  role = "presentation",
  isFetchingLink = false,
}: Props) => {
  const [isLoadingImg, setIsLoadingImg] = useState(true)
  const [renderFallback, setRenderFallback] = useState(src ? false : true)

  const onError = () => {
    setRenderFallback(true)
    setIsLoadingImg(false)
  }

  if (!src && !showFallback) return null

  const renderImage = !isLoadingImg && !isFetchingLink

  return (
    <div
      className={twMerge(
        "shrink-0 overflow-hidden rounded-full ",
        isLoadingImg && "bg-white/20",
        avatarSize[size],
        customClass,
      )}
    >
      {(isLoadingImg || isFetchingLink) && <ImgSkeletonLoader />}
      <img
        alt={alt}
        role={role}
        src={!renderFallback ? src : fallbackImg}
        onLoad={() => setIsLoadingImg(false)}
        onError={onError}
        className={twMerge(
          "h-full w-full scale-[102%] object-cover",
          !renderImage ? "hidden" : "",
          avatarSize[size],
          imgClassName,
        )}
      />
    </div>
  )
}

export default Img
