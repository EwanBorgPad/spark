import { Link } from "react-router-dom"
import { twMerge } from "tailwind-merge"
import { useTranslation } from "react-i18next"

import Img from "../Image/Img"
import Text from "@/components/Text"
import { Badge } from "../Badge/Badge"
import { Button } from "../Button/Button"
import { ExpandedProject } from "@/utils/projects-helper"
import { ExternalLink } from "../Button/ExternalLink"
import { getProjectRoute } from "@/utils/routes"
import { AvailableIcons, Icon } from "../Icon/Icon"
import { ProjectModel } from "shared/models"
import { formatCurrencyAmount, formatCurrencyCompact } from "shared/utils/format"
import topCorner from "@/assets/top-left-corner.svg"
import bottomCorner from "@/assets/bottom-right-corner.svg"

type Props = { project: ExpandedProject | null; isLoading?: boolean }

export const ProjectPoolCard = ({ project, isLoading }: Props) => {
  const { t } = useTranslation()

  const { additionalData: { badgeClassName, endMessage, badgeLabel } = {} } = project ?? {}

  const isDraftPick = project?.info.projectType === "draft-pick"
  const isUpcoming = !isDraftPick && project?.additionalData.currentEvent.id === "UPCOMING"
  const isBlitz = project?.info.projectType === "blitz"
  const projectUrl = getProjectRoute(project as ProjectModel)

  const committedSum = formatCurrencyCompact(project?.investmentIntentSummary?.sum)

  return (
    <Link
      to={projectUrl}
      className="hover:shadow-draft-pick-card transition-draft-pick-card rounded-[23px] bg-gradient-to-b from-bd-secondary to-bd-secondary p-[1px] shadow-none duration-1000 hover:from-draft-picks/25 hover:to-draft-picks/75"
    >
      <li className="flex aspect-square max-h-[344px] w-full max-w-[344px] flex-col overflow-hidden rounded-[22px] bg-default p-3">
        <div className="relative h-full w-full">
          <Img
            src={project?.info?.thumbnailUrl || project?.info?.logoUrl}
            customClass="h-full rounded-[10px]"
            showFallback
            isFetchingLink={isLoading}
          />
          <div className="absolute left-0 top-0 flex items-start">
            <div className="flex h-[36px] items-center bg-default">
              <div className="flex items-center gap-2 border-r-fg-gray-line/10 px-2 pr-4 md:border-r-[1px]">
                <Img size="4" src={project?.info.chain.iconUrl} isRounded />
                <Text
                  text={project?.info.chain.name}
                  isLoading={isLoading}
                  loadingClass="max-w-[100px]"
                  className="leading-none"
                />
              </div>
              <div className="flex items-center gap-2 pl-4">
                <Text text={project?.info.sector} isLoading={isLoading} className="leading-none" />
              </div>
            </div>

            <img src={topCorner} />
          </div>

          <div className="absolute bottom-0 right-0 flex items-start">
            <img src={bottomCorner} />
            <div className="flex h-[72px] items-center gap-8 bg-default pb-2 pr-4 pt-3">
              <div className="flex h-full flex-col items-center justify-between">
                <Icon icon="SvgTwoAvatars" className="text-fg-secondary" />
                <span className="text-base font-semibold ">{project?.investmentIntentSummary?.count}</span>
              </div>
              <div className="flex h-full flex-col items-center justify-between">
                <span className="text-sm leading-none text-fg-secondary">Target FDV</span>
                <span className="text-nowrap text-base font-semibold">{project?.info.targetFdv}</span>
              </div>
              <div className="flex h-full flex-col items-center justify-between">
                <span className="text-sm leading-none text-fg-secondary">Commited</span>
                <span className="text-draft-picks-2 text-2xl font-semibold">{committedSum}</span>
              </div>
            </div>
          </div>
        </div>
      </li>
    </Link>
  )
}