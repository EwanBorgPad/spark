import { Link } from "react-router-dom"
import { twMerge } from "tailwind-merge"
import { useTranslation } from "react-i18next"
import { backendApi } from "@/data/backendApi"
import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { GetProjectsResponse, ProjectModel } from "shared/models"
import { useWindowSize } from "@/hooks/useWindowSize"

import Pagination from "../Pagination/Pagination"
import { LaunchPoolCard } from "../Cards/LaunchPoolCard"
import { ExpandedProject, processProjects } from "@/utils/projects-helper"

type Props = {
  projectType: ProjectModel["info"]["projectType"]
}

export const ActiveProjects = ({ projectType }: Props) => {
  const { t } = useTranslation()
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
    queryKey: ["getProjects", projectType, "active", "date", "asc", currentPage],
  })

  const skeletonItems = Array.from({ length: 3 }, (_, i) => i)

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

  return (
    <>
      {!isLoading
        ? projects.map((project) => <LaunchPoolCard project={project} key={"LaunchPoolCard_" + project.id} />)
        : skeletonItems.map((item) => <LaunchPoolCard key={item} isLoading project={null} />)
      }
    </>
  )
}