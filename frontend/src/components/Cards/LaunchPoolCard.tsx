import { Link } from "react-router-dom"
import { twMerge } from "tailwind-merge"
import { useTranslation } from "react-i18next"

import Img from "../Image/Img"
import Text from "@/components/Text"
import { Badge } from "../Badge/Badge"
import { Button } from "../Button/Button"
import { ExpandedProject } from "@/utils/projects-helper"
import { ExternalLink } from "../Button/ExternalLink"
import { ROUTES } from "@/utils/routes"

type Props = { project: ExpandedProject | null; isLoading?: boolean }

export const LaunchPoolCard = ({ project, isLoading }: Props) => {
  const { t } = useTranslation()

  const { additionalData: { badgeClassName, endMessage, badgeLabel } = {} } = project ?? {}

  const isUpcoming = project?.additionalData.currentEvent.id === "UPCOMING"
  const isBlitz = project?.info.projectType === "blitz"
  const projectUrl = `${isBlitz ? ROUTES.BLITZ_POOLS : ROUTES.GOAT_POOLS}/${project?.id}`

  return (
    <li className="relative flex w-full max-w-[344px] flex-col overflow-hidden rounded-lg border-bd-primary bg-secondary">
      <Img
        src={project?.info?.thumbnailUrl || project?.info?.logoUrl}
        customClass="h-[189px] rounded-none"
        showFallback
        isFetchingLink={isLoading}
      />
      <Badge
        label={badgeLabel || "Loading..."}
        className={twMerge("absolute left-4 top-4 px-3 py-1 text-sm", badgeClassName)}
      />
      <div className="flex w-full flex-1 grow flex-col justify-between gap-4 p-4">
        <div className="flex w-full flex-col gap-4">
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <div className="flex items-center gap-2 border-r-[1px] border-r-fg-gray-line pr-5">
              <span className="text-fg-primary text-opacity-50">{t("chain")}</span>
              {!isLoading && <Img size="4" src={project?.info?.chain.iconUrl} isRounded />}
              <Text text={project?.info?.chain.name} as="span" className="text-nowrap" isLoading={isLoading} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-fg-primary text-opacity-50">{t("sector")}</span>
              <Text text={project?.info?.sector} isLoading={isLoading} className="text-nowrap" />
            </div>
          </div>
          <div className="flex w-full flex-col gap-1">
            <Text text={project?.info?.title} as="span" className="text-2xl font-semibold" isLoading={isLoading} />
            <Text
              text={project?.info?.subtitle}
              as="span"
              className="line-clamp-2 text-base text-fg-tertiary"
              isLoading={isLoading}
            />
          </div>
        </div>

        {isUpcoming ? (
          <FollowOnXBtn />
        ) : (
          <div className="flex w-full flex-col rounded-xl bg-default">
            <span className="px-4 py-2 text-sm leading-5 text-fg-tertiary">{endMessage}</span>
            <Link to={projectUrl}>
              <Button
                btnText="Learn More"
                className={twMerge("w-full p-3", isBlitz && "bg-brand-blitz active:bg-brand-blitz")}
              />
            </Link>
          </div>
        )}
      </div>
    </li>
  )
}

const BORGPAD_X_URL = "https://x.com/BorgPadHQ"

const FollowOnXBtn = () => {
  return (
    <div className="flex w-full flex-col rounded-xl bg-default">
      <span className="w-full px-4 py-2 text-center text-sm leading-5 text-fg-tertiary">
        {"Be among the first to find out"}
      </span>
      <ExternalLink
        externalLink={{
          label: "Follow Announcements on",
          url: BORGPAD_X_URL,
          iconType: "X_TWITTER",
        }}
        className="flex-row-reverse justify-center gap-1 rounded-xl px-3 py-3.5"
        iconClassName="opacity-50"
      />
    </div>
  )
}