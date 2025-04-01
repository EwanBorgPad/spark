import { Link } from "react-router-dom"
import { twMerge } from "tailwind-merge"
import { useTranslation } from "react-i18next"
import { backendApi } from "@/data/backendApi"
import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { GetProjectsResponse, ProjectModel } from "shared/models"
import { useWindowSize } from "@/hooks/useWindowSize"

import Pagination from "../Pagination/Pagination"
import Img from "../Image/Img"
import Text from "@/components/Text"
import { Badge } from "../Badge/Badge"
import { Button } from "../Button/Button"
import { ExpandedProject, processProjects } from "@/utils/projects-helper"
import { ExpandedTimelineEventType } from "@/components/Timeline/Timeline"
import { ExternalLink } from "../Button/ExternalLink"
import { getProjectRoute } from "@/utils/routes"
import { AvailableIcons, Icon } from "../Icon/Icon"
import { formatCurrencyAmount, formatCurrencyCompact } from "shared/utils/format"
import { formatDateForProject } from "@/utils/date-helpers"

type Props = {
  projectType: "goat" | "blitz"
}

export const LaunchPoolCard = ({ projectType }: Props) => {
  const { t } = useTranslation()
  const { isMobile } = useWindowSize()
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [projects, setProjects] = useState<ExpandedProject[]>([])

  const { data, isLoading } = useQuery<GetProjectsResponse>({
    queryFn: () =>
      backendApi.getProjects({
        page: currentPage,
        limit: 99,
        projectType,
        completionStatus: "active",
        sortBy: "date",
        sortDirection: "asc",
      }),
    queryKey: ["getProjects", projectType, "active", "date", "asc", currentPage, isMobile],
  })

  useEffect(() => {
    if (data?.pagination) {
      setTotalPages(data.pagination.totalPages)
    }
  }, [data?.pagination])

  useEffect(() => {
    if (!data?.projects) return
    setProjects(processProjects(data.projects))
  }, [data?.projects])

  const handlePageClick = (pageNum: number) => {
    setCurrentPage(pageNum)
  }

  // If we're loading from query, show skeleton
  if (isLoading) {
    return (
      <div className="w-full">
        <ul className="grid grid-cols-1 place-items-center justify-center gap-6 w-full max-w-[344px] mx-auto sm:max-w-none sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="relative flex w-full min-w-[315px] max-w-[344px] h-full flex-col overflow-hidden rounded-lg border-[1px] border-bd-secondary/30 bg-default animate-pulse">
              <div className="h-[189px] bg-bd-secondary/30"></div>
              <div className="flex w-full flex-1 grow flex-col justify-between gap-4 p-4">
                <div className="flex w-full flex-col gap-4">
                  <div className="flex w-full flex-col gap-1">
                    <div className="h-6 w-3/4 bg-bd-secondary/30 rounded"></div>
                    <div className="h-4 w-full bg-bd-secondary/30 rounded"></div>
                  </div>
                  <div className="flex flex-col gap-0">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-secondary">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-bd-secondary/30 rounded"></div>
                          <div className="h-4 w-16 bg-bd-secondary/30 rounded"></div>
                        </div>
                        <div className="h-4 w-12 bg-bd-secondary/30 rounded"></div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="h-10 bg-bd-secondary/30 rounded-xl"></div>
              </div>
            </div>
          ))}
        </ul>
      </div>
    )
  }

  // If no projects available
  if (!projects?.length) {
    return (
      <div className="w-full text-center py-4">
        <p className="text-fg-secondary">No active projects available</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <ul className="grid grid-cols-1 place-items-center justify-center gap-6 w-full max-w-[344px] mx-auto sm:max-w-none sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => {
          const isDraftPick = project?.info.projectType === "draft-pick"
          const isUpcoming = !isDraftPick && project?.additionalData?.currentEvent?.id === "UPCOMING"
          const isRegistrationOpen = !isDraftPick && project?.additionalData?.currentEvent?.id === "REGISTRATION_OPENS"
          const isSaleOpen = !isDraftPick && project?.additionalData?.currentEvent?.id === "SALE_OPENS"
          const isBlitz = project?.info.projectType === "blitz"
          const projectUrl = getProjectRoute(project as ProjectModel)

          return (
            <div key={project.id} className="relative flex w-full min-w-[315px] max-w-[344px] h-full flex-col overflow-hidden rounded-lg border-[1px] border-bd-secondary/30 bg-default">
              <Img
                src={project?.info?.thumbnailUrl || project?.info?.logoUrl}
                customClass="h-[189px] w-full object-cover rounded-none"
                showFallback
                isFetchingLink={isLoading}
              />
              {!isDraftPick && (
                <Badge
                  label={project?.additionalData?.badgeLabel || "Loading..."}
                  className={twMerge("absolute left-4 top-4 px-3 py-1 text-sm", project?.additionalData?.badgeClassName)}
                />
              )}
              <div className="flex w-full flex-1 grow flex-col justify-between gap-4 p-4">
                <div className="flex w-full flex-col gap-4">
                  <div className="flex w-full flex-col gap-1">
                    <Text text={project?.info?.title} as="span" className="text-2xl font-semibold" />
                    <Text
                      text={project?.info?.subtitle}
                      as="span"
                      className="line-clamp-3 text-base text-fg-tertiary"
                      isLoading={isLoading}
                    />
                  </div>

                  <div className="flex flex-col gap-0">
                    {(isRegistrationOpen || isUpcoming) && (
                      <ProjectDetailRows
                        project={project}
                        rows={[
                          createDetailRow("SvgChartLine", "Valuation (FDV)", formatCurrencyCompact(project?.config.fdv), project?.info.projectType === "blitz" ? "text-brand-blitz" : "text-fg-brand-primary"),
                          createDetailRow("SvgChartLine", "Sector", project?.info?.sector ?? "N/A"),
                          createDetailRow("SvgCalendarFill", "Whitelisting Ends", project?.info.timeline?.find(t => t.id === "SALE_OPENS")?.date ? formatDateForProject(new Date(project?.info.timeline?.find(t => t.id === "SALE_OPENS")?.date || 0)) : "TBC")
                        ]}
                      />
                    )}
                    {isSaleOpen && (
                      <ProjectDetailRows
                        project={project}
                        rows={[
                          createDetailRow("SvgChartLine", "Valuation (FDV)", formatCurrencyCompact(project?.config.fdv), project?.info.projectType === "blitz" ? "text-brand-blitz" : "text-fg-brand-primary"),
                          createDetailRow("SvgChartLine", "Sector", project?.info?.sector ?? "N/A"),
                          createDetailRow("SvgTwoAvatars", "Participants", project?.saleResults?.participantsCount ?? 0),
                          createDetailRow("SvgWalletFilled", "Total Raised", formatCurrencyAmount(project?.saleResults?.totalAmountRaised?.amountInUsd)),
                          createDetailRow("SvgCalendarFill", "Sale Ends", project?.info.timeline?.find(t => t.id === "SALE_CLOSES")?.date ? formatDateForProject(new Date(project?.info.timeline?.find(t => t.id === "SALE_CLOSES")?.date || 0)) : "TBC")
                        ]}
                      />
                    )}
                  </div>
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
            </div>
          )
        })}
      </ul>
      {/* <Pagination totalPages={totalPages} currentPage={currentPage} onPageClick={handlePageClick} /> */}
    </div>
  )
}

type DetailRow = {
  icon: AvailableIcons
  label: string
  value: string | number
  valueClassName?: string
}

const ProjectDetailRows = ({
  project,
  rows
}: {
  project: ExpandedProject | null
  rows: DetailRow[]
}) => {
  if (!project) return null

  return (
    <>
      {rows.map((row, index) => (
        <div
          key={`${row.icon}-${index}`}
          className={twMerge(
            "flex items-center justify-between p-2 rounded-lg",
            index % 2 === 0 ? "bg-secondary" : "bg-transparent"
          )}
        >
          <div className="flex items-center gap-2">
            <Icon icon={row.icon} />
            <span className="text-fg-secondary">{row.label}</span>
          </div>
          <span className={twMerge("text-fg-secondary", row.valueClassName)}>
            {row.value}
          </span>
        </div>
      ))}
    </>
  )
}

const createDetailRow = (
  icon: AvailableIcons,
  label: string,
  value: string | number,
  valueClassName?: string
): DetailRow => {
  return { icon, label, value, valueClassName }
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