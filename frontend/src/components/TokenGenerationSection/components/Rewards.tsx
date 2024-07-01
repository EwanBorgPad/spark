import Divider from "@/components/Divider"
import { TgeWrapper } from "./Wrapper"
import CountDownTimer from "@/components/CountDownTimer"
import { ExpandedTimelineEventType } from "@/components/Timeline/Timeline"
import { useTranslation } from "react-i18next"

type RewardsProps = {
  eventData: ExpandedTimelineEventType
}
const Rewards = ({ eventData }: RewardsProps) => {
  const { t } = useTranslation()
  return (
    <>
      <Divider icon="SvgMedal" />
      <div className="mb-7 flex w-full flex-col items-center gap-1">
        <h2 className="text-4xl font-semibold">{t("sale_over.rewards")}</h2>
        <p className="text-center text-sm opacity-60">
          {t("sale_over.monthly_payments_need_to")}
        </p>
        <span className="cursor-pointer text-center text-sm underline opacity-60">
          {t("sale_over.learn_more_about")}
        </span>
      </div>
      <TgeWrapper label={t("sale_over.monthly_payout")}>
        {eventData?.nextEventDate && (
          <CountDownTimer endOfEvent={eventData.nextEventDate} />
        )}
      </TgeWrapper>
    </>
  )
}

export default Rewards
