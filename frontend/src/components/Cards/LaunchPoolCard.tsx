import React from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"

import Img from "../Image/Img"
import Text from "@/components/Text"
import { Badge } from "../Badge/Badge"
import { Button } from "../Button/Button"
import { ExpandedProject } from "@/utils/projects-helper"
import { twMerge } from "tailwind-merge"

const LaunchPoolCard = ({ project }: { project: ExpandedProject }) => {
  const { t } = useTranslation()

  const {
    additionalData: { badgeClassName, endMessage, badgeLabel },
  } = project

  return (
    <li className="relative flex w-full max-w-[344px] flex-col overflow-hidden rounded-lg border-bd-primary bg-secondary">
      <Img
        src={project.info?.thumbnailUrl || project.info?.logoUrl}
        customClass="h-[189px] rounded-none"
        showFallback
      />
      <Badge
        label={badgeLabel}
        className={twMerge(
          "absolute left-4 top-4 px-3 py-1 text-sm",
          badgeClassName,
        )}
      />
      <div className="flex w-full flex-1 grow flex-col justify-between gap-4 p-4">
        <div className="flex w-full flex-col gap-4">
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <div className="flex items-center gap-2 border-r-[1px] border-r-fg-gray-line pr-5">
              <span className="text-fg-primary text-opacity-50">
                {t("chain")}
              </span>
              <Img size="4" src={project.info?.chain.iconUrl} />
              <span className="text-nowrap">{project.info?.chain.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-fg-primary text-opacity-50">
                {t("sector")}
              </span>
              <span className="text-nowrap">{project.info?.sector}</span>
            </div>
          </div>
          <div className="flex w-full flex-col gap-1">
            <Text
              text={project.info?.title}
              as="span"
              className="text-2xl font-semibold"
              isLoading={false}
            />
            <Text
              text={project.info?.subtitle}
              as="p"
              className="line-clamp-2 h-[48px] text-base text-fg-tertiary"
              isLoading={false}
            />
          </div>
        </div>

        <div className="flex w-full flex-col rounded-xl bg-default">
          <span className="px-4 py-2 text-sm leading-5 text-fg-tertiary">
            {endMessage}
          </span>
          <Link to={`/launch-pools/${project.info.id}`}>
            <Button btnText="Learn More" className="w-full p-3" />
          </Link>
        </div>
      </div>
    </li>
  )
}

export default LaunchPoolCard
