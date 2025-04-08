import { ScrollRestoration } from "react-router-dom"
import { useTranslation } from "react-i18next"

import { ExternalLink } from "../components/Button/ExternalLink"
import { useProjectDataContext } from "@/hooks/useProjectData"
import backdropImg from "@/assets/backdropImgMin.png"
import Img from "@/components/Image/Img"
import Text from "@/components/Text"
import ProjectTester2 from "@/components/QA/ProjectTester2.tsx"
import { Icon } from "@/components/Icon/Icon.tsx"
import { twMerge } from "tailwind-merge"
import { VouchYourSupport } from "@/components/EligibilitySection/JoinThePool"
import DataRoom from "@/components/LaunchPool/DataRoom"
import BasicTokenInfo from "@/components/TokenGenerationSection/components/BasicTokenInfo"
import Analysts from "@/components/Analysts/Analysts"
import DealComingFrom from "@/components/LaunchPool/DealComingFrom"

const DraftPickPage = () => {
  const { projectData, isLoading } = useProjectDataContext()
  const { t } = useTranslation()

  const isDevnet = projectData?.config.cluster === "devnet"

  return (
    <main className="z-[10] flex w-full max-w-full select-none flex-col items-center gap-10 overflow-y-hidden py-[72px] font-normal text-fg-primary lg:py-[100px]">
      <div className="max-w-screen absolute left-0 top-10 z-[-11] w-full overflow-hidden lg:top-16">
        <img src={backdropImg} className="h-[740px] min-w-[1440px] lg:h-auto lg:w-screen" />
      </div>

      <section className="flex w-full flex-col items-center gap-6 px-4">
        {/* heading */}
        <div className="flex w-full max-w-[792px] flex-col justify-between gap-6 md:flex-row md:items-end">
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
            <DataRoom />
            <div className="flex items-start gap-2">
              {projectData?.info.projectLinks.map((link, index) => (
                <ExternalLink.Icon key={index} externalLink={link} />
              ))}
              {isDevnet && !isLoading && <DevnetFlag />}
            </div>
          </div>
        </div>

        {/* Project details (chain, origin, sector) */}
        <div className="flex w-full max-w-[792px] flex-col gap-x-5 gap-y-3 text-sm md:flex-row">
          <div className="flex flex-col gap-5 md:flex-row">
            <div className="flex items-center gap-2 border-r-fg-gray-line pr-5 md:border-r-[1px]">
              <span className="text-fg-primary text-opacity-50">{t("chain")}</span>
              <Img size="4" src={projectData?.info.chain.iconUrl} isRounded />
              <Text text={projectData?.info.chain.name} isLoading={isLoading} loadingClass="max-w-[100px]" />
            </div>
            <div className="flex items-center gap-2 border-r-fg-gray-line pr-5 md:border-r-[1px]">
              <span className="text-fg-primary text-opacity-50">{t("sector")}</span>
              <Text text={projectData?.info.sector} isLoading={isLoading} />
            </div>

            <a
              href="https://t.me/Mathis_btc"
              target="_blank"
              referrerPolicy="no-referrer"
              className="group flex items-center gap-1.5"
              rel="noreferrer"
            >
              <Text text={"Apply to become a curator"} isLoading={isLoading} className="underline" />
              <Icon icon="SvgExternalLink" className="text-fg-secondary group-hover:text-fg-primary" />
            </a>
          </div>
        </div>

        <div className="flex w-full flex-col gap-4 md:max-w-[792px] md:flex-row">
          <DealComingFrom />
          <Analysts />
        </div>

        <BasicTokenInfo isDraftPick={true} />
      </section>

      <VouchYourSupport />

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


export default DraftPickPage
