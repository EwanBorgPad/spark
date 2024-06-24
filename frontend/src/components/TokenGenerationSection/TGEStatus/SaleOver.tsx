import { useTranslation } from "react-i18next"
import { Tweet } from "react-tweet"

import { ExpandedTimelineEventType } from "@/components/Timeline/Timeline"
import { ConnectButton } from "@/components/Header/ConnectButton"
import { useWalletContext } from "@/hooks/useWalletContext"
import { formatCurrencyAmount } from "@/utils/format"
import { Button } from "@/components/Button/Button"
import greenCloudImg from "@/assets/greenCloud.svg"
import { Icon } from "@/components/Icon/Icon"

// to be replaced with API calls
import { ContributionType, contributionData } from "@/data/contributionData"
import { tokenData } from "@/data/tokenData"
import { ProjectData } from "@/data/data"
import YourContribution from "../components/YourContribution"

type LiveProps = {
  eventData: ExpandedTimelineEventType
  projectData: ProjectData
}

const SaleOver = ({ eventData, projectData }: LiveProps) => {
  const { t } = useTranslation()

  const {
    totalAmountRaised,
    sellOutPercentage,
    participants,
    averageInvestedAmount,
  } = projectData.saleResults

  const { walletState } = useWalletContext()

  ////////////////////////////////////////////////////////
  // @TODO - add API for getting contribution info ///////
  ////////////////////////////////////////////////////////
  const getContributionInfo = (): ContributionType | null => {
    return contributionData
  }
  const contributionInfo = getContributionInfo()
  const userDidContribute = !!contributionInfo?.suppliedBorg.total

  /////////////////////////////////////////////////
  // @TODO - add API for getting token info ///////
  /////////////////////////////////////////////////
  const getTokenInfo = () => {
    return tokenData
  }
  const { marketCap, fdv } = getTokenInfo()

  return (
    <>
      <div className="flex w-full flex-col items-center gap-9">
        <div className="flex w-full flex-col items-center gap-1">
          <h2 className="text-4xl font-semibold leading-11">Sale Over</h2>
          <span className="text-sm opacity-60">
            Thank you for your participation
          </span>

          {/* @TODO - Add ScrollTo event when you make targeted component */}
          <Button
            color="plain"
            className="cursor-pointer py-0 text-sm underline"
            onClick={() => {}}
          >
            Check Your Rewards Here
          </Button>
        </div>

        <div className="flex w-full flex-wrap gap-x-4 gap-y-5 rounded-lg border-[1px] border-bd-primary bg-secondary px-5 py-4">
          <div className="flex min-w-[167px] flex-1 basis-[26%] flex-col gap-1">
            <span className="text-sm text-fg-tertiary">
              Total Amount Raised
            </span>
            <span className="font-geist-mono text-base leading-7 text-fg-primary">
              {formatCurrencyAmount(totalAmountRaised)}
            </span>
          </div>
          <div className="flex min-w-[167px] flex-1 basis-[26%] flex-col gap-1">
            <span className="text-sm text-fg-tertiary">
              Sell Out Percentage
            </span>
            <span className="font-geist-mono text-base leading-7 text-fg-primary">
              {sellOutPercentage}%
            </span>
          </div>
          <div className="flex min-w-[167px] flex-1 basis-[26%] flex-col gap-1">
            <span className="text-sm text-fg-tertiary">Participants</span>
            <span className="font-geist-mono text-base leading-7 text-fg-primary">
              {participants}
            </span>
          </div>
          <div className="flex min-w-[167px] flex-1 basis-[26%] flex-col gap-1">
            <span className="text-sm text-fg-tertiary">
              Average Invested Amount
            </span>
            <span className="font-geist-mono text-base leading-7 text-fg-primary">
              {formatCurrencyAmount(averageInvestedAmount)}
            </span>
          </div>
          <div className="flex min-w-[167px] flex-1 basis-[26%] flex-col gap-1">
            <span className="text-sm text-fg-tertiary">Market Cap</span>
            <span className="font-geist-mono text-base leading-7 text-fg-primary">
              {formatCurrencyAmount(marketCap)}
            </span>
          </div>
          <div className="flex min-w-[167px] flex-1 basis-[26%] flex-col gap-1">
            <span className="text-sm text-fg-tertiary">FDV</span>
            <span className="font-geist-mono text-base leading-7 text-fg-primary">
              {formatCurrencyAmount(fdv)}
            </span>
          </div>
        </div>

        <div className="w-full max-w-[400px]">
          <Tweet id="1801629344848089180" />
        </div>
      </div>

      <div className="flex w-full flex-col items-center gap-9">
        <div className="relative flex w-full max-w-[400px] items-center">
          <img
            src={greenCloudImg}
            className="absolute h-[96px] w-full opacity-50"
          ></img>
          <div className="contribution-gradient h-[1px] flex-1 rotate-180"></div>
          <Icon
            icon="SvgHandWithWallet"
            className="mx-4 h-5 w-5 text-fg-brand-primary"
          />
          <div className="contribution-gradient h-[1px] flex-1"></div>
        </div>
        <h3 className="text-[32px] font-semibold leading-tight">
          Your Contribution
        </h3>
        {walletState !== "CONNECTED" ? (
          <ConnectButton
            customBtnText={"Connect Wallet to See Contribution"}
            btnClassName="py-3 px-4 w-full max-w-[400px] text-base"
          />
        ) : userDidContribute ? (
          <YourContribution contributionInfo={contributionInfo} />
        ) : (
          <div className="w-full max-w-[400px] rounded-lg border border-bd-primary bg-secondary px-4 py-3 text-sm opacity-60">
            The wallet you connected didn’t contribute to this pool.
          </div>
        )}
      </div>

      {/* <TgeWrapper label={t("tge.sale_finished")}>
        {eventData?.nextEventDate && (
          <CountDownTimer endOfEvent={eventData.nextEventDate} />
        )}
      </TgeWrapper> */}
    </>
  )
}

export default SaleOver
