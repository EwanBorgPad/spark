import { Link } from "react-router-dom"
import { twMerge } from "tailwind-merge"
import { useTranslation } from "react-i18next"
import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"

import Img from "../Image/Img"
import Text from "@/components/Text"
import { Button } from "../Button/Button"
import { ExpandedProject, processProjects } from "@/utils/projects-helper"
import { getProjectRoute } from "@/utils/routes"
import { Icon } from "../Icon/Icon"
import { GetProjectsResponse, ProjectModel } from "shared/models"
import { formatCurrencyAmount } from "shared/utils/format"
import { formatDateForProject } from "@/utils/date-helpers"
import { createDetailRow, ProjectDetailRows } from "../Tables/ProjectDetailsRows"
import { SortDropdown } from "../Dropdown/SortDropdown"
import { backendApi } from "@/data/backendApi"

type SortField = 'name' | 'date' | 'raised' | 'fdv' | 'participants' | 'commitments' | 'sector'
type SortDirection = 'asc' | 'desc'

type SortOption = {
  value: string;
  label: string;
  field: SortField;
  direction: SortDirection;
}

type Props = {
  projectStatus: "completed" | "active" | "all"
  projectType: "blitz" | "goat"
}

export const CompletedLaunchPoolCard = ({ projectStatus, projectType }: Props) => {
  const { t } = useTranslation()
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [completedProjects, setCompletedProjects] = useState<ExpandedProject[]>([])
  const [sortOption, setSortOption] = useState<string>("date-desc")

  const sortOptions: SortOption[] = [
    { value: "name-asc", label: "Sort by Name, A to Z", field: 'name', direction: 'asc' },
    { value: "name-desc", label: "Sort by Name, Z to A", field: 'name', direction: 'desc' },
    { value: "date-asc", label: "Sort by Date, Oldest first", field: 'date', direction: 'asc' },
    { value: "date-desc", label: "Sort by Date, Newest first", field: 'date', direction: 'desc' },
    { value: "raised-asc", label: "Sort by Raised, Low to High", field: 'raised', direction: 'asc' },
    { value: "raised-desc", label: "Sort by Raised, High to Low", field: 'raised', direction: 'desc' },
  ]

  const { data: completedData, isLoading } = useQuery<GetProjectsResponse>({
    queryFn: () =>
      backendApi.getProjects({
        page: 1,
        limit: 999,
        projectType: projectType,
        completionStatus: projectStatus,
        sortBy: sortField,
        sortDirection: sortDirection,
      }),
    queryKey: ["getProjects", "blitz", projectStatus, sortField, sortDirection],
  })

  useEffect(() => {
    if (completedData?.projects) {
      setCompletedProjects(processProjects(completedData.projects))
    }
  }, [completedData?.projects])

  // Update sort field and direction when sortOption changes
  useEffect(() => {
    const selectedOption = sortOptions.find(option => option.value === sortOption);
    if (selectedOption) {
      setSortField(selectedOption.field);
      setSortDirection(selectedOption.direction);
    }
  }, [sortOption]);

  const handleSortChange = (newSortOption: string) => {
    setSortOption(newSortOption);
  }

  // Show skeleton items when loading
  const skeletonItems = Array.from({ length: 3 }, (_, i) => i)

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="w-full max-w-[344px] mx-auto mb-4">
          <SortDropdown
            options={sortOptions}
            selected={sortOption}
            onChange={handleSortChange}
            placeholder="Sort by Date, Newest first"
          />
        </div>
        {skeletonItems.map((index) => (
          <li key={`skeleton-${index}`} className="relative flex w-full min-w-[315px] max-w-[344px] flex-col overflow-hidden rounded-lg border-[1px] border-bd-secondary/30 bg-secondary mb-4 animate-pulse">
            <div className="flex w-full flex-1 grow flex-col justify-between gap-4 p-4">
              <div className="flex w-full flex-col gap-5">
                <div className="flex w-full flex-col gap-3">
                  <div className="w-8 h-8 rounded-full bg-bd-secondary/30"></div>
                  <div>
                    <div className="h-5 w-24 bg-bd-secondary/30 rounded"></div>
                    <div className="h-4 w-40 mt-2 bg-bd-secondary/30 rounded"></div>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className={`flex items-center justify-between p-2 rounded-lg ${i % 2 === 0 ? "bg-secondary" : "bg-transparent"}`}>
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
          </li>
        ))}
      </div>
    );
  }

  if (!completedProjects?.length) {
    return (
      <div className="w-full text-center py-4">
        <div className="w-full max-w-[344px] mx-auto mb-4">
          <SortDropdown
            options={sortOptions}
            selected={sortOption}
            onChange={handleSortChange}
            placeholder="Sort by Date, Newest first"
          />
        </div>
        <p className="text-fg-secondary">No completed projects available</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="w-full max-w-[344px] mx-auto mb-4">
        <SortDropdown
          options={sortOptions}
          selected={sortOption}
          onChange={handleSortChange}
          placeholder="Sort by Date, Newest first"
        />
      </div>

      {completedProjects.map((project) => {
        const projectUrl = getProjectRoute(project as ProjectModel);
        const isRewardDistribution = project?.additionalData?.currentEvent?.id === "REWARD_DISTRIBUTION";

        if (!isRewardDistribution) return null;

        return (
          <li key={project.id} className="relative flex w-full min-w-[315px] max-w-[344px] flex-col overflow-hidden rounded-lg border-[1px] border-bd-secondary/30 bg-secondary mb-4">
            <div className="flex w-full flex-1 grow flex-col justify-between gap-4 p-4">
              <div className="flex w-full flex-col gap-5">
                <div className="flex w-full flex-col gap-3">
                  <Img
                    src={project.info.logoUrl}
                    imgClassName="scale-[102%]"
                    isRounded={true}
                    size="8"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <Link to={projectUrl}>
                        <Text text={project.info?.title} as="span" className="text-2xl font-semibold" />
                      </Link>
                      <Link to={projectUrl}>
                        <Icon icon="SvgShare" className="w-6 h-6 opacity-50" />
                      </Link>
                    </div>
                    <Text
                      text={project.info?.subtitle}
                      as="span"
                      className="line-clamp-3 text-base text-fg-tertiary"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-0">
                  <ProjectDetailRows
                    project={project}
                    rows={[
                      createDetailRow("SvgCalendarFill", "Date", project.info.timeline?.find((t) => t.id === "SALE_CLOSES")?.date ? formatDateForProject(new Date(project.info.timeline?.find((t) => t.id === "SALE_CLOSES")?.date || 0)) : "TBC"),
                      createDetailRow("SvgChartLine", "FDV", formatFdv(project.config.fdv)),
                      createDetailRow("SvgWalletFilled", "Raised", formatTotalInvested(project.investmentIntentSummary?.sum ?? 0)),
                      createDetailRow("SvgTwoAvatars", "Participants", project.investmentIntentSummary?.count ?? 0),
                      createDetailRow("SvgChartLine", "Sector", project.info?.sector ?? "N/A"),
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
        );
      })}
    </div>
  );
}

const formatFdv = (fdv?: number): string => {
  return fdv ? `$${(fdv / 1000000).toFixed(1)}M` : "$0"
}

const formatTotalInvested = (totalInvested?: number): string => {
  return totalInvested ? `$${(totalInvested / 1000).toFixed(1)}K` : "$0"
}