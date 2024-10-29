import { useTranslation } from "react-i18next"

import BasicTokenInfo from "@/components/TokenGenerationSection/components/BasicTokenInfo"
import { ExpandedTimelineEventType } from "@/components/Timeline/Timeline"
import WhitelistingContent from "../components/WhitelistingContent"
import CountDownTimer from "@/components/CountDownTimer"
import { TgeWrapper } from "../components/Wrapper"
import { formatDateForTimer } from "@/utils/date-helpers"
import { EligibilitySection } from "@/components/EligibilitySection/EligibilitySection.tsx"

type RegistrationOpensPhaseProps = {
  eventData: ExpandedTimelineEventType
}
/**
 * @param eventData
 * @constructor
 */
const RegistrationOpensPhase = ({ eventData }: RegistrationOpensPhaseProps) => {
  const { t } = useTranslation()

  return (
    <div className="flex w-full flex-col items-center gap-[52px]">
      <BasicTokenInfo />
      <EligibilitySection />
      <div className="flex w-full max-w-[432px] flex-col gap-5 px-4">
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
      </div>
    </div>
  )
}

export default RegistrationOpensPhase
