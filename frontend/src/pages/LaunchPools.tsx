import { useEffect, useState } from "react"
import { backendApi } from "@/data/backendApi"
import { useQuery } from "@tanstack/react-query"
import { ScrollRestoration } from "react-router-dom"

import launchPoolsBg from "@/assets/launchPools/launch-pools-background.png"

import Img from "@/components/Image/Img"
import { GetProjectsResponse } from "shared/models"
import LaunchPoolCard from "@/components/Cards/LaunchPoolCard"
import { ExpandedProject, sortProjectsPerStatus } from "@/utils/projects-helper"

const LaunchPools = () => {
  const [projects, setProjects] = useState<ExpandedProject[]>([])

  // @TODO - UNCOMMENT
  const { data } = useQuery<GetProjectsResponse>({
    queryFn: () =>
      backendApi.getProjects({
        page: 1,
        limit: 999,
      }),
    queryKey: ["getProjects", 1],
  })

  useEffect(() => {
    if (!data?.projects) return
    const sortedProjects = sortProjectsPerStatus(data.projects)
    setProjects(sortedProjects)
  }, [data?.projects])

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
      </section>

      <ScrollRestoration />
    </main>
  )
}

export default LaunchPools
