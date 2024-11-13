import { ScrollRestoration } from "react-router-dom"
import { useTranslation } from "react-i18next"

import TokenGenerationSection from "../components/TokenGenerationSection/TokenGenerationSection"
import { ExternalLink } from "../components/Button/ExternalLink"
import { useProjectDataContext } from "@/hooks/useProjectData"
import { expandTimelineDataInfo } from "@/utils/timeline"
import Timeline from "@/components/Timeline/Timeline"
import backdropImg from "@/assets/backdropImgMin.png"
import Img from "@/components/Image/Img"
import Text from "@/components/Text"
import ProjectTester2 from "@/components/QA/ProjectTester2.tsx"

const Project = () => {
  const { projectData, isLoading } = useProjectDataContext()
  const { t } = useTranslation()

  const expandedTimeline = expandTimelineDataInfo(
    projectData?.info.timeline ?? [],
  )

  return (
    <main className="z-[10] flex w-full max-w-full flex-col items-center gap-10 overflow-y-hidden py-[72px] font-normal text-fg-primary lg:py-[100px]">
      <div className="max-w-screen absolute left-0 top-10 z-[-11] w-full overflow-hidden lg:top-16">
        <img src={backdropImg} className="h-[740px] min-w-[1440px] lg:h-auto lg:w-screen" />
      </div>

      <section className="flex w-full flex-col items-center gap-10 px-4">
        <div className="flex w-full flex-col justify-between gap-6 lg:max-w-[760px] lg:flex-row">
          <div className="flex flex-col gap-6 lg:flex-row">
            <Img src={projectData?.info.logoUrl} isFetchingLink={isLoading} size="20" imgClassName="scale-[102%]" />
            <div className="flex flex-col gap-1">
              <Text text={projectData.info.title} as="h1" className="font-semibold" isLoading={isLoading} />
              <Text
                text={projectData.info.subtitle}
                as="span"
                className="text-fg-primary text-opacity-75"
                isLoading={isLoading}
              />
            </div>
          </div>
          <div className="flex items-start gap-2">
            {projectData.info.projectLinks.map((link, index) => (
              <ExternalLink.Icon key={index} externalLink={link} />
            ))}
          </div>
        </div>

        <div className="flex w-full flex-col gap-x-5 gap-y-3 text-sm md:flex-row lg:max-w-[760px]">
          <div className="flex gap-5">
            <div className="flex items-center gap-2 border-r-fg-gray-line pr-5 md:border-r-[1px]">
              <span className="text-fg-primary text-opacity-50">{t("chain")}</span>
              <Img size="4" src={projectData.info.chain.iconUrl} />
              <span>{projectData.info.chain.name}</span>
            </div>
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:gap-5">
            <div className="flex items-center gap-2 pr-5 md:border-r-[1px] md:border-r-fg-gray-line">
              <span className="text-fg-primary text-opacity-50">{t("origin")}</span>
              <span>{projectData.info.origin}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-fg-primary text-opacity-50">{t("sector")}</span>
              <span>{projectData.info.sector}</span>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 lg:max-w-[760px]">
          <h4 className="text-sm font-normal">{t("deal_curated_by")}</h4>
          <div className="w-full rounded-lg bg-gradient-to-r from-brand-primary/50 to-brand-secondary/15 p-[1px]">
            <div className="flex h-full w-full flex-col items-start justify-between gap-4 rounded-[7px] bg-gradient-to-br from-brand-dimmed-1 via-brand-dimmed-2 via-50% to-brand-dimmed-2 px-4 py-3 lg:flex-row lg:items-center lg:bg-gradient-to-r">
              <div className="flex items-center gap-4">
                <Img src={projectData.info.curator.avatarUrl} size="10" isFetchingLink={isLoading} />
                <div className="flex flex-col">
                  <span className="text-base">{projectData.info.curator.fullName}</span>
                  <span className="text-sm opacity-50">{projectData.info.curator.position}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {projectData.info.curator.socials.map((social) => (
                  <ExternalLink key={social.iconType} externalLink={social} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <hr className="w-full max-w-[calc(100vw-32px)] border-bd-primary lg:max-w-[760px]"></hr>

      <TokenGenerationSection expandedTimeline={expandedTimeline} />

      <Timeline timelineEvents={projectData.info.timeline} />
      <ScrollRestoration />

      {import.meta.env.VITE_ENVIRONMENT_TYPE === "develop" && <ProjectTester2 />}
    </main>
  )
}

export default Project
