import React, { useState } from "react"
import { TableCell } from "./TableCell"
import { TableHeader } from "./TableHeader"
import { AnalystRoleEnum, GetListOfAnalysisResponse } from "shared/schemas/analysis-schema"
import Img from "../Image/Img"
import { Button } from "../Button/Button"
import { Icon } from "../Icon/Icon"
import { twMerge } from "tailwind-merge"

type Props = {
  list: GetListOfAnalysisResponse["analysisList"] | undefined
}
type SortField = "analyst" | "role" | "impressions" | "likes"

const rolesObj: Record<AnalystRoleEnum, string> = {
  TEAM_MEMBER: "Team Member",
  SPONSORED_ANALYST: "Sponsored Analyst",
  FREE_WRITER: "Free Writer",
}

const AnalysisTable = ({ list }: Props) => {
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = useState<"desc" | "asc">("desc")

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return "↓"
    return sortDirection === "asc" ? "↑" : "↓"
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  return (
    <div className="hidden md:flex relative col-span-full w-full flex-col rounded-lg bg-transparent">
      <div className="overflow-x-auto">
        <div className="max-h-[500px] overflow-y-auto pr-2">
          <table className="w-full divide-y divide-bd-secondary/15">
            <thead className="sticky top-0 bg-transparent z-[2]">
              <tr className="max-h-[52px] bg-default">
                <TableHeader className="max-w-[260px]" onClick={() => handleSort("analyst")}>
                  Project {getSortIcon("analyst")}
                </TableHeader>
                <TableHeader onClick={() => handleSort("role")}>Role {getSortIcon("role")}</TableHeader>
                <TableHeader className="min-w-[102px]" onClick={() => handleSort("impressions")}>
                  Impressions {getSortIcon("impressions")}
                </TableHeader>
                <TableHeader onClick={() => handleSort("likes")}>Likes {getSortIcon("likes")}</TableHeader>
                <TableHeader className="hover:bg-default hover:cursor-default" onClick={() => {}}>{" "}</TableHeader>

              </tr>
            </thead>
            <tbody className="divide-y divide-bd-secondary/5 pb-10">
              {list?.map((analysis) => (
                <tr className="h-[64px]" key={analysis.analysis.id}>
                  <TableCell className="py-0">
                    <div className="flex flex-row items-center gap-4">
                      <Img size="8" src={analysis.analyst.twitterAvatar} isRounded />
                      <div className="flex flex-col flex-nowrap items-start">
                        <span className="truncate text-sm font-semibold text-fg-primary">
                          {analysis.analyst.twitterName}
                        </span>
                        <span className="truncate text-sm font-normal text-fg-tertiary">
                          @{analysis.analyst.twitterUsername}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-0">
                    <span className="text-fg-secondary">{rolesObj[analysis.analysis.analystRole]}</span>
                  </TableCell>
                  <TableCell className="py-0">
                    <span className="text-fg-primary">{(301334).toLocaleString()}</span>
                  </TableCell>
                  <TableCell className="py-0">
                    <span className="text-fg-primary">{(120).toLocaleString()}</span>
                  </TableCell>
                  <TableCell className="py-0">
                    <a href={analysis.analysis.articleUrl} target="_blank" rel="noreferrer">
                      <Button
                        color="tertiary"
                        btnText="Read"
                        textClassName="text-sm font-medium"
                        className="rounded-lg py-2"
                        suffixElement={<Icon icon="SvgExternalLink" className="text-fg-secondary" />}
                      />
                    </a>
                  </TableCell>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AnalysisTable
