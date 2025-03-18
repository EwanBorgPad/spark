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

type Props = { project: ExpandedProject | null; isLoading?: boolean }

export const LaunchPoolCard = ({ project, isLoading }: Props) => {
  const { t } = useTranslation()

  const { additionalData: { badgeClassName, endMessage, badgeLabel } = {} } = project ?? {}

  const isDraftPick = project?.info.projectType === "draft-pick"
  const isUpcoming = !isDraftPick && project?.additionalData.currentEvent.id === "UPCOMING"
  const isRegistrationOpen = !isDraftPick && project?.additionalData.currentEvent.id === "REGISTRATION_OPENS"
  const isSaleOpen = !isDraftPick && project?.additionalData.currentEvent.id === "SALE_OPENS"
  const isRewardDistribution = !isDraftPick && project?.additionalData.currentEvent.id === "REWARD_DISTRIBUTION"
  const isBlitz = project?.info.projectType === "blitz"
  const projectUrl = getProjectRoute(project as ProjectModel)

  const cardRows = getCardRows(project)

  return (
    <>
      {!isRewardDistribution && (
        <li className="relative flex w-full min-w-[315px] max-w-[344px] flex-col overflow-hidden rounded-lg border-[1px] border-bd-secondary/30 bg-default">
          <Img
            src={project?.info?.thumbnailUrl || project?.info?.logoUrl}
            customClass="h-[189px] rounded-none"
            showFallback
            isFetchingLink={isLoading}
          />
          {!isDraftPick && (
            <Badge
              label={badgeLabel || "Loading..."}
              className={twMerge("absolute left-4 top-4 px-3 py-1 text-sm", badgeClassName)}
            />
          )}
          <div className="flex w-full flex-1 grow flex-col justify-between gap-4 p-4">
            <div className="flex w-full flex-col gap-4">
              <div className="flex w-full flex-col gap-1">
                <Text text={project?.info?.title} as="span" className="text-2xl font-semibold" isLoading={isLoading} />
                <Text
                  text={project?.info?.subtitle}
                  as="span"
                  className="line-clamp-3 text-base text-fg-tertiary"
                  isLoading={isLoading}
                />
              </div>

              <div className="flex flex-col gap-0">
                {(isRegistrationOpen || isUpcoming) && (
                  <>
                    <div className="flex items-center justify-between bg-secondary p-2 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Icon icon="SvgDatabase" />
                        <span className="text-fg-secondary">Valuation (FDV)</span>
                      </div>
                      <span className="text-fg-brand-primary">${project?.config.fdv ? (project.config.fdv / 1000000).toFixed(1) + 'M' : "$0"}</span>
                    </div>
                    <div className="flex items-center justify-between bg-transparent p-2 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Icon icon="SvgChartLine" />
                        <span className="text-fg-secondary">Sector</span>
                      </div>
                      <span className="text-fg-secondary">{project?.info?.sector ?? "N/A"}</span>
                    </div>
                    <div className="flex items-center justify-between bg-secondary p-2 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Icon icon="SvgCalendarFill" />
                        <span className="text-fg-secondary">Whitelisting Ends</span>
                      </div>
                      <span className="text-fg-secondary">
                        {project?.info?.timeline?.find(t => t.id === "SALE_OPENS")?.date
                          ? new Date(project.info.timeline.find(t => t.id === "SALE_OPENS")!.date!).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            hour12: true
                          }).replace(/(\d+)/, (match) => {
                            const num = parseInt(match);
                            const suffix = ['th', 'st', 'nd', 'rd'][num % 10 > 3 ? 0 : (num % 100 - num % 10 != 10 ? num % 10 : 0)];
                            return num + suffix;
                          }).replace(' PM', 'PM').replace(' AM', 'AM')
                          : "TBC"}
                      </span>
                    </div>
                  </>
                )}
                {isSaleOpen && (
                  <>
                    <div className="flex items-center justify-between bg-secondary p-2 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Icon icon="SvgDatabase" />
                        <span className="text-fg-secondary">Valuation (FDV)</span>
                      </div>
                      <span className="text-fg-brand-primary">${project?.config.fdv ? (project.config.fdv / 1000000).toFixed(1) + 'M' : "$0"}</span>
                    </div>
                    <div className="flex items-center justify-between bg-transparent p-2 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Icon icon="SvgChartLine" />
                        <span className="text-fg-secondary">Sector</span>
                      </div>
                      <span className="text-fg-secondary">{project?.info?.sector ?? "N/A"}</span>
                    </div>
                    <div className="flex items-center justify-between bg-secondary p-2 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Icon icon="SvgTwoAvatars" />
                        <span className="text-fg-secondary">Participants</span>
                      </div>
                      <span className="text-fg-secondary">{project?.investmentIntentSummary?.count ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between bg-transparent p-2 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Icon icon="SvgWalletFilled" />
                        <span className="text-fg-secondary">Total Invested</span>
                      </div>
                      <span className="text-fg-secondary">{project?.investmentIntentSummary?.sum ?? "$0"}</span>
                    </div>
                    <div className="flex items-center justify-between bg-secondary p-2 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Icon icon="SvgCalendarFill" />
                        <span className="text-fg-secondary">Sale Ends</span>
                      </div>
                      <span className="text-fg-secondary">
                        {project?.info?.timeline?.find(t => t.id === "SALE_CLOSES")?.date
                          ? new Date(project.info.timeline.find(t => t.id === "SALE_CLOSES")!.date!).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            hour12: true
                          }).replace(/(\d+)/, (match) => {
                            const num = parseInt(match);
                            const suffix = ['th', 'st', 'nd', 'rd'][num % 10 > 3 ? 0 : (num % 100 - num % 10 != 10 ? num % 10 : 0)];
                            return num + suffix;
                          }).replace(' PM', 'PM').replace(' AM', 'AM')
                          : "TBC"}
                      </span>
                    </div>
                  </>
                )}
              </div>


              {isDraftPick && (
                <div className="flex w-full flex-col">
                  {cardRows.map((row, index) => (
                    <div
                      key={row.icon}
                      className={twMerge(
                        "flex w-full items-center justify-between gap-2 rounded-lg bg-secondary px-3 py-2 ",
                        Boolean(index % 2) && "bg-transparent",
                      )}
                    >
                      <div className="flex w-full items-center gap-1 text-fg-secondary/25">
                        <Icon icon={row.icon} />
                        <span className="text-sm text-fg-secondary">{row.label}</span>
                      </div>
                      <span className={twMerge("whitespace-nowrap text-sm text-fg-secondary", row.valueClassName)}>
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {isUpcoming ? (
              <FollowOnXBtn />
            ) : (
              <div className="flex w-full flex-col rounded-xl bg-default">
                <Link to={projectUrl}>
                  <Button
                    btnText="Learn More"
                    className={twMerge(
                      "w-full p-3",
                      isBlitz && "bg-brand-blitz active:bg-brand-blitz",
                      isDraftPick && "bg-draft-picks active:bg-draft-picks",
                    )}
                  />
                </Link>
              </div>
            )}
          </div>
        </li>
      )}
    </>
  )
}

const BORGPAD_X_URL = "https://x.com/BorgPadHQ"

const getCardRows = (
  project: ExpandedProject | null,
): { icon: AvailableIcons; label: string; value: string | number; valueClassName?: string }[] => {
  if (!project) return []
  return [
    {
      icon: "SvgDatabase",
      label: "Target FDV",
      value: project.info.targetFdv || "",
      valueClassName: "text-draft-picks",
    },
    {
      icon: "SvgChartLine",
      label: "Total Commitment",
      value: formatCurrencyAmount(project?.investmentIntentSummary?.sum ?? 0, { withDollarSign: true }),
    },
    {
      icon: "SvgCalendarFill",
      label: "Target Launch",
      value: project.info.tokenGenerationEventDate,
    },
  ]
}

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
