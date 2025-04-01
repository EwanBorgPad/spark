import { Link } from "react-router-dom"
import { twMerge } from "tailwind-merge"
import { useTranslation } from "react-i18next"
import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"

import Img from "../Image/Img"
import { ExpandedProject, processProjects } from "@/utils/projects-helper"
import { getProjectRoute } from "@/utils/routes"
import { Icon } from "../Icon/Icon"
import { GetProjectsResponse, ProjectModel } from "shared/models"
import { formatCurrencyCompact } from "shared/utils/format"
import { backendApi } from "@/data/backendApi.ts"
import { formatDateForProject } from "@/utils/date-helpers"
import { TableHeader } from "./TableHeader"
import { TableCell } from "./TableCell"
import { useWindowSize } from "@/hooks/useWindowSize"
import Pagination from "../Pagination/Pagination"

type SortField = 'name' | 'date' | 'raised' | 'fdv' | 'participants' | 'commitments' | 'sector'
type SortDirection = 'asc' | 'desc'

type Props = {
  projectType: "goat" | "blitz"
}

export const CompletedLaunchPoolTable = ({ projectType }: Props) => {
  const { t } = useTranslation()
  const { isMobile } = useWindowSize()
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [projects, setProjects] = useState<ExpandedProject[]>([])
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '↓'
    return sortDirection === 'asc' ? '↑' : '↓'
  }

  if (!projects?.length && !isLoading) return null

  return (
    <div className="relative flex w-full col-span-full flex-col overflow-hidden rounded-lg border-[1px] border-bd-secondary/30 bg-transparent">
      <div className="overflow-x-auto max-h-[80vh]">
        <table className="w-full divide-y divide-bd-secondary/30">
          <thead className="sticky top-0 bg-transparent">
            <tr>
              <TableHeader className="w-[1%] text-center">
                {" "}
              </TableHeader>
              <TableHeader onClick={() => handleSort('name')}>
                Project {getSortIcon('name')}
              </TableHeader>
              <TableHeader onClick={() => handleSort('date')}>
                Date {getSortIcon('date')}
              </TableHeader>
              <TableHeader onClick={() => handleSort('sector')}>
                Category {getSortIcon('sector')}
              </TableHeader>
              <TableHeader onClick={() => handleSort('raised')}>
                Raised {getSortIcon('raised')}
              </TableHeader>
              <TableHeader onClick={() => handleSort('fdv')}>
                FDV {getSortIcon('fdv')}
              </TableHeader>
              <TableHeader onClick={() => handleSort('participants')} className="md:hidden">
                Participants {getSortIcon('participants')}
              </TableHeader>
              <TableHeader className="w-[2%] text-center">
                {" "}
              </TableHeader>
            </tr>
          </thead>
          <tbody className="divide-y divide-bd-secondary/20">
            {isLoading ? (
              // Display skeleton rows when loading
              Array.from({ length: 5 }, (_, i) => (
                <tr key={`skeleton-${i}`} className="animate-pulse">
                  <TableCell className="px-4 flex items-center">
                    <div className="w-8 h-8 rounded-full bg-bd-secondary/30"></div>
                  </TableCell>
                  <TableCell isCategory={false}>
                    <div className="h-5 w-24 bg-bd-secondary/30 rounded"></div>
                  </TableCell>
                  <TableCell isCategory={true}>
                    <div className="h-5 w-20 bg-bd-secondary/30 rounded"></div>
                  </TableCell>
                  <TableCell isCategory={true}>
                    <div className="h-5 w-16 bg-bd-secondary/30 rounded"></div>
                  </TableCell>
                  <TableCell isCategory={true}>
                    <div className="h-5 w-16 bg-bd-secondary/30 rounded"></div>
                  </TableCell>
                  <TableCell isCategory={true}>
                    <div className="h-5 w-16 bg-bd-secondary/30 rounded"></div>
                  </TableCell>
                  <TableCell isCategory={true} className="md:hidden">
                    <div className="h-5 w-10 bg-bd-secondary/30 rounded"></div>
                  </TableCell>
                  <TableCell isCategory={false} className="text-center">
                    <div className="inline-flex justify-center items-center w-8 h-8 rounded bg-bd-secondary/30"></div>
                  </TableCell>
                </tr>
              ))
            ) : projects?.map((proj, index) => (
              <tr
                key={proj.id}
                onClick={() => window.location.href = getProjectRoute(proj as ProjectModel)}
                className="cursor-pointer hover:bg-secondary/50 transition-colors group"
              >
                <TableCell className="px-4 flex items-center">
                  <Img
                    src={proj.info.logoUrl}
                    isFetchingLink={isLoading}
                    imgClassName="scale-[102%]"
                    isRounded={true}
                    size="8"
                  />
                </TableCell>
                <TableCell isCategory={false}>
                  <div className="flex items-center gap-1">
                    <span className="text-white">{proj.info?.title || "—"}</span>
                    <Icon icon="SvgShare" className="w-5 h-5 opacity-50" />
                  </div>
                </TableCell>
                <TableCell isCategory={true}>{formatDateForProject(new Date(proj.info.timeline?.find(t => t.id === "REWARD_DISTRIBUTION")?.date || 0))}</TableCell>
                <TableCell isCategory={true}>{proj.info?.sector || "—"}</TableCell>
                <TableCell isCategory={true}>
                  {proj.depositStats ? formatCurrencyCompact(Number(proj.depositStats.totalDepositedInUsd)) : 0}
                </TableCell>
                <TableCell isCategory={true}>{formatFdv(proj.config.fdv)}</TableCell>
                <TableCell isCategory={true} className="md:hidden">
                  {proj.depositStats ? proj.depositStats.participantsCount : 0}
                </TableCell>
                <TableCell isCategory={false} className="text-center">
                  <Link
                    to={getProjectRoute(proj as ProjectModel)}
                    className="inline-flex justify-center items-center w-8 h-8 rounded bg-bd-secondary group-hover:bg-transparent border-none transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Icon icon="SvgArrowRight" className="w-5 h-5 text-white" />
                  </Link>
                </TableCell>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination totalPages={totalPages} currentPage={currentPage} onPageClick={handlePageClick} />
    </div>
  )
}

const formatFdv = (fdv?: number): string => {
  return fdv ? `$${(fdv / 1000000).toFixed(1)}M` : "—"
}