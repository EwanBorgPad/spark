import Divider from "@/components/Divider"
import { TgeWrapper } from "./Wrapper"
import CountDownTimer from "@/components/CountDownTimer"
import { ExpandedTimelineEventType } from "@/components/Timeline/Timeline"

type RewardsProps = {
  eventData: ExpandedTimelineEventType
}
const Rewards = ({ eventData }: RewardsProps) => {
  return (
    <>
      <Divider icon="SvgMedal" />
      <div className="mb-7 flex w-full flex-col items-center gap-1">
        <h2 className="text-4xl font-semibold">Rewards</h2>
        <p className="text-center text-sm opacity-60">
          Monthly payments need to be Claimed manually. Liquidity pool will
          become accessible on 12th December 2024.
        </p>
        <span className="cursor-pointer text-center text-sm underline opacity-60">
          Learn More About Reward Terms
        </span>
      </div>
      <TgeWrapper label="Monthly Payout">
        {eventData?.nextEventDate && (
          <CountDownTimer endOfEvent={eventData.nextEventDate} />
        )}
      </TgeWrapper>
    </>
  )
}

export default Rewards
