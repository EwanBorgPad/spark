import React from "react"
import Img from "../Image/Img"
import { ProjectModel } from "shared/models"
import { useTranslation } from "react-i18next"
import Text from "@/components/Text"
import { expandTimelineDataInfo } from "@/utils/timeline"
import { getCurrentTgeEvent } from "@/utils/getCurrentTgeEvent"
import { Button } from "../Button/Button"
import { Link } from "react-router-dom"
import { formatDateMonthDateHours } from "@/utils/date-helpers"

const LaunchPoolCard = ({ project }: { project: ProjectModel }) => {
  const { t } = useTranslation()
  const expandedTimeline = expandTimelineDataInfo(project.info.timeline)
  const tgeEvent = getCurrentTgeEvent(expandedTimeline)

  const getLearnMoreMessage = () => {
    switch (tgeEvent.id) {
      case "INACTIVE":
        return `Whitelisting opens ${formatDateMonthDateHours(tgeEvent.nextEventDate)}`
      case "REGISTRATION_OPENS":
        return `Whitelisting closes ${formatDateMonthDateHours(tgeEvent.nextEventDate)}`
      case "SALE_OPENS":
        return `Sale Closes ${formatDateMonthDateHours(tgeEvent.nextEventDate)}`
      case "SALE_CLOSES":
        return `Reward Distribution starts ${formatDateMonthDateHours(tgeEvent.nextEventDate)}`
      case "REWARD_DISTRIBUTION":
        return `Reward Distribution ends ${formatDateMonthDateHours(tgeEvent.nextEventDate)}`
      case "DISTRIBUTION_OVER":
        return `Reward distribution ended ${tgeEvent.date}`
    }
  }

  return (
    <li className="flex w-full max-w-[344px] flex-col overflow-hidden rounded-lg border-bd-primary bg-secondary">
      <Img
        src={project.info?.logoUrl}
        customClass="h-[189px] rounded-none"
        showFallback
      />
      <div className="flex w-full flex-1 grow flex-col justify-between gap-4 p-4">
        <div className="flex w-full flex-col gap-4">
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <div className="flex items-center gap-2 border-r-[1px] border-r-fg-gray-line pr-5">
              <span className="text-fg-primary text-opacity-50">
                {t("chain")}
              </span>
              <Img size="4" src={project.info?.chain.iconUrl} />
              <span className="text-nowrap">{project.info?.chain.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-fg-primary text-opacity-50">
                {t("sector")}
              </span>
              <span className="text-nowrap">{project.info?.sector}</span>
            </div>
          </div>
          <div className="flex w-full flex-col gap-1">
            <Text
              text={project.info?.title}
              as="span"
              className="text-2xl font-semibold"
              isLoading={false}
            />
            <Text
              text={project.info?.subtitle}
              as="p"
              className="line-clamp-2 h-[48px] text-base text-fg-tertiary"
              isLoading={false}
            />
          </div>
        </div>

        <div className="flex w-full flex-col rounded-xl bg-default">
          <span className="px-4 py-2 text-sm leading-5 text-fg-tertiary">
            {getLearnMoreMessage()}
          </span>
          <Link to={`/launch-pools/${project.info.id}`}>
            <Button btnText="Learn More" className="w-full p-3" />
          </Link>
        </div>
      </div>
    </li>
  )
}

export default LaunchPoolCard
