import { useEffect, useState } from "react"
import { backendApi } from "@/data/backendApi"
import { useQuery } from "@tanstack/react-query"
import { ScrollRestoration, useNavigate } from "react-router-dom"

import launchPoolsBg from "@/assets/launchPools/launch-pools-background.png"
import swissborgLogo from "@/assets/launchPools/swissborg-logo.png"
import jupiterLogo from "@/assets/launchPools/jupiter-logo.png"
import orcaLogo from "@/assets/launchPools/orca-logo.png"
import raydiumLogo from "@/assets/launchPools/raydium-logo.png"

import { GetProjectsResponse } from "shared/models"
import LaunchPoolCard from "@/components/Cards/LaunchPoolCard"
import { ExpandedProject, sortProjectsPerStatus } from "@/utils/projects-helper"
import Img from "@/components/Image/Img"
import { useTranslation } from "react-i18next"

const displayLogos = [swissborgLogo, jupiterLogo, orcaLogo, raydiumLogo]

const LaunchPools = () => {
  const [projects, setProjects] = useState<ExpandedProject[]>([])
  const navigate = useNavigate()
  const { t } = useTranslation()

  const { data } = useQuery<GetProjectsResponse>({
    queryFn: () =>
      backendApi.getProjects({
        page: 1,
        limit: 999,
      }),
    queryKey: ["getProjects", 1],
  })

  //////////////////////////////////////////////////////////////////////////////
  // @SolanaId - useEffect below is for Solana ID whitelisting launch (01.11.2024) - remove this //redirection when we officially launch the rest of the app
  //////////////////////////////////////////////////////////////////////////////
  useEffect(() => {
    if (import.meta.env.VITE_ENVIRONMENT_TYPE === "production") {
      navigate("/launch-pools/solana-id")
    }
  }, [navigate])

  useEffect(() => {
    if (!data?.projects) return
    const sortedProjects = sortProjectsPerStatus(data.projects)
    setProjects(sortedProjects)
  }, [data?.projects])

  return (
    <main className="relative z-[10] min-h-screen w-full bg-transparent pt-[48px] md:pt-[68px]">
      <img src={launchPoolsBg} className="absolute top-[48px] z-[-1] w-full md:top-[68px]" role="presentation" />

      <section className="z-[1] flex w-full flex-col items-center gap-4 bg-transparent px-4 py-[60px] md:py-[80px]">
        <h1 className="text-center text-[40px] font-semibold leading-[120%] md:w-full">
          {t("launch_pools.liquidity_to_the")}
          <br></br>
          <span className="text-fg-brand-primary">{t("launch_pools.power_to_the")}</span>
        </h1>
        <p className="max-w-[522px] text-center font-normal lg:text-lg">
          {t("launch_pools.provide_liquidity_subtitle")}
        </p>
        <div className="flex flex-col items-center gap-4 pt-6">
          <span className="text-sm font-normal text-fg-primary opacity-90">{t("launch_pools.successful_lp")}</span>
          <div className="flex flex-wrap items-center justify-center gap-10 gap-y-3">
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

        <div className="mt-[64px] flex max-w-[1080px] flex-col items-center">
          <ul className="grid grid-cols-1 justify-start gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <LaunchPoolCard project={project} key={project.info.id} />
            ))}
          </ul>
        </div>
      </section>

      <ScrollRestoration />
    </main>
  )
}

export default LaunchPools
