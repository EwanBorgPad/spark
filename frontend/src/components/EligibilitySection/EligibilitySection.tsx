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
import Text from "@/components/Text.tsx"
import SimpleLoader from "../Loaders/SimpleLoader.tsx"
import { useProjectDataContext } from "@/hooks/useProjectData.tsx"
import EnterReferralCode from "./EnterReferralCode.tsx"
import { FinalSnapshotTaken } from "@/components/EligibilitySection/FinalSnapshotTaken.tsx"

export const EligibilityTiersSection = ({ className }: { className?: string }) => {
  const { t } = useTranslation()
  const { address, walletState } = useWalletContext()
  const { projectId } = useParams()

  const { data: eligibilityStatus, isFetching } = useQuery({
    queryFn: () => {
      if (!address || !projectId) return
      return backendApi.getEligibilityStatus({ address, projectId })
    },
    queryKey: ["getEligibilityStatus", address, projectId],
    enabled: Boolean(address) && Boolean(projectId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // @TODO - replace checkup below with more reliable source of data
  if (walletState !== "CONNECTED") return null

  const eligibilityTierId = eligibilityStatus?.eligibilityTier?.id ? eligibilityStatus.eligibilityTier.id : null

  return (
    <section id="tiersSection" className={className}>
      <div id="tiersHeading" className="flex w-full items-center justify-between py-2">
        <span>{t("tiers")}</span>
        {eligibilityStatus && (
          <Badge.Confirmation
            label={eligibilityStatus.eligibilityTier?.label}
            isConfirmed={eligibilityStatus.eligibilityTier !== null}
          />
        )}
      </div>
      <div id="tiersContainer" className="rounded-lg border-[1px] border-bd-primary bg-secondary p-2">
        {!isFetching ? (
          eligibilityStatus?.tiers.map((tier) => {
            const tierQuests = sortByCompletionStatus(tier.quests)
            return (
              // tier container
              <div key={tier.id} className="flex flex-col gap-2 rounded-lg p-2">
                <span>{tier.label}</span>
                {tier.description && <span className="text-xs text-fg-secondary">{tier.description}</span>}
                <div className="flex flex-col gap-2 rounded-2xl">
                  {/* singular tier */}
                  {tierQuests.map((quest) => (
                    <QuestComponent key={quest.type} quest={quest} />
                  ))}
                </div>
              </div>
            )
          })
        ) : (
          <TierSkeletonContainer />
        )}
      </div>
      <FinalSnapshotTaken className='mt-2' />
    </section>
  )
}

export const EligibilityCompliancesSection = ({ className }: { className?: string }) => {
  const { t } = useTranslation()
  const { address, walletState } = useWalletContext()
  const { projectId } = useParams()

  const { data: eligibilityStatus, isLoading } = useQuery({
    queryFn: () => {
      if (!address || !projectId) return
      return backendApi.getEligibilityStatus({ address, projectId })
    },
    queryKey: ["getEligibilityStatus", address, projectId],
    enabled: Boolean(address) && Boolean(projectId),
  })

  // @TODO - replace checkup below with more reliable source of data
  if (walletState !== "CONNECTED") return null

  const skeletonCompliances = Array.from({ length: 2 }, (_, i) => i)
  const complianceQuests = eligibilityStatus?.compliances ? sortByCompletionStatus(eligibilityStatus.compliances) : null

  return (
    <section id="complianceSection" className={className}>
      <div id="complianceHeading" className="flex w-full items-center justify-between py-2">
        <span>{t("tge.join_launch_pool")}</span>
      </div>
      <div id="compliancesContainer" className="flex flex-col gap-2 rounded-lg">
        {!isLoading
          ? complianceQuests?.map((quest) => <QuestComponent key={quest.type} quest={quest} />)
          : skeletonCompliances.map((quest) => <Skeleton.Compliance key={quest} />)}
      </div>
    </section>
  )
}

type QuestComponentProps = {
  quest: QuestWithCompletion
  autoCheck?: boolean
}
const QuestComponent = ({ quest, autoCheck }: QuestComponentProps) => {
  const { t } = useTranslation()

  const { type } = quest
  const isCompleted = autoCheck || quest.isCompleted

  const typeData = ((): {
    label: string
    description: string
    additionalElement?: ReactNode
  } => {
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
        additionalElement: <HoldTokenBtn tokenName={quest.tokenName} />,
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
    else throw new Error("Unknown type")
  })()

  return (
    <div
      className={twMerge(
        "flex w-full flex-col justify-start gap-1 rounded-lg border-b-[1px] border-b-bd-primary bg-emphasis p-4 text-sm",
      )}
    >
      <div className="flex w-full items-center justify-between">
        <span className={twMerge("font-medium", isCompleted && "opacity-50")}>{typeData.label}</span>
        <Icon
          icon={isCompleted ? "SvgRoundCheckmark" : "SvgEmptyCircle"}
          className={twMerge("text-xl", isCompleted ? "text-fg-success-primary" : "")}
        />
      </div>
      {typeData.description && <span className="pr-7 font-normal opacity-50">{typeData.description}</span>}
      {!isCompleted && typeData.additionalElement}
    </div>
  )
}
const HoldTokenBtn = ({ tokenName }: { tokenName: string }) => {
  const { t } = useTranslation()

  const tokens = ['BORG', 'MOE']

  if (!tokens.includes(tokenName))
    return null

  const swapLink = `https://jup.ag/swap/SOL-${tokenName}`

  return (
    <div className="mt-2 flex justify-start">
      <a href={swapLink} target='_blank' rel="noopener noreferrer">
        <Button
          color="secondary"
          size="xs"
          className="rounded-lg px-3"
        >
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
        {t("investment.intent.quest.button")}
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

const ComplianceSkeleton = () => {
  return (
    <div
      className={twMerge(
        "flex w-full flex-col justify-start gap-1 rounded-lg border-b-[1px] border-b-bd-primary bg-emphasis p-4 text-sm",
      )}
    >
      <div className="flex w-full items-center justify-between gap-2">
        <Text isLoading={true} className="h-[20px] max-w-[220px]" />
        <SimpleLoader className="text-lg opacity-50" />
      </div>
      <div className="mt-2 flex w-full justify-start">
        <Button
          color="secondary"
          size="xs"
          className="w-[118px] rounded-lg px-3"
          disabled
        >
          <Text isLoading={true} />
        </Button>
      </div>
    </div>
  )
}
const TierQuestSkeleton = () => {
  return (
    <div
      className={twMerge(
        "flex w-full flex-col justify-start gap-1 rounded-lg border-b-[1px] border-b-bd-primary bg-emphasis p-4 text-sm",
      )}
    >
      <div className="flex w-full items-center justify-between gap-2">
        <Text isLoading={true} className="h-[18px] max-w-[220px]" />
        <SimpleLoader className="max-h-[20px] text-lg opacity-50" />
      </div>
    </div>
  )
}

const Skeleton = {
  Compliance: ComplianceSkeleton,
  TierQuest: TierQuestSkeleton,
}

const TierSkeletonContainer = () => {
  const { projectData, isFetching } = useProjectDataContext()

  // arbitrary number of quests before projectData is fetched
  const skeletonArray = Array.from({ length: 3 }, (_, i) => i)

  if (isFetching) {
    return (
      <>
        <div className="flex w-full flex-col gap-2 rounded-lg p-2">
          <Text isLoading className="!max-w-[240px]" />
          <div className="flex flex-col gap-2 rounded-2xl">
            {skeletonArray.map((item) => (
              <Skeleton.TierQuest key={item} />
            ))}
          </div>
        </div>
        <div className="flex w-full flex-col gap-2 rounded-lg p-2">
          <Text isLoading className="!max-w-[240px]" />
          <div className="flex flex-col gap-2 rounded-2xl">
            {skeletonArray.map((item) => (
              <Skeleton.TierQuest key={item} />
            ))}
          </div>
        </div>
      </>
    )
  }

  return projectData?.info?.tiers.map((tier) => {
    return (
      // tier container
      <div key={tier.id} className="flex flex-col gap-2 rounded-lg p-2">
        <span>{tier.label}</span>
        {tier.description && <span className="text-xs text-fg-secondary">{tier.description}</span>}
        <div className="flex flex-col gap-2 rounded-2xl">
          {/* singular tier */}
          {tier.quests.map((_, index) => (
            <Skeleton.TierQuest key={index} />
          ))}
        </div>
      </div>
    )
  })
}
