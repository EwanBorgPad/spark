import { useProjectDataContext } from "@/hooks/useProjectData"
import React from "react"
import Img from "../Image/Img"

const Banner = () => {
  const { projectData, isLoading } = useProjectDataContext()

  if (!projectData?.info.banner) return null

  if (isLoading) return <BannerSkeleton />

  const { imageUrl, backgroundGradient, borderGradient, cta, label } = projectData.info.banner

  return (
    <div
      className="flex h-[100px] w-full rounded-lg p-[1px]"
      style={{
        backgroundImage: `linear-gradient(to right, rgba(${hexToRgb(borderGradient.leftHex)}, 0.5), rgba(${hexToRgb(borderGradient.rightHex)}, 0.5))`,
      }}
    >
      <div
        className="relative flex h-full w-full flex-col items-start justify-center rounded-[7px] p-4"
        style={{
          backgroundImage: `linear-gradient(to right, ${backgroundGradient.leftHex}, ${backgroundGradient.rightHex})`,
        }}
      >
        <span className="z-[3] max-w-[65%] text-base font-semibold text-fg-primary md:max-w-full">{label}</span>
        {cta && (
          <a
            href={cta.url}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-normal text-fg-secondary underline"
          >
            {cta.label}
          </a>
        )}
        {imageUrl && <Img src={imageUrl} customClass="absolute z-[2] right-0 top-0 h-full rounded-[7px]" />}
      </div>
    </div>
  )
}

export default Banner

const hexToRgb = (hex: string) => {
  // Remove '#' if present
  hex = hex.replace("#", "")
  // Parse hex to RGB
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  return `${r}, ${g}, ${b}`
}

const BannerSkeleton = () => (
  <div className="flex h-[100px] w-full overflow-hidden rounded-lg border border-white/30 bg-white/20 bg-gradient-to-r p-[1px] opacity-20">
    <div className={"h-full w-full animate-slide-skeleton bg-gradient-to-r from-white/0 via-white/20 to-white/0"}></div>
  </div>
)
