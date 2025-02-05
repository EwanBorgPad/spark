import { useTranslation } from "react-i18next"

import BasicTokenInfo from "@/components/TokenGenerationSection/components/BasicTokenInfo"
import Timeline, { ExpandedTimelineEventType } from "@/components/Timeline/Timeline"
import WhitelistingContent from "../components/WhitelistingContent"
import CountDownTimer from "@/components/CountDownTimer"
import { TgeWrapper } from "../components/Wrapper"
import { formatDateForTimer } from "@/utils/date-helpers"
import { EligibilitySection } from "@/components/EligibilitySection/EligibilitySection.tsx"
import DataRoom from "@/components/LaunchPool/DataRoom"

type RegistrationOpensPhaseProps = {
  eventData: ExpandedTimelineEventType
  timeline: ExpandedTimelineEventType[]
}
/**
 * @param eventData
 * @constructor
 */
const RegistrationOpensPhase = ({ eventData, timeline }: RegistrationOpensPhaseProps) => {
  const { t } = useTranslation()

  return (
    <div className="flex w-full flex-col items-center px-4">
      <div className="flex w-full max-w-[764px] flex-col items-center gap-[52px]">
        <BasicTokenInfo />

        <DataRoom />

        <Timeline timelineEvents={timeline} />

        {/* main section with borg/token math */}
        <div className="flex w-full max-w-[432px] flex-col gap-5">
          <TgeWrapper label={t("tge.lp_terms")}>
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
          <a
            href="https://swissborg.com/blog/become-market-maker-with-agora-alpha"
            target="_blank"
            className="text-center text-sm font-light text-fg-secondary underline"
            rel="noreferrer"
          >
            {t("tge.learn_more_about")}
          </a>
        </div>
        <EligibilitySection />
      </div>
    </div>
  )
}

export default RegistrationOpensPhase
