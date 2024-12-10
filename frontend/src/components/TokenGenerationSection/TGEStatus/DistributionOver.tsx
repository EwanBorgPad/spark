import { useTranslation } from "react-i18next"
import React from "react"

import SaleOverResults from "../components/SaleOverResults"
import Divider from "@/components/Divider"
import { TgeWrapper } from "../components/Wrapper"
import { formatDateForDisplay } from "@/utils/date-helpers"
import Timeline, { ExpandedTimelineEventType } from "@/components/Timeline/Timeline"
import { useProjectDataContext } from "@/hooks/useProjectData"

type DistributionOverProps = {
  eventData: ExpandedTimelineEventType
  timeline: ExpandedTimelineEventType[]
}

const DistributionOver = ({ eventData, timeline }: DistributionOverProps) => {
  const { t } = useTranslation()
  const { projectData } = useProjectDataContext()

  const rewardDistributionDate =
    projectData?.info.timeline.find((item) => item.id === "REWARD_DISTRIBUTION")?.date || null

  return (
    <div className="flex w-full justify-center px-4">
      <div className="flex w-full max-w-[760px] flex-col items-center">
        <Timeline timelineEvents={timeline} />

        <div className="relative mt-[52px] flex w-full flex-col items-center gap-10 px-4 pb-10">
          <div className="flex w-full flex-col items-center gap-1">
            <h2 className="text-4xl font-semibold leading-11">{t("distribution_over")}</h2>
            <span className="text-sm opacity-60">{t("sale_over.thank_you")}</span>
          </div>
          <SaleOverResults />
          <div className="flex w-full max-w-[400px] flex-col items-center pt-10 opacity-40">
            <Divider icon="SvgMedal" />
            <div className="mb-7 flex w-full flex-col items-center gap-1">
              <h2 className="text-4xl font-semibold">{t("sale_over.rewards")}</h2>
              {rewardDistributionDate && (
                <p className="text-center text-sm opacity-60">{`Monthly payments need to be Claimed manually. Liquidity pool will become accessible on ${rewardDistributionDate}.`}</p>
              )}
            </div>
            <div className=" flex w-full opacity-10">
              <TgeWrapper label={"Your Monthly Payment"}>
                <div className="w-full p-4"></div>
              </TgeWrapper>
            </div>
          </div>
          <div className="absolute bottom-2.5 flex w-full flex-col items-center gap-1.5">
            <p className="w-full px-4 text-center font-medium">
              <span className="text-fg-primary">{t("distribution_over.distribution_ended")}</span>{" "}
              <span className="text-center">{eventData.date && formatDateForDisplay(eventData.date)}</span>
            </p>
            <span className="text-sm text-fg-tertiary">{t("distribution_over.contact_us")}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DistributionOver
