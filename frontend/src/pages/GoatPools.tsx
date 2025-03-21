import { useEffect, useMemo, useState } from "react"
import { backendApi } from "@/data/backendApi"
import { useQuery } from "@tanstack/react-query"
import { ScrollRestoration } from "react-router-dom"

import launchPoolsBg from "@/assets/launchPools/launch-pools-background.png"
import swissborgLogo from "@/assets/launchPools/swissborg-logo.png"
import jupiterLogo from "@/assets/launchPools/jupiter-logo.png"
import orcaLogo from "@/assets/launchPools/orca-logo.png"
import raydiumLogo from "@/assets/launchPools/raydium-logo.png"
import goatPoolsLogo from "@/assets/launchPools/goat-pools-logo.png"

import { GetProjectsResponse } from "shared/models"
import { LaunchPoolCard } from "@/components/Cards/LaunchPoolCard"
import { ExpandedProject, processProjects } from "@/utils/projects-helper"
import Img from "@/components/Image/Img"
import { useTranslation } from "react-i18next"
import { CompletedLaunchPoolTable } from "@/components/Tables/CompletedLaunchPoolTable"
import { CompletedLaunchPoolCard } from "@/components/Cards/CompletedLaunchPoolCard"
import { useWindowSize } from "@/hooks/useWindowSize"
import { SortDropdown } from "@/components/Dropdown/SortDropdown"
const displayLogos = [swissborgLogo, jupiterLogo, orcaLogo, raydiumLogo]

const GoatPools = () => {
  const [activeProjects, setActiveProjects] = useState<ExpandedProject[]>([])
  const [sortOption, setSortOption] = useState<string>("name-asc")
  const { t } = useTranslation()
  const { isMobile } = useWindowSize()

  const { data, isLoading } = useQuery<GetProjectsResponse>({
    queryFn: () =>
      backendApi.getProjects({
        page: 1,
        limit: 999,
        projectType: "goat",
        completionStatus: "active",
        sortBy: "date",
        sortDirection: "asc",
      }),
    queryKey: ["getProjects", "goat", "active", "date", "asc"],
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
    <main className="relative z-[10] min-h-screen w-full select-none bg-transparent pt-[48px] md:pt-[68px]">
      <img src={launchPoolsBg} className="absolute top-[48px] z-[-1] w-full md:top-[68px]" role="presentation" />

      <section className="z-[1] flex w-full flex-col items-center gap-4 bg-transparent px-4 py-[60px] md:py-[80px]">
        <div className="mb-2 h-[40px] w-[194px]">
          <Img src={goatPoolsLogo} customClass="w-full h-full animate-fade-in-from-below-slow" />
        </div>
        <h1 className="text-center text-[40px] font-semibold leading-[120%] md:w-full">
          {t("launch_pools.liquidity_to_the")}
          <br></br>
          <span className="text-fg-brand-primary">{t("launch_pools.power_to_the")}</span>
        </h1>
        <p className="max-w-[522px] text-center font-normal text-fg-secondary lg:text-lg">
          <span>{t("launch_pools.provide_liquidity_subtitle_1")}</span>
          <br></br>
          <span>{t("launch_pools.provide_liquidity_subtitle_2")}</span>
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

        <div className="mt-[64px] flex w-full max-w-[1080px] flex-col items-center">
          <ul className="grid grid-cols-1 place-content-center justify-start gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {!isLoading
              ? activeProjects?.map((project) => <LaunchPoolCard project={project} key={"LaunchPoolCard_" + project.id} />)
              : skeletonItems.map((item) => <LaunchPoolCard key={item} isLoading project={null} />)}
          </ul>
        </div>
      </section>

      <section className="z-[11] flex w-full flex-col items-center gap-4 bg-transparent px-4 py-[60px] md:py-[80px]">
        <div className="flex w-full max-w-[1080px] flex-col items-center">
          <h3 className="mb-8 text-center text-[32px] font-semibold leading-[120%] md:w-full">
            {"Completed Goat Pools"}
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
                  ? <CompletedLaunchPoolCard isLoading project={null} />
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
            <CompletedLaunchPoolTable projectStatus="completed" />
          )}
        </div>
      </section>

      <ScrollRestoration />
    </main>
  )
}

export default GoatPools
