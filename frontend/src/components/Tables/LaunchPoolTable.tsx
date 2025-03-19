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
    <div className="relative flex w-full col-span-full flex-col overflow-hidden rounded-lg border-[1px] border-bd-secondary/30 bg-default">
      <div className="overflow-x-auto max-h-[80vh] -mx-4 px-4">
        <table className="w-full min-w-[1200px] divide-y divide-bd-secondary/30">
          <thead className="sticky top-0 bg-default">
            <tr>
              <TableHeader onClick={() => handleSort('title')} className="w-[15%] px-10">
                Project {getSortIcon('title')}
              </TableHeader>
              <TableHeader onClick={() => handleSort('date')} className="w-[12%]" isCategory>
                Date {getSortIcon('date')}
              </TableHeader>
              <TableHeader onClick={() => handleSort('sector')} className="w-[12%]" isCategory>
                Category {getSortIcon('sector')}
              </TableHeader>
              <TableHeader onClick={() => handleSort('raised')} className="w-[12%]" isCategory>
                Raised {getSortIcon('raised')}
              </TableHeader>
              <TableHeader onClick={() => handleSort('fdv')} className="w-[12%]" isCategory>
                FDV {getSortIcon('fdv')}
              </TableHeader>
              <TableHeader onClick={() => handleSort('participants')} className="w-[12%]" isCategory>
                Participants {getSortIcon('participants')}
              </TableHeader>
              <TableHeader onClick={() => handleSort('rewards')} className="w-[15%]" isCategory>
                Rewards Distributed {getSortIcon('rewards')}
              </TableHeader>
              <TableHeader className="w-[10%] text-center">
                {" "}
              </TableHeader>
            </tr>
          </thead>
          <tbody className="divide-y divide-bd-secondary/20">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-3 py-4 text-center text-fg-tertiary">
                  Loading...
                </td>
              </tr>
            ) : sortedProjects.map((proj, index) => (
              <tr 
                key={proj.id}
                onClick={() => window.location.href = getProjectRoute(proj as ProjectModel)}
                className="cursor-pointer hover:bg-secondary/50 transition-colors"
              >
                <TableCell className="px-6">{proj.info?.title || "—"}</TableCell>
                <TableCell>{formatEventDate(proj, "REWARD_DISTRIBUTION")}</TableCell>
                <TableCell>{proj.info?.sector || "—"}</TableCell>
                <TableCell>{formatCurrencyAmount(proj.investmentIntentSummary?.sum ?? 0, { withDollarSign: true })}</TableCell>
                <TableCell>{formatFdv(proj.config.fdv)}</TableCell>
                <TableCell>{proj.investmentIntentSummary?.count ?? 0}</TableCell>
                <TableCell>{formatCurrencyAmount(proj.investmentIntentSummary?.sum ?? 0, { withDollarSign: true })}</TableCell>
                <TableCell className="text-center">
                  <Link 
                    to={getProjectRoute(proj as ProjectModel)}
                    className="text-brand-primary hover:text-brand-primary-hover inline-flex justify-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Icon icon="SvgArrowRight" className="w-5 h-5" />
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
  isCategory = false
}: { 
  children: React.ReactNode
  onClick?: () => void
  className?: string
  isCategory?: boolean
}) => (
  <th 
    className={twMerge(
      "text-left text-xs font-medium text-fg-tertiary tracking-wider",
      onClick && "cursor-pointer hover:bg-secondary/50 transition-colors",
      isCategory && "px-3 py-3",
      className
    )}
    onClick={onClick}
  >
    {children}
  </th>
)

const TableCell = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <td className={twMerge("px-3 py-6 text-sm whitespace-nowrap", className)}>{children}</td>
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