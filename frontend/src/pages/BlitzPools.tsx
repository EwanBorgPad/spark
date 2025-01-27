import { useEffect, useState } from "react"
import { backendApi } from "@/data/backendApi"
import { useQuery } from "@tanstack/react-query"
import { ScrollRestoration } from "react-router-dom"

import blitzPoolsBg from "@/assets/launchPools/bg-blitz-pools-min-new.png"
import blitzPoolsLogo from "@/assets/launchPools/blitz-pools-logo.png"
import swissborgLogo from "@/assets/launchPools/swissborg-logo.png"
import jupiterLogo from "@/assets/launchPools/jupiter-logo.png"
import orcaLogo from "@/assets/launchPools/orca-logo.png"
import raydiumLogo from "@/assets/launchPools/raydium-logo.png"

import { GetProjectsResponse } from "shared/models"
import { LaunchPoolCard } from "@/components/Cards/LaunchPoolCard"
import { ExpandedProject, sortProjectsPerStatus } from "@/utils/projects-helper"
import Img from "@/components/Image/Img"
import { useTranslation } from "react-i18next"
import BlitzPoolsAnimation from "@/components/Animated/BlitzPoolsAnimation"

const displayLogos = [swissborgLogo, jupiterLogo, orcaLogo, raydiumLogo]

const BlitzPools = () => {
  const [phases, setPhases] = useState<ExpandedProject[][]>([])
  const { t } = useTranslation()

  const { data, isLoading } = useQuery<GetProjectsResponse>({
    queryFn: () =>
      backendApi.getProjects({
        page: 1,
        limit: 999,
        projectType: "blitz",
      }),
    queryKey: ["getProjects", "blitz"],
  })

  const skeletonItems = Array.from({ length: 3 }, (_, i) => i)

  useEffect(() => {
    if (!data?.projects) return
    const sortedProjects = sortProjectsPerStatus(data.projects)
    setPhases(sortedProjects)
  }, [data?.projects])

  return (
    <main className="relative z-[10] flex min-h-screen w-full flex-col items-center bg-transparent pt-[48px] md:pt-[68px]">
      <div className="absolute top-[48px] z-[-1] w-screen opacity-100 md:top-[68px] ">
        <BlitzPoolsAnimation />
      </div>

      <section className="z-[11] flex w-fit flex-col items-center gap-4 bg-transparent px-4 pt-[60px] md:pt-[80px]">
        <Img src={blitzPoolsLogo} customClass="max-h-[40px] max-w-[174px] mb-2" />

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
          <ul className="grid w-full grid-cols-1 justify-start gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {!isLoading
              ? phases?.map((phase) =>
                  phase?.map((project) => <LaunchPoolCard project={project} key={"LaunchPoolCard_" + project.id} />),
                )
              : skeletonItems.map((item) => <LaunchPoolCard key={item} isLoading project={null} />)}
          </ul>
        </div>
      </section>

      <ScrollRestoration />
    </main>
  )
}

export default BlitzPools
