import { useProjectDataContext } from "@/hooks/useProjectData"
import React from "react"
import { useTranslation } from "react-i18next"
import { Icon } from "@/components/Icon/Icon"

const DataRoom = () => {
  const { t } = useTranslation()
  const {
    projectData: { info },
  } = useProjectDataContext()

  return (
    <section className="group w-full lg:max-w-[792px]">
      <a className="data-room w-full" target="_blank" rel="noreferrer" href={info.dataRoom.url}>
        {/* @TODO - background image */}
        {/* <Img
        src={info.dataRoom.backgroundImgUrl}
        size={"custom"}
        customClass="!h-[72px] !w-[100px] absolute left-0 opacity-10 rounded-none"
        showFallback={false}
      /> */}
        <div className="z-[1] flex flex-col">
          <span className="font-medium">
            {info.title} {t("data_room")}
          </span>
          <span className="font-normal opacity-50">{t("timeline.learn_more_about")}</span>
        </div>
        <Icon icon="SvgArrowRight" className="group-hover:scale-140 text-[20px] transition-transform" />
      </a>
    </section>
  )
}

export default DataRoom
