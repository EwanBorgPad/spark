import { Link } from "react-router-dom"
import { twMerge } from "tailwind-merge"
import { useTranslation } from "react-i18next"
import { useState, useMemo, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"

import Img from "../Image/Img"
import { ExpandedProject, processProjects } from "@/utils/projects-helper"
import { getProjectRoute } from "@/utils/routes"
import { Icon } from "../Icon/Icon"
import { GetProjectsResponse, ProjectModel } from "shared/models"
import { formatCurrencyAmount } from "shared/utils/format"
import { backendApi } from "@/data/backendApi.ts"
import { formatDateForProject } from "@/utils/date-helpers"
import { TableHeader } from "./TableHeader"
import { TableCell } from "./TableCell"

type Props = {
  projectStatus: "completed" | "active" | "all"
}

type SortField = 'name' | 'date' | 'raised' | 'fdv' | 'participants' | 'commitments' | 'sector'
type SortDirection = 'asc' | 'desc'

export const CompletedLaunchPoolTable = ({ projectStatus }: Props) => {
  const { t } = useTranslation()
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [completedProjects, setCompletedProjects] = useState<ExpandedProject[]>([])


  const { data: completedData, isLoading: isCompletedLoading } = useQuery<GetProjectsResponse>({
    queryFn: () =>
      backendApi.getProjects({
        page: 1,
        limit: 999,
        projectType: "blitz",
        completionStatus: projectStatus,
        sortBy: sortField,
        sortDirection: sortDirection,
      }),
    queryKey: ["getProjects", "blitz", projectStatus, sortField, sortDirection],
  })

  const skeletonItems = Array.from({ length: 5 }, (_, i) => i)

  useEffect(() => {
    if (completedData?.projects) {
      setCompletedProjects(processProjects(completedData.projects))
    }
  }, [completedData?.projects])

  // Fetch sale results for all projects
  const projectIds = completedProjects?.map(p => p.id) || []
  const { data: saleResultsMap, isLoading: isLoadingSaleResults } = useQuery({
    queryFn: async () => {
      if (!projectIds.length) return {}

      // Fetch sale results for each project and create a map for easy lookup
      const results = await Promise.all(
        projectIds.map(async (projectId) => {
          try {
            const data = await backendApi.getSaleResults({ projectId })
            return { projectId, data }
          } catch (error) {
            console.error(`Error fetching sale results for ${projectId}:`, error)
            return { projectId, data: null }
          }
        })
      )

      // Convert to a map for easy lookup by project ID
      return results.reduce((acc, { projectId, data }) => {
        acc[projectId] = data
        return acc
      }, {} as Record<string, any>)
    },
    queryKey: ["saleResults", projectIds.join(",")],
    enabled: Boolean(projectIds.length),
    staleTime: 30 * 1000,
  })

  const isTableLoading = isCompletedLoading || isLoadingSaleResults

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

  const getSaleData = (projectId: string) => {
    return saleResultsMap?.[projectId] || null
  }

  const getAmountRaised = (proj: ExpandedProject) => {
    const saleData = getSaleData(proj.id)
    if (saleData?.totalAmountRaised?.amountInUsd) {
      return formatCurrencyAmount(Number(saleData.totalAmountRaised.amountInUsd), { withDollarSign: true })
    }
    // Fallback to the existing data if sale results are not available
    return formatCurrencyAmount(proj.investmentIntentSummary?.sum ?? 0, { withDollarSign: true })
  }

  const getParticipantsCount = (proj: ExpandedProject) => {
    const saleData = getSaleData(proj.id)
    if (saleData?.participantsCount) {
      return saleData.participantsCount
    }
    // Fallback to the existing data if sale results are not available
    return proj.investmentIntentSummary?.count ?? 0
  }

  if (!completedProjects?.length && !isTableLoading) return null

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
              {/* <TableHeader onClick={() => handleSort('rewards')} className="w-[10%]">
                Rewards Given {getSortIcon('rewards')}
              </TableHeader> */}
              <TableHeader className="w-[2%] text-center">
                {" "}
              </TableHeader>
            </tr>
          </thead>
          <tbody className="divide-y divide-bd-secondary/20">
            {isTableLoading ? (
              // Display skeleton rows when loading
              skeletonItems.map((item) => (
                <tr key={`skeleton-${item}`} className="animate-pulse">
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
            ) : completedProjects?.map((proj, index) => (
              <tr
                key={proj.id}
                onClick={() => window.location.href = getProjectRoute(proj as ProjectModel)}
                className="cursor-pointer hover:bg-secondary/50 transition-colors group"
              >
                <TableCell className="px-4 flex items-center">
                  <Img
                    src={proj.info.logoUrl}
                    isFetchingLink={isCompletedLoading}
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
                <TableCell isCategory={true}>{getAmountRaised(proj)}</TableCell>
                <TableCell isCategory={true}>{formatFdv(proj.config.fdv)}</TableCell>
                <TableCell isCategory={true} className="md:hidden">{getParticipantsCount(proj)}</TableCell>
                {/* <TableCell isCategory={true}>{formatCurrencyAmount(proj.investmentIntentSummary?.sum ?? 0, { withDollarSign: true })}</TableCell> */}
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
    </div>
  )
}

const formatFdv = (fdv?: number): string => {
  return fdv ? `$${(fdv / 1000000).toFixed(1)}M` : "—"
}