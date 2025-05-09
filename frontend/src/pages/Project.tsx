import { ScrollRestoration } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useState } from "react"

import TokenGenerationSection from "../components/TokenGenerationSection/TokenGenerationSection"
import { ExternalLink } from "../components/Button/ExternalLink"
import { useProjectDataContext } from "@/hooks/useProjectData"
import { expandTimelineDataInfo } from "@/utils/timeline-helper"
import backdropImg from "@/assets/backdropImgMin.png"
import Img from "@/components/Image/Img"
import Text from "@/components/Text"
import ProjectTester2 from "@/components/QA/ProjectTester2.tsx"
import { Icon } from "@/components/Icon/Icon"
import { twMerge } from "tailwind-merge"
import Analysts from "@/components/Analysts/Analysts"
import DataRoom from "@/components/LaunchPool/DataRoom"
import BasicTokenInfo from "@/components/TokenGenerationSection/components/BasicTokenInfo"
import DealComingFrom from "@/components/LaunchPool/DealComingFrom"
import Referral from "@/components/LaunchPool/Referral"
import FloorStrategyModal from "@/components/Modal/Modals/FloorStrategyModal"
import { Button } from "@/components/Button/Button"

type FloorStrategyIcon = "SvgFloorStrategy" | "SvgFixedFDV" | "SvgFloatFDV"

const Project = () => {
  const { projectData, isLoading } = useProjectDataContext()
  const { t } = useTranslation()
  const [isFloorStrategyModalOpen, setIsFloorStrategyModalOpen] = useState(false)

  const isDevnet = projectData?.config.cluster === "devnet"

  const expandedTimeline = expandTimelineDataInfo(projectData?.info.timeline ?? [])
  const floorStrategy = projectData?.config.floorStrategy ?? "Float FDV"
  let iconStrategy: FloorStrategyIcon = "SvgFloorStrategy"
  let color = "text-fg-brand-primary"
  let bgColor = "bg-brand-primary"
  switch (floorStrategy) {
    case "Floor Strategy":
      iconStrategy = "SvgFloorStrategy"
      color = "text-fg-floor-strategy"
      bgColor = "text-fg-floor-strategy"
      break
    case "Fixed FDV":
      iconStrategy = "SvgFixedFDV"
      color = "text-fg-fixed-fdv"
      bgColor = "text-fg-floor-strategy"
      break
    case "Float FDV":
      iconStrategy = "SvgFloatFDV"
      color = "text-fg-float-fdv"
      bgColor = "text-fg-floor-strategy"
      break
    default:
      iconStrategy = "SvgFloorStrategy"
  }

  return (
    <main className="z-[10] flex w-full max-w-full select-none flex-col items-center gap-4 overflow-y-hidden py-[72px] font-normal text-fg-primary md:py-[100px]">
      <div className="max-w-screen absolute left-0 top-10 z-[-11] w-full overflow-hidden md:top-16">
        <img src={backdropImg} className="h-[740px] min-w-[1440px] md:h-auto md:w-screen" />
      </div>

      <section className="flex w-full flex-col items-center gap-4 px-4">
        {/* heading */}
        <div className="flex w-full flex-col justify-between gap-6 md:max-w-[792px] md:flex-row md:items-end">
          {/* left side */}
          <div className="flex flex-col gap-3">
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
          <div className="relative flex flex-col items-start gap-3 md:items-end">
            {projectData?.config.referralDistribution && <Referral />}
            <DataRoom />
            <div className="flex items-start gap-2">
              {projectData?.info.projectLinks.map((link, index) => (
                <ExternalLink.Icon key={index} externalLink={link} />
              ))}
              {isDevnet && !isLoading && <DevnetFlag />}
            </div>
          </div>
        </div>

        {/* Project details (floor strategy, chain, origin, sector) */}
        <div className="flex w-full flex-wrap gap-4 text-sm md:max-w-[792px]">
          <div className="flex flex-wrap gap-4 [&>*:not(:last-child)]:border-r [&>*:not(:last-child)]:border-fg-primary/40 [&>*:not(:last-child)]:pr-4 [&>*]:h-5">
            {floorStrategy !== "Not set" && (
              <div className="flex items-center gap-1">
                <Icon icon={iconStrategy} className={`h-6 w-6 ${color}`} />
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setIsFloorStrategyModalOpen(true)}
                    color="plain"
                    className={`${bgColor} bg-opacity-30 hover:bg-opacity-50 flex items-center gap-2 whitespace-nowrap`}
                  >
                    <Text 
                      text={floorStrategy} 
                      isLoading={isLoading} 
                      loadingClass="max-w-[100px]"
                      className={`${color} whitespace-nowrap`}
                    />
                    <Icon icon="SvgQuestionCircle" className="h-4 w-4 text-fg-secondary" />
                  </Button>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-fg-primary text-opacity-50">{t("chain")}</span>
              <Img size="4" src={projectData?.info.chain.iconUrl} isRounded />
              <Text text={projectData?.info.chain.name} isLoading={isLoading} loadingClass="max-w-[100px]" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-fg-primary text-opacity-50">{t("sector")}</span>
              <Text text={projectData?.info.sector} isLoading={isLoading} />
            </div>
          </div>
          {projectData?.info.tokenContractUrl && projectData?.info.poolContractUrl && (
            <div className="flex flex-wrap gap-4 [&>*:not(:last-child)]:border-r [&>*:not(:last-child)]:border-fg-primary/40 [&>*:not(:last-child)]:pr-4 [&>*]:h-5">
              {projectData?.info.tokenContractUrl && (
                <a
                  href={projectData.info.tokenContractUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2"
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
                  className="group flex items-center gap-2"
                >
                  <Img size="4" src={projectData?.info.logoUrl} isRounded />
                  <Text text={`$${projectData.config.launchedTokenData.ticker}/BORG`} isLoading={isLoading} />
                  <Icon icon="SvgExternalLink" className="opacity-50 transition-opacity group-hover:opacity-100" />
                </a>
              )}
            </div>
          )}
        </div>

        <div className="flex w-full flex-col gap-4 md:max-w-[792px] md:flex-row">
          <DealComingFrom />
          <Analysts />
        </div>

        <BasicTokenInfo isDraftPick={false} />
      </section>

      <TokenGenerationSection expandedTimeline={expandedTimeline} />

      <FloorStrategyModal 
        isOpen={isFloorStrategyModalOpen}
        onClose={() => setIsFloorStrategyModalOpen(false)}
      />
      
      <ScrollRestoration />

      {import.meta.env.VITE_ENVIRONMENT_TYPE === "develop" && <ProjectTester2 />}

    </main>
  )
}

function DevnetFlag() {
  return (
    <div
      className={twMerge(
        "absolute right-0 top-0 flex items-center gap-1 md:top-[-48px]",
        "text-md rounded-full bg-brand-primary px-3 py-2 text-fg-alt-default",
      )}
    >
      <Icon className="text-black" icon={"SvgRoundCheckmark"} />
      <p>Devnet</p>
    </div>
  )
}

export default Project
