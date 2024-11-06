import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { useWalletContext } from "@/hooks/useWalletContext.tsx"
import { backendApi } from "@/data/backendApi.ts"
import { Badge } from "../Badge/Badge"
import { Icon } from "../Icon/Icon"
import { twMerge } from "tailwind-merge"
import React, { ReactNode, useMemo, useState } from "react"
import { QuestWithCompletion } from "../../../shared/eligibilityModel.ts"
import { Button } from "@/components/Button/Button.tsx"
import AcceptTermsOfUseModal from "@/components/Modal/Modals/AcceptTermsOfUseModal.tsx"
import { getSignInWithTwitterUrl } from "@/hooks/useTwitterContext.tsx"
import { ExternalLink } from "@/components/Button/ExternalLink.tsx"
import { useParams } from "react-router-dom"
import ProvideInvestmentIntentModal from "@/components/Modal/Modals/ProvideInvestmentIntentModal.tsx"

export const EligibilityTiersSection = ({ className }: { className?: string }) => {
  const { t } = useTranslation()
  const { address } = useWalletContext()
  const { projectId } = useParams()

  const { data } = useQuery({
    queryFn: () => {
      if (!address || !projectId) return
      return backendApi.getEligibilityStatus({ address, projectId })
    },
    queryKey: ["getEligibilityStatus", address, projectId],
    enabled: Boolean(address) && Boolean(projectId),
  })

  const eligibilityStatus = data
  if (!eligibilityStatus) return

  const eligibilityTierId = eligibilityStatus.eligibilityTier?.id ?? null

  return <section id="tiersSection" className={className}>
    <div
      id="tiersHeading"
      className="flex w-full items-center justify-between py-2"
    >
      <span>{t("tiers")}</span>
      <Badge.Confirmation
        label={eligibilityStatus.eligibilityTier?.label}
        isConfirmed={eligibilityStatus.eligibilityTier !== null}
      />
    </div>
    <div
      id="tiersContainer"
      className="rounded-lg border-[1px] border-bd-primary bg-secondary p-2"
    >
      {eligibilityStatus.tiers.map((tier) => {
        const tierQuests = sortByCompletionStatus(tier.quests)
        return (
          // tier container
          <div key={tier.id} className="flex flex-col gap-2 rounded-lg p-2">
            <span>{tier.label}</span>
            <div className="flex flex-col gap-2 rounded-2xl">
              {/* singular tier */}
              {tierQuests.map((quest) => (
                <QuestComponent key={quest.type} quest={quest} autoCheck={tier.id === eligibilityTierId} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  </section>
}

export const EligibilityCompliancesSection = ({ className }: { className?: string }) => {
  const { t } = useTranslation()
  const { address } = useWalletContext()
  const { projectId } = useParams()

  const { data } = useQuery({
    queryFn: () => {
      if (!address || !projectId) return
      return backendApi.getEligibilityStatus({ address, projectId })
    },
    queryKey: ["getEligibilityStatus", address, projectId],
    enabled: Boolean(address) && Boolean(projectId),
  })

  const eligibilityStatus = data
  if (!eligibilityStatus) return

  const complianceQuests = sortByCompletionStatus(eligibilityStatus.compliances)

  return <section id="complianceSection" className={className}>
    <div
      id="complianceHeading"
      className="flex w-full items-center justify-between py-2"
    >
      <span>{t("legal")}</span>
    </div>
    <div
      id="compliancesContainer"
      className="flex flex-col gap-2 rounded-lg"
    >
      {complianceQuests.map((quest) => (
        <QuestComponent key={quest.type} quest={quest} />
      ))}
    </div>
  </section>
}

type QuestComponentProps = {
  quest: QuestWithCompletion
  autoCheck?: boolean
}
const QuestComponent = ({ quest, autoCheck }: QuestComponentProps) => {
  const { t } = useTranslation()

  const { type } = quest
  const isCompleted = autoCheck ?? quest.isCompleted

  const typeData = ((): {
    label: string
    description: string
    ctaButton?: ReactNode
  } => {
    if (type === "ACCEPT_TERMS_OF_USE")
      return {
        label: t("accept.terms.of.use.quest.heading"),
        description: "",
        ctaButton: <AcceptTermsOfUseBtn />,
      }
    if (type === "PROVIDE_INVESTMENT_INTENT")
      return {
        label: t("investment.intent.quest.heading"),
        description: "",
        ctaButton: <ProvideInvestmentIntentBtn />,
      }

    if (type === "FOLLOW_ON_TWITTER")
      return {
        label: t("follow.NAME.on.twitter", { name: quest.twitterLabel }),
        description: "",
        ctaButton: <FollowOnTwitterBtn />,
      }
    if (type === "HOLD_TOKEN")
      return {
        label: t("hold.AMOUNT.NAME.in.your.wallet", {
          amount: quest.tokenAmount,
          name: quest.tokenName,
        }),
        description: "",
        // TODO @productionPush
        // ctaButton: <HoldTokenBtn tokenName={quest.tokenName} />,
      }
    else throw new Error("Unknown type")
  })()

  return (
    <div
      className={twMerge(
        "flex w-full flex-col justify-start gap-1 rounded-lg border-b-[1px] border-b-bd-primary bg-emphasis p-4 text-sm",
      )}
    >
      <div className="flex w-full items-center justify-between">
        <span className={twMerge("font-medium", isCompleted && "opacity-50")}>
          {typeData.label}
        </span>
        <Icon
          icon={isCompleted ? "SvgRoundCheckmark" : "SvgCircledX"}
          className={twMerge(
            "text-xl",
            isCompleted ? "text-fg-success-primary" : "text-fg-error-primary",
          )}
        />
      </div>
      {!isCompleted && typeData.ctaButton}
      {typeData.description && (
        <span className="font-normal opacity-50">{typeData.description}</span>
      )}
    </div>
  )
}
const HoldTokenBtn = ({ tokenName }: { tokenName: string }) => {
  const { t } = useTranslation()

  return (
    <div className="mt-2 flex justify-start">
      <Button
        color="secondary"
        size="xs"
        className="rounded-lg px-3"
        onClick={() => console.log("HoldBorgInAmount")}
      >
        {t("buy")} {tokenName}
      </Button>
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
      <Button
        color="secondary"
        size="xs"
        className="rounded-lg px-3"
        onClick={() => setShowModal(!showModal)}
      >
        {t("accept.terms.of.use.quest.button")}
      </Button>
      {showModal && (
        <AcceptTermsOfUseModal onClose={() => setShowModal(false)} />
      )}
    </div>
  )
}

const ProvideInvestmentIntentBtn = () => {
  const { t } = useTranslation()
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="mt-2 flex justify-start">
      <Button
        color="secondary"
        size="xs"
        className="rounded-lg px-3"
        onClick={() => setShowModal(!showModal)}
      >
        {t('investment.intent.quest.button')}
      </Button>
      {showModal && (
        <ProvideInvestmentIntentModal onClose={() => setShowModal(false)} />
      )}
    </div>
  )
}

function sortByCompletionStatus<T extends { isCompleted: boolean }>(
  arr: T[],
): T[] {
  return [...arr].sort((a, b) => {
    // Sort completed first and uncompleted last
    if (a.isCompleted === b.isCompleted) {
      return 0 // Preserve original order when both are the same
    }
    return a.isCompleted ? -1 : 1 // Completed comes first
  })
}
