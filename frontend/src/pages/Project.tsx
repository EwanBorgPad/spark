import { ScrollRestoration } from "react-router-dom"
import { useTranslation } from "react-i18next"

import TokenGenerationSection from "../components/TokenGenerationSection/TokenGenerationSection"
import { ExternalLink } from "../components/Button/ExternalLink"
import { useProjectDataContext } from "@/hooks/useProjectData"
import { expandTimelineDataInfo } from "@/utils/timeline"
import backdropImg from "@/assets/backdropImgMin.png"
import Img from "@/components/Image/Img"
import Text from "@/components/Text"
import ProjectTester2 from "@/components/QA/ProjectTester2.tsx"
import { Icon } from "@/components/Icon/Icon.tsx"
import { twMerge } from "tailwind-merge"

const Project = () => {
  const { projectData, isLoading } = useProjectDataContext()
  const { t } = useTranslation()

  const isDevnet = projectData?.config.cluster === "devnet"

  const expandedTimeline = expandTimelineDataInfo(projectData?.info.timeline ?? [])

  return (
    <main className="z-[10] flex w-full max-w-full flex-col items-center gap-10 overflow-y-hidden py-[72px] font-normal text-fg-primary lg:py-[100px]">
      <div className="max-w-screen absolute left-0 top-10 z-[-11] w-full overflow-hidden lg:top-16">
        <img src={backdropImg} className="h-[740px] min-w-[1440px] lg:h-auto lg:w-screen" />
      </div>

      <section className="flex w-full flex-col items-center gap-10 px-4">
        {/* heading */}
        <div className="flex w-full flex-col justify-between gap-6 lg:max-w-[760px] lg:flex-row">
          {/* left side */}
          <div className="flex flex-col gap-6 lg:flex-row">
            <Img
              src={projectData?.info.logoUrl}
              isFetchingLink={isLoading}
              imgClassName="scale-[102%]"
              isRounded={true}
              size="20"
            />
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-4">
                <Text
                  text={projectData?.info.title}
                  as="h1"
                  className="font-semibold"
                  isLoading={isLoading}
                  loadingClass="max-w-[120px]"
                />
                {isDevnet && <DevnetFlag />}
              </div>

              <Text
                text={projectData?.info.subtitle}
                as="span"
                className="text-fg-primary text-opacity-75"
                isLoading={isLoading}
                loadingClass="max-w-[280px] "
              />
            </div>
          </div>
          {/* right side */}
          <div className="flex items-start gap-2">
            {projectData?.info.projectLinks.map((link, index) => <ExternalLink.Icon key={index} externalLink={link} />)}
          </div>
        </div>

        {/* Project details (chain, origin, sector) */}
        <div className="flex w-full flex-col gap-x-5 gap-y-3 text-sm md:flex-row lg:max-w-[760px]">
          <div className="flex gap-5">
            <div className="flex items-center gap-2 border-r-fg-gray-line pr-5 md:border-r-[1px]">
              <span className="text-fg-primary text-opacity-50">{t("chain")}</span>
              <Img size="4" src={projectData?.info.chain.iconUrl} isRounded />
              <Text text={projectData?.info.chain.name} isLoading={isLoading} loadingClass="max-w-[100px]" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-fg-primary text-opacity-50">{t("sector")}</span>
              <Text text={projectData?.info.sector} isLoading={isLoading} />
            </div>
          </div>
          <div className="flex flex-col md:flex-row">
            {projectData?.info.tokenContractUrl && (
              <a
                href={projectData.info.tokenContractUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 border-r-[1px] px-5 md:border-l-[1px] md:border-x-fg-gray-line"
              >
                <Img size="4" src={projectData?.info.logoUrl} isRounded />
                <Text text={`$${projectData.config.launchedTokenData.ticker}`} isLoading={isLoading} />
                <Icon icon="SvgExternalLink" className="opacity-50 transition-opacity group-hover:opacity-100" />
              </a>
            )}
            {projectData?.info.poolContractUrl && (
              <a
                href={projectData.info.poolContractUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 px-5  md:border-r-fg-gray-line"
              >
                <Img size="4" src={projectData?.info.logoUrl} isRounded />
                <Text text={`$${projectData.config.launchedTokenData.ticker}/BORG`} isLoading={isLoading} />
                <Icon icon="SvgExternalLink" className="opacity-50 transition-opacity group-hover:opacity-100" />
              </a>
            )}
          </div>
        </div>

        {/* Deal curated by: */}
        <div className="flex w-full flex-col gap-3 lg:max-w-[760px]">
          <h4 className="text-sm font-normal">{t("deal_curated_by")}</h4>
          <div className="w-full rounded-lg bg-gradient-to-r from-brand-primary/50 to-brand-secondary/15 p-[1px]">
            <div className="flex h-full w-full flex-col items-start justify-between gap-4 rounded-[7px] bg-gradient-to-br from-brand-dimmed-1 via-brand-dimmed-2 via-50% to-brand-dimmed-2 px-4 py-3 lg:flex-row lg:items-center lg:bg-gradient-to-r">
              <div className="flex items-center gap-4">
                <Img src={projectData?.info.curator.avatarUrl} size="10" isFetchingLink={isLoading} isRounded />
                <div className="flex min-w-[120px] flex-col">
                  <Text text={projectData?.info.curator.fullName} isLoading={isLoading} />
                  <Text text={projectData?.info.curator.position} isLoading={isLoading} />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {projectData?.info.curator.socials.map((social) => (
                  <ExternalLink key={social.iconType} externalLink={social} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <hr className="w-full max-w-[calc(100vw-32px)] border-bd-primary lg:max-w-[760px]"></hr>

      {<TokenGenerationSection expandedTimeline={expandedTimeline} />}

      <ScrollRestoration />

      {import.meta.env.VITE_ENVIRONMENT_TYPE === "develop" && <ProjectTester2 />}
    </main>
  )
}

function DevnetFlag() {
  return <div className={twMerge(
    "flex items-center gap-1",
    "px-3 py-2 text-md rounded-full text-fg-alt-default bg-brand-primary",
  )}>
    <Icon className="text-black" icon={"SvgRoundCheckmark"} />
    <p>Devnet</p>
  </div>
}

export default Project
