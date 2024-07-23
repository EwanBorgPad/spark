import { useTranslation } from "react-i18next"

import MarketAndTokensData from "@/components/TokenGenerationSection/components/MarketAndTokensData"
import { ExpandedTimelineEventType } from "@/components/Timeline/Timeline"
import WhitelistingContent from "../components/WhitelistingContent"
import CountDownTimer from "@/components/CountDownTimer"
import { TgeWrapper } from "../components/Wrapper"
import WhitelistStatus from "../WhitelistStatus"
import { formatDateForTimer } from "@/utils/date-helpers"
import { useProjectDataContext } from "@/hooks/useProjectData.tsx"

type WhitelistingProps = {
  eventData: ExpandedTimelineEventType
}

const Whitelisting = ({ eventData }: WhitelistingProps) => {
  const { t } = useTranslation()

  return (
    <div className="flex w-full flex-col items-center gap-[52px] px-4">
      <MarketAndTokensData />
      <div className="flex w-full max-w-[400px] flex-col gap-5">
        <TgeWrapper label={t("tge.whitelisting")}>
          {eventData?.nextEventDate && (
            <>
              <CountDownTimer
                endOfEvent={eventData.nextEventDate}
                labelAboveTimer={`Going live on ${formatDateForTimer(eventData.nextEventDate)}`}
              />
            </>
          )}
          <WhitelistingContent />
        </TgeWrapper>
        <WhitelistStatus />
      </div>
    </div>
  )
}

export default Whitelisting
