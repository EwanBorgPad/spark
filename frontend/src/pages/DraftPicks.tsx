import { useEffect, useState } from "react"
import { backendApi } from "@/data/backendApi"
import { useQuery } from "@tanstack/react-query"
import { ScrollRestoration } from "react-router-dom"

import goatPoolsLogo from "@/assets/launchPools/goat-pools-logo.png"
import blitzPoolsLogo from "@/assets/launchPools/blitz-pools-logo.png"
import draftPicksLogo from "@/assets/launchPools/draft-picks-logo.png"
import draftPicksBackground from "@/assets/launchPools/draft-picks-background.png"

import Img from "@/components/Image/Img"
import { Icon } from "@/components/Icon/Icon"
import { GetProjectsResponse } from "shared/models"
import { ProjectPoolCard } from "@/components/Cards/ProjectPoolCard"
import { ExpandedProject, sortProjectsPerStatus } from "@/utils/projects-helper"
import { LaunchPoolCard } from "@/components/Cards/LaunchPoolCard"

const displayLogos = [blitzPoolsLogo, goatPoolsLogo]

const DraftPicks = () => {
  const [phases, setPhases] = useState<ExpandedProject[][]>([])

  const { data, isLoading } = useQuery<GetProjectsResponse>({
    queryFn: () =>
      backendApi.getProjects({
        page: 1,
        limit: 999,
        projectType: "draft-pick",
      }),
    queryKey: ["getProjects", "draft-pick"],
  })

  const skeletonItems = Array.from({ length: 3 }, (_, i) => i)

  useEffect(() => {
    if (!data?.projects) return
    const sortedProjects = sortProjectsPerStatus(data.projects)
    setPhases(sortedProjects)
  }, [data?.projects])

  return (
    <main className="relative z-[10] flex min-h-screen w-full select-none flex-col items-center bg-transparent pt-[48px] md:pt-[68px]">
      <img
        style={{ animationDelay: "700ms" }}
        src={draftPicksBackground}
        className="absolute right-0 top-[48px] z-[-1] w-[576px] animate-opacity-in opacity-0 md:top-[68px] md:w-full"
        role="presentation"
      />

      <section className="z-[11] flex w-full flex-col items-start bg-transparent px-4 pt-[60px] md:items-center md:pt-[80px]">
        <div className="animate-fade-in-from-below-slow-2 flex flex-col items-start">
          <div className="flex md:w-full md:max-w-[288px]">
            <div className="flex items-center gap-1">
              <Icon icon="SvgLogo" className="mb-1 ml-[30px] h-[20px] text-2xl" />
              <span className="font-sulphur-point text-2xl leading-[28px] text-fg-primary">BorgPad</span>
            </div>
          </div>
          <div className="mb-2 ml-[-4px] h-[162px] w-[280px] md:ml-0">
            <Img src={draftPicksLogo} customClass="w-full h-full " />
          </div>
        </div>
        <p className="mt-6 max-w-[310px] text-left font-normal text-fg-primary md:max-w-[462px] md:text-center md:text-lg">
          Express your investment interest in the up-and-coming talent and help launch them on BorgPad.
        </p>
        <div className="mt-10 flex flex-col items-start gap-4 md:mt-[60px] md:items-center">
          <span className="text-sm font-normal text-fg-secondary opacity-90">Popular projects launch on</span>
          <div className="flex min-h-[32px] flex-wrap items-center justify-center gap-10 gap-y-3">
            {displayLogos.map((logo) => (
              <Img
                key={logo}
                src={logo}
                imgClassName="object-contain"
                customClass="rounded-none w-full max-w-[117px]"
              />
            ))}
          </div>
        </div>
      </section>

      <section className="z-[11] flex w-full flex-col items-center gap-4 bg-transparent px-4 py-[60px] md:py-[80px]">
        <div className="flex w-full max-w-[1080px] flex-col items-center">
          <ul className="grid w-full grid-cols-1 place-items-center items-center justify-start gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {!isLoading
              ? phases?.map((phase) => phase?.map((project) => <ProjectPoolCard project={project} key={project.id} />))
              : skeletonItems.map((item) => <LaunchPoolCard key={item} isLoading project={null} />)}
          </ul>
        </div>
      </section>

      <ScrollRestoration />
    </main>
  )
}

export default DraftPicks
