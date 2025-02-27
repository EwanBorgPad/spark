import { Link } from "react-router-dom"
import { twMerge } from "tailwind-merge"

import Img from "../Image/Img"
import { Button } from "../Button/Button"
import { useWindowSize } from "@/hooks/useWindowSize"
import { DiscoverSectionCardType } from "../LandingPage/DiscoverSection"

const DiscoverSectionCard = ({
  description,
  images,
  label,
  path,
  imgClass,
  btnClass,
  className,
  backdropImg,
}: DiscoverSectionCardType) => {
  const isComingSoon = !path
  const { isMobile } = useWindowSize()

  return (
    <div
      className={twMerge(
        "group flex rounded-xl bg-bd-secondary bg-opacity-[50%] p-[1px]",
        isComingSoon && "bg-secondary",
        className,
      )}
    >
      <div className="relative h-fit min-h-[293px] max-w-[362px] rounded-[11px] bg-default ">
        {backdropImg && (
          <Img
            src={backdropImg}
            customClass={
              "opacity-0 transition-opacity duration-500 absolute inset-0 rounded-[11px] aspect-auto group-hover:opacity-100 z-[10]"
            }
          />
        )}
        <div className="relative z-[100] flex h-full w-full flex-col items-center gap-2 px-4 py-6">
          <Img src={isMobile ? images.small : images.medium} customClass={twMerge("mb-8", imgClass)} />
          <h3 className="hidden font-sulphur-point">{label}</h3>
          <div className="flex w-full flex-col gap-4">
            {isComingSoon && <span className="text-center opacity-50">Coming Soon</span>}{" "}
            <p className="mb-4 text-center text-fg-secondary">{description}</p>
            {!isComingSoon && (
              <Link to={path} className="group relative w-full">
                <Button
                  color="tertiary"
                  size="lg"
                  btnText={`Explore ${label}`}
                  className={twMerge("w-full hover:opacity-100", btnClass)}
                  textClassName="font-medium text-sm text-fg-alt-default"
                />
                <div className="absolute inset-0 z-[-1] h-full w-full rounded-xl shadow-around-1 transition-shadow duration-500 group-hover:shadow-around-2"></div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DiscoverSectionCard
