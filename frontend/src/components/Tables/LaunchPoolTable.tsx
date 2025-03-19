import { Link } from "react-router-dom"
import { twMerge } from "tailwind-merge"
import { useTranslation } from "react-i18next"
import { useState, useMemo } from "react"

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

type Props = {
  projects: ExpandedProject[]
  isLoading?: boolean
}

type SortField = 'title' | 'date' | 'sector' | 'raised' | 'fdv' | 'participants' | 'rewards'
type SortDirection = 'asc' | 'desc'

export const LaunchPoolTable = ({ projects, isLoading }: Props) => {
  const { t } = useTranslation()
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

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

  const sortedProjects = useMemo(() => {
    if (!projects?.length) return []

    return [...projects].sort((a, b) => {
      const multiplier = sortDirection === 'asc' ? 1 : -1

      switch (sortField) {
        case 'title':
          return (a.info.title || '').localeCompare(b.info.title || '') * multiplier
        case 'date': {
          const aDate = new Date(a.info.timeline?.find(t => t.id === "REWARD_DISTRIBUTION")?.date || 0).getTime()
          const bDate = new Date(b.info.timeline?.find(t => t.id === "REWARD_DISTRIBUTION")?.date || 0).getTime()
          return (aDate - bDate) * multiplier
        }
        case 'sector':
          return (a.info.sector || '').localeCompare(b.info.sector || '') * multiplier
        case 'raised':
          return ((a.investmentIntentSummary?.sum || 0) - (b.investmentIntentSummary?.sum || 0)) * multiplier
        case 'fdv':
          return ((a.config.fdv || 0) - (b.config.fdv || 0)) * multiplier
        case 'participants':
          return ((a.investmentIntentSummary?.count || 0) - (b.investmentIntentSummary?.count || 0)) * multiplier
        case 'rewards':
          return ((a.investmentIntentSummary?.sum || 0) - (b.investmentIntentSummary?.sum || 0)) * multiplier
        default:
          return 0
      }
    })
  }, [projects, sortField, sortDirection])

  if (!projects?.length && !isLoading) return null

  return (
    <div className="relative flex w-full col-span-full flex-col overflow-hidden rounded-lg border-[1px] border-bd-secondary/30 bg-transparent">
      <div className="overflow-x-auto max-h-[80vh]">
        <table className="w-full divide-y divide-bd-secondary/30">
          <thead className="sticky top-0 bg-transparent">
            <tr>
              <TableHeader className="w-[5%] text-center">
                {" "}
              </TableHeader>
              <TableHeader onClick={() => handleSort('title')} className="w-[10%]">
                Project {getSortIcon('title')}
              </TableHeader>
              <TableHeader onClick={() => handleSort('date')} className="w-[10%]">
                Date {getSortIcon('date')}
              </TableHeader>
              <TableHeader onClick={() => handleSort('sector')} className="w-[10%]">
                Category {getSortIcon('sector')}
              </TableHeader>
              <TableHeader onClick={() => handleSort('raised')} className="w-[10%]">
                Raised {getSortIcon('raised')}
              </TableHeader>
              <TableHeader onClick={() => handleSort('fdv')} className="w-[10%]">
                FDV {getSortIcon('fdv')}
              </TableHeader>
              <TableHeader onClick={() => handleSort('participants')} className="w-[10%]">
                Participants {getSortIcon('participants')}
              </TableHeader>
              <TableHeader onClick={() => handleSort('rewards')} className="w-[10%]">
                Rewards {getSortIcon('rewards')}
              </TableHeader>
              <TableHeader className="w-[2%] text-center">
                {" "}
              </TableHeader>
            </tr>
          </thead>
          <tbody className="divide-y divide-bd-secondary/20">
            {isLoading ? (
              <tr>
                <td colSpan={9} className="px-3 py-4 text-center text-fg-tertiary">
                  Loading...
                </td>
              </tr>
            ) : sortedProjects.map((proj, index) => (
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
                <TableCell isCategory={true}>{formatEventDate(proj, "REWARD_DISTRIBUTION")}</TableCell>
                <TableCell isCategory={true}>{proj.info?.sector || "—"}</TableCell>
                <TableCell isCategory={true}>{formatCurrencyAmount(proj.investmentIntentSummary?.sum ?? 0, { withDollarSign: true })}</TableCell>
                <TableCell isCategory={true}>{formatFdv(proj.config.fdv)}</TableCell>
                <TableCell isCategory={true}>{proj.investmentIntentSummary?.count ?? 0}</TableCell>
                <TableCell isCategory={true}>{formatCurrencyAmount(proj.investmentIntentSummary?.sum ?? 0, { withDollarSign: true })}</TableCell>
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

const TableHeader = ({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  isCategory?: boolean
}) => (
  <th
    className={twMerge(
      "text-left text-xs font-medium text-fg-tertiary tracking-wider px-2 py-3 w-[12%]",
      onClick && "cursor-pointer hover:bg-secondary/50 transition-colors",
      className
    )}
    onClick={onClick}
  >
    {children}
  </th>
)

const TableCell = ({ 
  children, 
  className = "",
  isCategory = false
}: { 
  children: React.ReactNode, 
  className?: string,
  isCategory?: boolean 
}) => (
  <td className={twMerge(
    "px-2 py-6 text-sm whitespace-nowrap", 
    isCategory && "text-fg-tertiary", 
    className
  )}>
    {children}
  </td>
)

const formatFdv = (fdv?: number): string => {
  return fdv ? `$${(fdv / 1000000).toFixed(1)}M` : "—"
}

const formatEventDate = (project: ExpandedProject | null, eventId: string): string => {
  if (!project?.info?.timeline) return "—"

  const event = project.info.timeline.find(t => t.id === eventId)
  if (!event?.date) return "—"

  return new Date(event.date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).replace(/(\d+)/, (match) => {
    const num = parseInt(match)
    const suffix = ['th', 'st', 'nd', 'rd'][num % 10 > 3 ? 0 : (num % 100 - num % 10 != 10 ? num % 10 : 0)]
    return num + suffix
  })
}