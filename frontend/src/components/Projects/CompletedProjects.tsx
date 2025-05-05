import { useWindowSize } from "@/hooks/useWindowSize"
import { CompletedLaunchPoolCard } from "../Cards/CompletedLaunchPoolCard"
import { CompletedLaunchPoolTable } from "../Tables/CompletedLaunchPoolTable"
import { useTranslation } from "react-i18next"
import { useEffect, useState } from "react"
import { ExpandedProject, processProjects } from "@/utils/projects-helper"
import { useQuery } from "@tanstack/react-query"
import { GetProjectsResponse, ProjectModel } from "shared/models"
import { backendApi } from "@/data/backendApi"
import { SortDropdown } from "../Dropdown/SortDropdown"
import Pagination from "../Pagination/Pagination"

type Props = {
  projectType: ProjectModel["info"]["projectType"]
}

type SortField = 'name' | 'date' | 'raised' | 'fdv' | 'participants' | 'commitments' | 'sector'
type SortDirection = 'asc' | 'desc'

type SortOption = {
    value: string;
    label: string;
    field: SortField;
    direction: SortDirection;
}

export const CompletedProjects = ({ projectType }: Props) => {
  const { t } = useTranslation()
  const { isMobile } = useWindowSize()
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [projects, setProjects] = useState<ExpandedProject[]>([])
  const [sortField, setSortField] = useState<SortField>("date")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

  const sortOptions: SortOption[] = [
    { value: "name-asc", label: "Sort by Name, A to Z", field: "name", direction: "asc" },
    { value: "name-desc", label: "Sort by Name, Z to A", field: "name", direction: "desc" },
    { value: "date-asc", label: "Sort by Date, Oldest first", field: "date", direction: "asc" },
    { value: "date-desc", label: "Sort by Date, Newest first", field: "date", direction: "desc" },
    { value: "raised-asc", label: "Sort by Raised, Low to High", field: "raised", direction: "asc" },
    { value: "raised-desc", label: "Sort by Raised, High to Low", field: "raised", direction: "desc" },
  ]

  const { data, isLoading } = useQuery<GetProjectsResponse>({
    queryFn: () =>
      backendApi.getProjects({
        page: currentPage,
        limit: isMobile ? 3 : 10,
        projectType,
        completionStatus: "completed",
        sortBy: sortField,
        sortDirection: sortDirection,
      }),
    queryKey: ["getProjects", projectType, "completed", sortField, sortDirection, currentPage, isMobile],
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

  const handleSortChange = (newSortOption: string) => {
    const option = sortOptions.find((opt) => opt.value === newSortOption)
    if (option) {
      setSortField(option.field)
      setSortDirection(option.direction)
      setCurrentPage(1) // Reset to first page when sorting changes
    }
  }

  const handleTableSort = (field: SortField, direction: SortDirection) => {
    setSortField(field)
    setSortDirection(direction)
    setCurrentPage(1) // Reset to first page when sorting changes
  }

  const currentSortOption =
    sortOptions.find((opt) => opt.field === sortField && opt.direction === sortDirection)?.value || "date-desc"

  const skeletonItems = Array.from({ length: 3 }, (_, i) => i)

  return (
    <div className="flex w-full flex-col items-center">
      {isMobile ? (
        <div className="flex flex-col items-center gap-6">
          <ul className="mx-auto grid w-full max-w-[344px] grid-cols-1 place-items-center justify-center gap-6">
            <div className="w-full">
              <div className="mx-auto mb-4 w-full max-w-[344px]">
                <SortDropdown
                  options={sortOptions}
                  selected={currentSortOption}
                  onChange={handleSortChange}
                  placeholder="Sort by Date, Newest first"
                />
              </div>
              {!isLoading
                ? projects.map((project) => (
                    <CompletedLaunchPoolCard
                      key={"CompletedLaunchPoolCard_" + project.id}
                      projectType={projectType}
                      project={project}
                      isLoading={false}
                    />
                  ))
                : skeletonItems.map((item) => (
                    <CompletedLaunchPoolCard key={item} projectType={projectType} isLoading={true} project={null} />
                  ))}
            </div>
          </ul>
        </div>
      ) : (
        <div className="w-full">
          <CompletedLaunchPoolTable
            projectType={projectType}
            isLoading={isLoading}
            projects={projects}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageClick={handlePageClick}
            onSortChange={handleTableSort}
            sortField={sortField}
            sortDirection={sortDirection}
          />
        </div>
      )}
      {!isLoading && totalPages !== 1 && (
        <div className="mt-8 flex w-full justify-center">
          <Pagination totalPages={totalPages} currentPage={currentPage} onPageClick={handlePageClick} />
        </div>
      )}
    </div>
  )
}
