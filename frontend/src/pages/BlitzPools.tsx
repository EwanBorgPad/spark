import { useEffect, useState, useMemo, useRef } from "react"
import { backendApi } from "@/data/backendApi"
import { useTranslation } from "react-i18next"
import { useQuery } from "@tanstack/react-query"
import { ScrollRestoration } from "react-router-dom"

import orcaLogo from "@/assets/launchPools/orca-logo.png"
import jupiterLogo from "@/assets/launchPools/jupiter-logo.png"
import raydiumLogo from "@/assets/launchPools/raydium-logo.png"
import swissborgLogo from "@/assets/launchPools/swissborg-logo.png"
import blitzPoolsLogo from "@/assets/launchPools/blitz-pools-logo.png"

import Img from "@/components/Image/Img"
import { GetProjectsResponse } from "shared/models"
import { LaunchPoolCard } from "@/components/Cards/LaunchPoolCard"
import { ExpandedProject, processProjects } from "@/utils/projects-helper"
import { CompletedLaunchPoolTable } from "@/components/Tables/CompletedLaunchPoolTable"
import { CompletedLaunchPoolCard } from "@/components/Cards/CompletedLaunchPoolCard"
import { useWindowSize } from "@/hooks/useWindowSize"
import Pagination from "@/components/Pagination/Pagination"

const displayLogos = [swissborgLogo, jupiterLogo, orcaLogo, raydiumLogo]

type SortField = 'name' | 'date' | 'raised' | 'fdv' | 'participants' | 'commitments' | 'sector'
type SortDirection = 'asc' | 'desc'

