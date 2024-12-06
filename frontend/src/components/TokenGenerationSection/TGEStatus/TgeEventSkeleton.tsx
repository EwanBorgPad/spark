import React from "react"
import Text from "@/components/Text"
import { useProjectDataContext } from "@/hooks/useProjectData"
import { useTranslation } from "react-i18next"
import { Icon } from "@/components/Icon/Icon"
import { TgeWrapper } from "../components/Wrapper"

const TgeEventSkeleton = () => {
  const { isLoading } = useProjectDataContext()
  const { t } = useTranslation()
  return (
    <div className="flex w-full max-w-[764px] flex-col items-center gap-[52px]">
      <section className="max-w-screen flex w-full flex-col gap-[25px] px-4 lg:max-w-[792px]">
        <div className="flex w-full flex-wrap justify-between gap-6">
          <div className="flex flex-1 flex-col gap-2">
            <span className="text-sm text-fg-tertiary">{t("total_investment_interest")}</span>
            <Text as="span" className="text-base text-fg-primary" isLoading={isLoading} text={""} />
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <span className="text-sm text-fg-tertiary">TGE</span>
            <Text text={""} isLoading={isLoading} className="text-nowrap text-base text-fg-primary" />
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <span className="text-sm text-fg-tertiary">{t("fdv")}</span>
            <Text text={""} isLoading={isLoading} className="text-base text-fg-primary" />
          </div>
        </div>
      </section>

      <section className={"group w-full lg:max-w-[792px]"}>
        <a className="data-room w-full" target="_blank" rel="noreferrer" href={"#"}>
          <div className="z-[1] flex flex-col">
            <Text text={""} className="font-medium" isLoading={isLoading} />
            <span className="font-normal opacity-50">{t("timeline.learn_more_about")}</span>
          </div>
          <Icon icon="SvgArrowRight" className="group-hover:scale-140 text-[20px] transition-transform" />
        </a>
      </section>

      <section className="w-full lg:max-w-[792px]">
        <h2 className="w-full pb-3 text-left text-base">Timeline</h2>
        <div className="flex h-[116px] w-full flex-col justify-between gap-4 rounded-lg border border-bd-secondary bg-secondary/50 px-4 py-5 lg:flex-row"></div>
      </section>
      <div className="flex w-full max-w-[432px] flex-col gap-5">
        <TgeWrapper label="" isLoading>
          <div className="h-[600px]"></div>
        </TgeWrapper>
      </div>
    </div>
  )
}

export default TgeEventSkeleton
