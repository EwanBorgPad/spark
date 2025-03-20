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
import { formatCurrencyAmount } from "shared/utils/format"
import { formatDateForProject } from "@/utils/date-helpers"
import { createDetailRow, ProjectDetailRows } from "../Tables/ProjectDetailsRows"

type Props = { project: ExpandedProject | null; isLoading?: boolean }

export const CompletedLaunchPoolCard = ({ project, isLoading }: Props) => {
  const { t } = useTranslation()

  const { additionalData: { badgeClassName, endMessage, badgeLabel } = {} } = project ?? {}

  const projectUrl = getProjectRoute(project as ProjectModel)

  const isDraftPick = project?.info.projectType === "draft-pick"
  const isRewardDistribution = !isDraftPick && project?.additionalData.currentEvent.id === "REWARD_DISTRIBUTION"
  return (
    <>
      {isRewardDistribution && (
        <li className="relative flex w-full min-w-[315px] max-w-[344px] flex-col overflow-hidden rounded-lg border-[1px] border-bd-secondary/30 bg-secondary">
          <div className="flex w-full flex-1 grow flex-col justify-between gap-4 p-4">
            <div className="flex w-full flex-col gap-5">
              <div className="flex w-full flex-col gap-3">
                <Img
                  src={project?.info.logoUrl}
                  isFetchingLink={isLoading}
                  imgClassName="scale-[102%]"
                  isRounded={true}
                  size="8"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <Link to={projectUrl}>
                      <Text text={project?.info?.title} as="span" className="text-2xl font-semibold" isLoading={isLoading} />
                    </Link>
                    <Link to={projectUrl}>
                      <Icon icon="SvgShare" className="w-6 h-6 opacity-50" />
                    </Link>
                  </div>
                  <Text
                    text={project?.info?.subtitle}
                    as="span"
                    className="line-clamp-3 text-base text-fg-tertiary"
                    isLoading={isLoading}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-0">
                <ProjectDetailRows
                  project={project}
                  rows={[
                    createDetailRow("SvgCalendarFill", "Date", project?.info.timeline?.find(t => t.id === "SALE_CLOSES")?.date ? formatDateForProject(new Date(project?.info.timeline?.find(t => t.id === "SALE_CLOSES")?.date || 0)) : "TBC"),
                    createDetailRow("SvgChartLine", "FDV", formatFdv(project?.config.fdv)),
                    createDetailRow("SvgWalletFilled", "Raised", formatTotalInvested(project?.investmentIntentSummary?.sum ?? 0)),
                    createDetailRow("SvgTwoAvatars", "Participants", project?.investmentIntentSummary?.count ?? 0),
                    createDetailRow("SvgChartLine", "Sector", project?.info?.sector ?? "N/A"),
                  ]}
                />
              </div>
            </div>
            <div className="flex w-full flex-col rounded-xl bg-default">
              <Link to={projectUrl}>
                <Button
                  btnText="Learn More"
                  className={twMerge(
                    "w-full p-3 bg-transparent border border-bd-secondary text-fg-secondary",
                  )}
                />
              </Link>
            </div>
          </div>
        </li>
      )}
    </>
  )
}

const formatFdv = (fdv?: number): string => {
  return fdv ? `$${(fdv / 1000000).toFixed(1)}M` : "$0"
}

const formatTotalInvested = (totalInvested?: number): string => {
  return totalInvested ? `$${(totalInvested / 1000).toFixed(1)}K` : "$0"
}