const BlitzPools = () => {
  const [activeProjects, setActiveProjects] = useState<ExpandedProject[]>([])
  const [completedProjects, setCompletedProjects] = useState<ExpandedProject[]>([])
  const [currentActivePage, setCurrentActivePage] = useState(1)
  const [currentCompletedPage, setCurrentCompletedPage] = useState(1)
  const [totalActivePages, setTotalActivePages] = useState(1)
  const [totalCompletedPages, setTotalCompletedPages] = useState(1)
  const [completedSortField, setCompletedSortField] = useState<SortField>('date')
  const [completedSortDirection, setCompletedSortDirection] = useState<SortDirection>('desc')
  const { t } = useTranslation()
  const { isMobile } = useWindowSize()

  const { data: activeData, isLoading: isActiveLoading } = useQuery<GetProjectsResponse>({
    queryFn: () =>
      backendApi.getProjects({
        page: currentActivePage,
        limit: isMobile ? 3 : 9,
        projectType: "blitz",
        completionStatus: "active",
        sortBy: "date",
        sortDirection: "asc",
      }),
    queryKey: ["getProjects", "blitz", "active", "date", "asc", currentActivePage, isMobile],
  })

  const { data: completedData, isLoading: isCompletedLoading } = useQuery<GetProjectsResponse>({
    queryFn: () =>
      backendApi.getProjects({
        page: currentCompletedPage,
        limit: isMobile ? 3 : 10,
        projectType: "blitz",
        completionStatus: "completed",
        sortBy: completedSortField,
        sortDirection: completedSortDirection,
      }),
    queryKey: ["getProjects", "blitz", "completed", completedSortField, completedSortDirection, currentCompletedPage, isMobile],
  })

  const skeletonItems = Array.from({ length: 3 }, (_, i) => i)

  useEffect(() => {
    if (activeData?.pagination) {
      setTotalActivePages(activeData.pagination.totalPages)
    }
    if (completedData?.pagination) {
      setTotalCompletedPages(completedData.pagination.totalPages)
    }
  }, [activeData?.pagination, completedData?.pagination])

  useEffect(() => {
    if (!activeData?.projects) return
    setActiveProjects(processProjects(activeData.projects))
  }, [activeData?.projects])

  useEffect(() => {
    if (!completedData?.projects) return
    setCompletedProjects(processProjects(completedData.projects))
  }, [completedData?.projects])

  const handleActivePageClick = (pageNum: number) => {
    setCurrentActivePage(pageNum)
  }
  const handleCompletedPageClick = (pageNum: number) => {
    setCurrentCompletedPage(pageNum)
  }

  const handleCompletedSort = (field: SortField) => {
    if (completedSortField === field) {
      setCompletedSortDirection(completedSortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setCompletedSortField(field)
      setCompletedSortDirection('asc')
    }
  }

  return (
    <main className="relative z-[10] flex min-h-screen w-full select-none flex-col items-center bg-transparent pt-[48px] md:pt-[68px]">
      <div className="absolute top-[48px] z-[-1] w-screen opacity-100 md:top-[68px] ">
        <video
          src="https://pub-afd56fb014c94eac935a52c2d0d6a5e8.r2.dev/unicorn-animation/sample3%20(online-video-cutter__78pct_smaller.mp4"
          className="left-0 z-[101] h-[642px] w-full animate-looped-video object-cover opacity-50 md:h-auto"
          autoPlay
          loop
          muted
          playsInline
        />
      </div>

      <section className="z-[11] flex w-fit flex-col items-center gap-4 bg-transparent px-4 pt-[60px] md:pt-[80px]">
        <div className="mb-2 h-[40px] w-[170px]">
          <Img src={blitzPoolsLogo} customClass="w-full h-full animate-fade-in-from-below-slow" />
        </div>
        <h1 className="text-center text-[40px] font-semibold leading-[120%] md:w-full">
          {"Blazing fast launch pools"}
          <br></br>
          <span className="text-brand-blitz">{"High voltage opportunities."}</span>
        </h1>
        <p className="max-w-[522px] text-center font-normal text-fg-secondary lg:text-lg">
          {
            "Provide liquidity for your favourite high-risk, low-valuation tokens and lock in rewards at fixed pre-TGE prices."
          }
        </p>
        <div className="flex flex-col items-center gap-4 pt-6">
          <span className="text-sm font-normal text-fg-primary opacity-90">{t("launch_pools.successful_lp")}</span>
          <div className="flex min-h-[32px] flex-wrap items-center justify-center gap-10 gap-y-3">
            {displayLogos.map((logo) => (
              <Img
                key={logo}
                src={logo}
                imgClassName="object-contain"
                customClass="rounded-none w-full max-w-[117px]"
              />
            ))}
            <span className="text-sm opacity-90">...and many more</span>
          </div>
        </div>
      </section>

      <section className="z-[11] flex w-full flex-col items-center gap-4 bg-transparent px-4 py-[60px] md:py-[80px]">
        <div className="flex w-full max-w-[1080px] flex-col items-center">
          <ul className="grid grid-cols-1 place-content-center justify-start gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {!isActiveLoading
              ? activeProjects?.map((project) => <LaunchPoolCard project={project} key={"LaunchPoolCard_" + project.id} />)
              : skeletonItems.map((item) => <LaunchPoolCard key={item} isLoading project={null} />)}
          </ul>
        </div>
        <Pagination totalPages={totalActivePages} currentPage={currentActivePage} onPageClick={handleActivePageClick} />
      </section>

      <section className="z-[11] flex w-full flex-col items-center gap-4 bg-transparent px-4 py-[60px] md:py-[80px]">
        <div className="flex w-full max-w-[1080px] flex-col items-center">
          <h3 className="mb-8 text-center text-[28px] font-semibold leading-[120%] md:w-full md:text-[30px] lg:text-[32px]">
            {"Completed Blitz Pools"}
          </h3>
          {isMobile ? (
            <div className="flex flex-col items-center gap-6">
              <ul className="grid grid-cols-1 place-items-center justify-center gap-6 w-full max-w-[344px] mx-auto">
                {!isCompletedLoading ? (
                  <CompletedLaunchPoolCard
                    projects={completedProjects}
                    onSort={handleCompletedSort}
                    sortField={completedSortField}
                    sortDirection={completedSortDirection}
                  />
                ) : (
                  <CompletedLaunchPoolCard
                    isLoading={true}
                    onSort={handleCompletedSort}
                    sortField={completedSortField}
                    sortDirection={completedSortDirection}
                  />
                )}
              </ul>
            </div>
          ) : (
            !isCompletedLoading ? (
              <CompletedLaunchPoolTable
                projects={completedProjects}
                onSort={handleCompletedSort}
                sortField={completedSortField}
                sortDirection={completedSortDirection}
              />
            ) : (
              <CompletedLaunchPoolTable
                isLoading={true}
                onSort={handleCompletedSort}
                sortField={completedSortField}
                sortDirection={completedSortDirection}
              />
            )
          )}
        </div>
        <Pagination totalPages={totalCompletedPages} currentPage={currentCompletedPage} onPageClick={handleCompletedPageClick} />
      </section>
      <ScrollRestoration />
    </main>
  )
}

export default BlitzPools