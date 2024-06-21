import { ExpandedTimelineEventType } from "@/components/Timeline/Timeline"
import { useTranslation } from "react-i18next"
import { TgeWrapper } from "../components/Wrapper"

type LaunchpadLiveProps = {
  eventData: ExpandedTimelineEventType
}

const LaunchpadLive = ({ eventData }: LaunchpadLiveProps) => {
  const { t } = useTranslation()
  return (
    <TgeWrapper label={t("tge.launchpad_live")}>
      <div className="flex h-[120px] w-full flex-col items-center rounded-t-xl bg-[radial-gradient(50%_65%_at_50%_0%,rgba(188,254,143,0.15)_0%,rgba(0,0,0,0.0)_100%)] pt-8">
        <span>Claim your reward now</span>
      </div>
    </TgeWrapper>
  )
}

export default LaunchpadLive
