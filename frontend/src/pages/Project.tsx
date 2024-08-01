import { ScrollRestoration } from "react-router-dom"
import { useTranslation } from "react-i18next"

import TokenGenerationSection from "../components/TokenGenerationSection/TokenGenerationSection"
import { ExternalLink } from "../components/Button/ExternalLink"
import { useProjectDataContext } from "@/hooks/useProjectData"
import { formatDateForDisplay } from "../utils/date-helpers"
import ProjectTester from "@/components/QA/ProjectTester"
import { expandTimelineDataInfo } from "@/utils/timeline"
import Timeline from "@/components/Timeline/Timeline"
import Avatar from "../components/Avatar/Avatar"
import { Icon } from "../components/Icon/Icon"

const Project = () => {
  const { projectData } = useProjectDataContext()
  const { t } = useTranslation()

  const expandedTimeline = expandTimelineDataInfo(projectData.timeline)

  return (
    <main className="z-[10] flex w-full max-w-full flex-col items-center gap-10 overflow-y-hidden py-[72px] font-normal text-fg-primary lg:py-[100px]">
      <section className="flex w-full flex-col justify-between gap-6 px-4 lg:max-w-[792px] lg:flex-row">
        <div className="flex flex-col gap-6 lg:flex-row">
          <Avatar imgUrl={projectData.logoUrl} size="large" />
          <div className="flex flex-col gap-1">
            <h1 className="font-semibold">{projectData.title}</h1>
            <span className="text-fg-primary text-opacity-75">
              {projectData.subtitle}
            </span>
          </div>
        </div>
        <div className="flex items-start gap-2">
          {projectData.projectLinks.map((link, index) => (
            <ExternalLink.Icon key={index} externalLink={link} />
          ))}
        </div>
      </section>

      <section className="flex w-full flex-wrap gap-x-5 gap-y-3 px-4 text-sm lg:max-w-[792px]">
        <div className="flex gap-5">
          <div className="flex items-center gap-2 border-r-[1px] border-r-fg-gray-line pr-5">
            <span className="text-fg-primary text-opacity-50">
              {t("chain")}
            </span>
            <img className="h-4 w-4" src={projectData.chain.iconUrl} />
            <span>{projectData.chain.name}</span>
          </div>
        </div>
        <div className="flex gap-5">
          <div className="flex items-center gap-2 border-r-[1px] border-r-fg-gray-line pr-5">
            <span className="text-fg-primary text-opacity-50">
              {t("origin")}
            </span>
            <span>{projectData.origin}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-fg-primary text-opacity-50">
              {t("sector")}
            </span>
            <span>{projectData.sector}</span>
          </div>
        </div>
      </section>

      <section className="flex w-full flex-col gap-3 px-4 lg:max-w-[792px]">
        <h4 className="text-sm font-normal">{t("deal_curated_by")}</h4>
        <div className="w-full rounded-lg bg-gradient-to-r from-brand-primary/50 to-brand-secondary/15 p-[1px]">
          <div className="flex h-full w-full flex-col items-start justify-between gap-4 rounded-[7px] bg-gradient-to-br from-brand-dimmed-1 via-brand-dimmed-2 via-50% to-brand-dimmed-2 px-4 py-3 lg:flex-row lg:items-center lg:bg-gradient-to-r">
            <div className="flex items-center gap-4">
              <Avatar imgUrl={projectData.curator.avatarUrl} size="medium" />
              <div className="flex flex-col">
                <span className="text-base">
                  {projectData.curator.fullName}
                </span>
                <span className="text-sm opacity-50">
                  {projectData.curator.position}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {projectData.curator.socials.map((social) => (
                <ExternalLink key={social.iconType} externalLink={social} />
              ))}
            </div>
          </div>
        </div>
      </section>
      <hr className="w-full max-w-[calc(100vw-32px)] border-bd-primary lg:max-w-[782px]"></hr>

      <TokenGenerationSection expandedTimeline={expandedTimeline} />

      <section className="group w-full px-4 lg:max-w-[792px]">
        <a
          className="data-room w-full"
          target="_blank"
          rel="noreferrer"
          href={projectData.dataRoom.url}
        >
          <img
            src={projectData.dataRoom.backgroundImgUrl}
            className="absolute left-0 h-[72px] w-[100px] opacity-5"
          />
          <div className="z-[1] flex flex-col">
            <span className="font-medium">
              {projectData.title} {t("data_room")}
            </span>
            <span className="font-normal opacity-50">
              {t("timeline.learn_more_about")}
            </span>
          </div>
          <Icon
            icon="SvgArrowRight"
            className="group-hover:scale-140 text-[20px] transition-transform"
          />
        </a>
      </section>

      <Timeline timelineEvents={projectData.timeline} />
      <ScrollRestoration />

      {import.meta.env.VITE_ENVIRONMENT_TYPE === "develop" && <ProjectTester />}
    </main>
  )
}

export default Project
