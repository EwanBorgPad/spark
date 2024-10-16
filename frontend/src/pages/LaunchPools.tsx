import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { backendApi } from "@/data/backendApi"
import { useQuery } from "@tanstack/react-query"
import { ScrollRestoration } from "react-router-dom"

import Img from "@/components/Image/Img"
// import { getProjectsDummyResponse } from "@/data/projectsDummy"
import launchPoolsBg from "@/assets/launchPools/launch-pools-background.png"
import LaunchPoolCard from "@/components/Cards/LaunchPoolCard"
import { GetProjectsResponse, ProjectModel } from "shared/models"
import Pagination from "@/components/Pagination/Pagination"

const LaunchPools = () => {
  const [page, setPage] = useState(1)
  const [projects, setProjects] = useState<ProjectModel[]>([])
  // const { t } = useTranslation()
  const limit = 9

  // @TODO UNCOMMENT
  const { data, dataUpdatedAt } = useQuery<GetProjectsResponse>({
    queryFn: () =>
      backendApi.getProjects({
        page,
        limit,
      }),
    queryKey: ["getExchange", page, limit],
  })

  const onPageClick = (pageNum: number) => {
    setPage(pageNum)
  }

  useEffect(() => {
    if (!data?.projects) return
    setProjects(data.projects)
  }, [data?.projects, dataUpdatedAt])

  const pagination = data?.pagination

  return (
    <main className="relative z-[10] min-h-screen w-full bg-transparent pt-[48px] md:pt-[68px]">
      <Img
        src={launchPoolsBg}
        customClass="w-full absolute top-[48px] md:top-[68px] z-[-1]"
      />

      <section className=": z-[1] flex w-full flex-col items-center gap-4 bg-transparent px-4 py-[60px] md:py-[80px]">
        <h1 className="md: w-full text-center text-[40px] leading-tight">
          Current, past & future projects
        </h1>
        <p className="max-w-[522px] text-center text-xl">
          Invest in the most promising Web3 startups - building the future we
          want to live in.
        </p>

        <div className="mt-[64px] flex max-w-[1080px] flex-col items-center">
          <ul className="grid grid-cols-1 justify-start gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <LaunchPoolCard project={project} key={project.info.id} />
            ))}
          </ul>
        </div>
        {pagination && pagination.totalPages > 1 && (
          <Pagination
            totalPages={pagination.totalPages}
            currentPage={page}
            onPageClick={onPageClick}
          />
        )}

        {/* <Link to={"/launch-pools/puffer-finance"}>
          <Button size="xl" color="primary" btnText="Go To Puffer Finance" />
        </Link> */}
      </section>

      <ScrollRestoration />
    </main>
  )
}

export default LaunchPools
