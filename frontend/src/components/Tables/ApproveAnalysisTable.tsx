import React, { useState } from "react"
import { TableCell } from "./TableCell"
import { TableHeader } from "./TableHeader"
import { AnalystRoleEnum, GetListOfAnalysisResponse } from "shared/schemas/analysis-schema"
import Img from "../Image/Img"
import { Button } from "../Button/Button"
import { Icon } from "../Icon/Icon"
import { UpdateAnalysisApproval } from "@/data/backendApi"

type Props = {
  list: GetListOfAnalysisResponse["analysisList"] | undefined
  onUpdateStatusSubmit?: (args: Pick<UpdateAnalysisApproval, "action" | "analysisId">) => void
}
type SortField = "analyst" | "role" | "impressions" | "likes" | "project"

const rolesObj: Record<AnalystRoleEnum, string> = {
  TEAM_MEMBER: "Team Member",
  SPONSORED_ANALYST: "Sponsored Analyst",
  FREE_WRITER: "Free Writer",
}

const ApproveAnalysisTable = ({ list, onUpdateStatusSubmit }: Props) => {
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
    <div className="relative col-span-full hidden w-full flex-col rounded-lg bg-transparent md:flex">
      <div className="overflow-x-auto">
        <div className="max-h-[500px] overflow-y-auto pr-2">
          <table className="w-full divide-y divide-bd-secondary/15">
            <thead className="sticky top-0 z-[2] bg-transparent">
              <tr className="max-h-[52px] bg-default">
                <TableHeader className="max-w-[260px]" onClick={() => handleSort("analyst")}>
                  Analyst {getSortIcon("analyst")}
                </TableHeader>
                <TableHeader onClick={() => handleSort("project")}>Project {getSortIcon("project")}</TableHeader>
                <TableHeader onClick={() => handleSort("role")}>Role {getSortIcon("role")}</TableHeader>
                <TableHeader className="min-w-[102px]" onClick={() => handleSort("impressions")}>
                  Impressions {getSortIcon("impressions")}
                </TableHeader>
                <TableHeader onClick={() => handleSort("likes")}>Likes {getSortIcon("likes")}</TableHeader>
                <TableHeader className="hover:cursor-default hover:bg-default" onClick={() => {}}>
                  {" "}
                </TableHeader>
                {onUpdateStatusSubmit && (
                  <TableHeader className="hover:cursor-default hover:bg-default" onClick={() => {}}>
                    {" "}
                  </TableHeader>
                )}
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
                    <span className="text-fg-secondary">{analysis.analysis.projectId}</span>
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
                  {onUpdateStatusSubmit && (
                    <TableCell className="py-0">
                      <div className="flex gap-2">
                        <Button
                          prefixElement={<Icon icon="SvgCircledCheckmark" />}
                          btnText="Approve"
                          size="xs"
                          color="primary"
                          onClick={() => onUpdateStatusSubmit({ analysisId: analysis.analysis.id, action: "approve" })}
                        />
                        <Button.Icon
                          icon="SvgX"
                          size="xs"
                          color="danger"
                          onClick={() => onUpdateStatusSubmit({ analysisId: analysis.analysis.id, action: "decline" })}
                        />
                      </div>
                    </TableCell>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ApproveAnalysisTable
