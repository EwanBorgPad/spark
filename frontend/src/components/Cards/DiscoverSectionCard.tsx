import React from "react"
import Img from "../Image/Img"
import { Link } from "react-router-dom"
import { DiscoverSectionCardType } from "../LandingPage/DiscoverSection"
import { Button } from "../Button/Button"
import { twMerge } from "tailwind-merge"

const DiscoverSectionCard = ({ description, imgUrl, label, path, imgClass }: DiscoverSectionCardType) => {
  const isComingSoon = !path
  return (
    <div
      className={twMerge(
        "flex min-h-[293px] w-full max-w-[405px] flex-col items-center gap-2 rounded-xl border border-bd-secondary bg-secondary bg-opacity-[50%] px-4 py-6",
        isComingSoon && "bg-opacity-0",
      )}
    >
      <Img src={imgUrl} customClass={twMerge("mb-8", imgClass)} />
      <h3 className="font-sulphur-point">{label}</h3>
      <div className="flex w-full flex-col gap-4">
        {isComingSoon && <span className="text-center opacity-50">Coming Soon</span>}{" "}
        <p className="mb-4 text-center text-fg-secondary">{description}</p>
        {!isComingSoon && (
          <Link to={path} className="w-full">
            <Button
              color="tertiary"
              size="lg"
              btnText={`Explore ${label}`}
              className="w-full"
              textClassName="font-medium"
            />
          </Link>
        )}
      </div>
    </div>
  )
}

export default DiscoverSectionCard
