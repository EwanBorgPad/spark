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
import { SortDropdown } from "@/components/Dropdown/SortDropdown"

const displayLogos = [swissborgLogo, jupiterLogo, orcaLogo, raydiumLogo]

const BlitzPools = () => {
  const [activeProjects, setActiveProjects] = useState<ExpandedProject[]>([])
  const [sortOption, setSortOption] = useState<string>("name-asc")
  const { t } = useTranslation()
  const { isMobile } = useWindowSize()

  const { data, isLoading } = useQuery<GetProjectsResponse>({
    queryFn: () =>
      backendApi.getProjects({
        page: 1,
        limit: 999,
        projectType: "blitz",
        completionStatus: "active",
        sortBy: "date",
        sortDirection: "asc",
      }),
    queryKey: ["getProjects", "blitz", "active", "date", "asc"],
  })  

  const skeletonItems = Array.from({ length: 3 }, (_, i) => i)

  useEffect(() => {
    if (!data?.projects) return
    setActiveProjects(processProjects(data.projects))
  }, [data?.projects])

  const sortOptions = [
    { value: "name-asc", label: "Sort by Name, A to Z" },
    { value: "name-desc", label: "Sort by Name, Z to A" },
    { value: "date-asc", label: "Sort by Date, Oldest first" },
    { value: "date-desc", label: "Sort by Date, Newest first" },
    { value: "raised-asc", label: "Sort by Raised, Low to High" },
    { value: "raised-desc", label: "Sort by Raised, High to Low" },
  ]

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
            {!isLoading
              ? activeProjects?.map((project) => <LaunchPoolCard project={project} key={"LaunchPoolCard_" + project.id} />)
              : skeletonItems.map((item) => <LaunchPoolCard key={item} isLoading project={null} />)}
          </ul>
        </div>
      </section>

      <section className="z-[11] flex w-full flex-col items-center gap-4 bg-transparent px-4 py-[60px] md:py-[80px]">
        <div className="flex w-full max-w-[1080px] flex-col items-center">
          <h3 className="mb-8 text-center text-[28px] font-semibold leading-[120%] md:w-full md:text-[30px] lg:text-[32px]">
            {"Completed Blitz Pools"}
          </h3>
          {isMobile ? (
            <div className="flex flex-col items-center gap-6">
              <div className="w-full max-w-[344px] mx-auto">
                <SortDropdown
                  options={sortOptions}
                  selected={sortOption}
                  onChange={setSortOption}
                  placeholder="Sort by Name, A to Z"
                />
              </div>
              <ul className="grid grid-cols-1 place-items-center justify-center gap-6 w-full max-w-[344px] mx-auto">
                {isLoading
                  ? <LaunchPoolCard isLoading project={null} />
                  : activeProjects?.length > 0
                    ? activeProjects.map(project => (
                      <CompletedLaunchPoolCard
                        key={`completed-${project.id}`}
                        project={project}
                        isLoading={isLoading}
                      />
                    ))
                    : <p className="text-center text-fg-secondary">No completed projects yet</p>
                }
              </ul>
            </div>
          ) : (
            <CompletedLaunchPoolTable projectStatus="completed"/>
          )}
        </div>
      </section>

      <ScrollRestoration />
    </main>
  )
}

export default BlitzPools