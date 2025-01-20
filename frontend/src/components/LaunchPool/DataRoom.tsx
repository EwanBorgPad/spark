import { useProjectDataContext } from "@/hooks/useProjectData"
import React from "react"
import { useTranslation } from "react-i18next"
import { Icon } from "@/components/Icon/Icon"
import { twMerge } from "tailwind-merge"
import Text from "@/components/Text"

type Props = {
  className?: string
}

const DataRoom = ({ className }: Props) => {
  const { t } = useTranslation()
  const { projectData, isLoading } = useProjectDataContext()
  const info = projectData?.info

  return (
    <section className={twMerge("group w-full lg:max-w-[792px]", className)}>
      <a className="data-room w-full" target="_blank" rel="noreferrer" href={info?.dataRoom.url}>
        <div className="z-[1] flex flex-col">
          <Text text={`${info?.title} ${t("data_room")}`} className="font-medium" isLoading={isLoading} />
          <span className="font-normal opacity-50">{t("timeline.learn_more_about")}</span>
        </div>
        <Icon icon="SvgArrowRight" className="group-hover:scale-140 text-[20px] transition-transform" />
      </a>
    </section>
  )
}

export default DataRoom
