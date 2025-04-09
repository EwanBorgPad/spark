import { ReactNode, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { EligibilityStatus, QuestWithCompletion, TierType, TierWithCompletion } from "shared/eligibilityModel"
import EnterReferralCode from "./EnterReferralCode"
import { twMerge } from "tailwind-merge"
import { Icon } from "../Icon/Icon"
import { useWalletContext } from "@/hooks/useWalletContext"
import { Button } from "../Button/Button"
import { getSignInWithTwitterUrl } from "@/hooks/useTwitterContext"
import { ExternalLink } from "../Button/ExternalLink"
import AcceptTermsOfUseModal from "../Modal/Modals/AcceptTermsOfUseModal"
import { ProvideInvestmentIntentModal } from "../Modal/Modals/ProvideInvestmentIntentModal"
import ProvideEmailModal from "../Modal/Modals/ProvideEmailModal"

import { ProjectModel } from "shared/models"
import { formatDateForTimer } from "@/utils/date-helpers"
import { useParams } from "react-router-dom"

type QuestComponentProps = {
  quest: QuestWithCompletion
  autoCheck?: boolean
  isCompliance?: boolean
}
export const QuestComponent = ({ quest, autoCheck, isCompliance }: QuestComponentProps) => {
  const { isWalletConnected } = useWalletContext()
  const { t } = useTranslation()

  const { type } = quest
  const isCompleted = autoCheck || quest.isCompleted

  const typeData = ((): {
    label: string
    description: string
    additionalElement?: ReactNode
  } | null => {
    if (type === "ACCEPT_TERMS_OF_USE")
      return {
        label: t("accept.terms.of.use.quest.heading"),
        description: "",
        additionalElement: <AcceptTermsOfUseBtn />,
      }
    if (type === "PROVIDE_INVESTMENT_INTENT")
      return {
        label: t("investment.intent.quest.heading"),
        description: "",
        additionalElement: <ProvideInvestmentIntentBtn />,
      }
    if (type === "PROVIDE_EMAIL")
      return {
        label: t("email.provide.heading"),
        description: "",
        additionalElement: <ProvideEmailBtn />,
      }

    if (type === "FOLLOW_ON_TWITTER")
      return {
        label: t("follow.NAME.on.twitter", { name: quest.twitterLabel }),
        description: "",
        additionalElement: <FollowOnTwitterBtn />,
      }
    if (type === "HOLD_TOKEN")
      return {
        label: t("hold.AMOUNT.NAME.in.your.wallet", {
          amount: quest.tokenAmount,
          name: quest.tokenName,
        }),
        description: "",
        // TODO @productionPush
        additionalElement: <HoldTokenBtn tokenName={quest.tokenName} tokenMintAddress={quest.tokenMintAddress} />,
      }
    if (type === "WHITELIST")
      return {
        label: "Be a Superteam Member",
        description: "",
        // TODO @productionPush
        // additionalElement: <HoldTokenBtn tokenName={quest.tokenName} />,
      }
    if (type === "REFERRAL")
      return {
        label: "Were you referred by someone? (optional)",
        description: "Let us know who sent you to help us recognize community contributors",
        // TODO @productionPush
        additionalElement: <EnterReferralCode />,
      }

    // we are not displaying anything for this type; non-eligibility message will take care of UX
    if (type === "ALL_LISTED_COMPLIANCES") return null
    else throw new Error("Unknown type")
  })()

  if (!typeData) return <></>

  const isRequired = isCompliance && !quest?.isOptional

  return (
    <div
      className={twMerge(
        "flex w-full flex-col justify-start gap-1 rounded-lg border border-bd-primary border-opacity-60 bg-secondary p-4 text-sm",
      )}
    >
      <div className="flex w-full items-center justify-between">
        <span className={twMerge("font-medium", isCompleted && "opacity-50")}>
          {typeData.label}
          {isRequired && " (Required)"}
        </span>
        <Icon
          icon={isCompleted ? "SvgRoundCheckmark" : "SvgEmptyCircle"}
          className={twMerge("text-xl", isCompleted ? "text-fg-success-primary" : "")}
        />
      </div>
      {typeData.description && <span className="pr-7 font-normal opacity-50">{typeData.description}</span>}
      {!isCompleted && isWalletConnected && typeData.additionalElement}
    </div>
  )
}
type HoldTokenBtnProps = {
  tokenName: string
  tokenMintAddress: string
}
const HoldTokenBtn = ({ tokenName, tokenMintAddress }: HoldTokenBtnProps) => {
  const { t } = useTranslation()

  const swapLink = `https://jup.ag/swap/SOL-${tokenMintAddress}`

  return (
    <div className="mt-2 flex justify-start">
      <a href={swapLink} target="_blank" rel="noopener noreferrer">
        <Button color="secondary" size="xs" className="rounded-lg px-3">
          {t("buy")} {tokenName}
        </Button>
      </a>
    </div>
  )
}

const FollowOnTwitterBtn = () => {
  const { address } = useWalletContext()
  // TODO see if we can separate somehow the sign-in and follow actions on the ui/ux
  const signInWithTwitterUrl = useMemo(
    () => getSignInWithTwitterUrl(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [address],
  )
  return (
    <div className="mt-2 flex justify-start">
      <ExternalLink
        externalLink={{
          label: "Follow Us",
          url: signInWithTwitterUrl,
          iconType: "X_TWITTER",
        }}
        className="gap-1 rounded-lg"
        iconClassName="opacity-50"
      />
    </div>
  )
}

const AcceptTermsOfUseBtn = () => {
  const [showModal, setShowModal] = useState(false)
  const { t } = useTranslation()

  return (
    <div className="mt-2 flex justify-start">
      <Button color="secondary" size="xs" className="rounded-lg px-3" onClick={() => setShowModal(!showModal)}>
        {t("accept.terms.of.use.quest.button")}
      </Button>
      {showModal && <AcceptTermsOfUseModal onClose={() => setShowModal(false)} />}
    </div>
  )
}

const ProvideInvestmentIntentBtn = () => {
  const { t } = useTranslation()
  const [showModal, setShowModal] = useState(false)
  const { address } = useWalletContext()
  const { projectId } = useParams()

  return (
    <div className="mt-2 flex justify-start">
      <Button
        color="secondary"
        size="xs"
        className="plausible-event-name=2-ProvideInvestmentIntent rounded-lg px-3"
        onClick={() => {
          window.safary?.track({
            eventType: "investment-intent",
            eventName: "2-provide investment intent",
            parameters: {
              walletAddress: address as string,
              toProject: projectId as string,
            },
          })
          setShowModal(!showModal)
        }}
      >
        {t("investment.intent.quest.button")}
      </Button>
      {showModal && <ProvideInvestmentIntentModal onClose={() => setShowModal(false)} />}
    </div>
  )
}

const ProvideEmailBtn = () => {
  const { t } = useTranslation()
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="mt-2 flex justify-start">
      <Button color="secondary" size="xs" className="rounded-lg px-3" onClick={() => setShowModal(!showModal)}>
        {t("email.provide.button")}
      </Button>
      {showModal && <ProvideEmailModal onClose={() => setShowModal(false)} />}
    </div>
  )
}

export function sortByCompletionStatus<T extends { isCompleted: boolean }>(arr: T[]): T[] {
  return [...arr].sort((a, b) => {
    // Sort completed first and uncompleted last
    if (a.isCompleted === b.isCompleted) {
      return 0 // Preserve original order when both are the same
    }
    return a.isCompleted ? -1 : 1 // Completed comes first
  })
}

export const TierWrapper = ({
  children,
  tier,
  isCompliant,
  tierWithCompletion,
}: {
  children: ReactNode
  tier: ProjectModel["info"]["tiers"][number]
  tierWithCompletion: TierWithCompletion | null
  isCompliant?: boolean
}) => {
  const { isWalletConnected } = useWalletContext()
  const { t } = useTranslation()

  const getDescription = (
    tier: Pick<ProjectModel["info"]["tiers"][number], "id" | "label" | "description" | "benefits">,
  ) => {
    const startTimeDescription = tier.benefits.startDate
      ? t("access.to.sale.at.TIME", { time: formatDateForTimer(tier.benefits.startDate) })
      : ""
    const investmentCapDescription = tier.benefits.maxInvestment
      ? t("max.investment.MAX", { max: tier.benefits.maxInvestment })
      : ""

    return startTimeDescription + investmentCapDescription
  }
  const description = getDescription(tier)

  const getNotEligibleMessage = () => {
    if (!isWalletConnected) return ""
    const allCompliancesQuest = tier.quests.find((quest) => quest.type === "ALL_LISTED_COMPLIANCES")
    const areAllCompliancesRequired = Boolean(allCompliancesQuest)
    if (!areAllCompliancesRequired) {
      if (isCompliant) {
        return "Not Eligible"
      } else {
        // public tier
        return "Not Eligible - Accept ToU"
      }
    }
    if (!tierWithCompletion) return "Not Eligible"

    const areAllCompliancesCompleted = tierWithCompletion.quests.find((quest) => quest.isCompleted)
    if (!areAllCompliancesCompleted) return "Not Eligible - Finish Step 2"
    return "Not Eligible"
  }

  const isEligible = isCompliant && tierWithCompletion?.isCompleted

  return (
    <div
      key={tier.id}
      className={twMerge(
        "relative flex flex-col gap-2 rounded-lg border-[1px] border-bd-secondary bg-default p-4",
        isEligible && "border-bd-success-primary",
      )}
    >
      <div className="flex flex-col gap-1">
        <div className="flex w-full items-center justify-between">
          <span>{tier.label}</span>
          {isEligible ? (
            <span className="text-sm text-fg-success-primary">Eligible</span>
          ) : (
            <span className="text-sm text-fg-error-primary">{getNotEligibleMessage()}</span>
          )}
        </div>
        {description && <span className="text-xs text-fg-secondary">{description}</span>}
      </div>
      <div className="flex flex-col gap-2 rounded-2xl">
        {/* singular tier */}
        {children}
      </div>
    </div>
  )
}
