import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { useWalletContext } from "@/hooks/useWalletContext.tsx"
import { backendApi } from "@/data/backendApi.ts"
import { Badge } from "../Badge/Badge"
import { twMerge } from "tailwind-merge"
import { RefObject, useRef } from "react"
import { useParams } from "react-router-dom"
import { FinalSnapshotTaken } from "@/components/EligibilitySection/FinalSnapshotTaken.tsx"
import { QuestComponent, sortByCompletionStatus, TierWrapper } from "./Quests.tsx"
import { Skeleton, TierSkeletonContainer } from "./EligibilitySkeletons.tsx"
import { EligibilityStatus } from "shared/eligibilityModel.ts"
import { useProjectDataContext } from "@/hooks/useProjectData.tsx"
import { ConnectButton } from "../Header/ConnectButton.tsx"
import Divider from "../Divider.tsx"
import { Icon } from "../Icon/Icon.tsx"

type Props = {
  className?: string
  parentRef: RefObject<HTMLDivElement>
}

export const JoinThePool = () => {
  const eligibilityRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()

  return (
    <div ref={eligibilityRef} className="flex w-full max-w-[536px] flex-col items-center gap-[36px] pt-10">
      <Divider icon="SvgTwoAvatars" />
      <div id="complianceHeading" className="flex w-full items-center justify-center py-2">
        <h2 className="-mt-5 text-2xl font-semibold leading-tight md:text-[32px]">{t("tge.join_launch_pool")}</h2>
      </div>
      <ConnectWalletStep />
      <EligibilityCompliancesSection />
      <EligibilityTiersSection parentRef={eligibilityRef} />
    </div>
  )
}

export const VouchYourSupport = () => {
  const eligibilityRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={eligibilityRef}
      className="flex w-full max-w-[100%] flex-col items-center gap-[36px] px-4 pt-10 md:max-w-[536px] md:px-0"
    >
      <Divider icon="SvgTwoAvatars" />
      <div id="complianceHeading" className="flex w-full max-w-[400px] flex-col items-center justify-center gap-1 py-2">
        <h2 className="-mt-5 text-2xl font-semibold leading-tight md:text-[32px]">Vouch Your Support</h2>
        <h3 className="max-w-[80%] text-center text-sm font-normal text-fg-secondary opacity-90">
          Express investment interested to get whitelisted for the launch pool.{" "}
        </h3>
      </div>
      <ConnectWalletStep />
      <EligibilityCompliancesSection isLastStep={true} />
    </div>
  )
}

const ConnectWalletStep = () => {
  const { isWalletConnected } = useWalletContext()

  return (
    <div className="relative flex w-full items-start gap-2 md:gap-5">
      <SideElements number={1} isCompleted={isWalletConnected} />

      <div className="flex w-full max-w-[432px] items-center justify-between">
        <div className="flex w-full flex-col items-start">
          <span className="text-base md:text-lg">Connect Wallet</span>
        </div>
        {!isWalletConnected && <ConnectButton />}
      </div>
    </div>
  )
}

const EligibilityCompliancesSection = ({ className, isLastStep }: { className?: string; isLastStep?: boolean }) => {
  const { address, isWalletConnected } = useWalletContext()
  const { projectId } = useParams()

  const { data: eligibilityStatus, isLoading } = useQuery({
    queryFn: () => {
      if (!address || !projectId) return
      return backendApi.getEligibilityStatus({ address, projectId })
    },
    queryKey: ["getEligibilityStatus", address, projectId],
    enabled: Boolean(address) && Boolean(projectId),
    staleTime: 1000 * 60 * 60,
  })

  const skeletonCompliances = Array.from({ length: 2 }, (_, i) => i)
  const complianceQuests = eligibilityStatus?.compliances ? sortByCompletionStatus(eligibilityStatus.compliances) : null
  const isCompliant = isWalletConnected && !!eligibilityStatus?.isCompliant

  return (
    <section id="complianceSection" className={twMerge("relative flex w-full items-start gap-2 md:gap-5", className)}>
      <SideElements number={2} isCompleted={isCompliant} hasVerticalElement={!isLastStep} />

      <div id="compliancesContainer" className="flex w-full max-w-[432px] flex-col gap-2 rounded-lg">
        <span className="text-base md:text-lg">Accept ToU</span>
        {!isLoading
          ? complianceQuests
            ? complianceQuests?.map((quest) => <QuestComponent key={quest.type} quest={quest} />)
            : DEFAULT_COMPLIANCES.map((quest) => <QuestComponent key={quest.type} quest={quest} />)
          : skeletonCompliances.map((quest) => <Skeleton.Compliance key={quest} />)}
      </div>
    </section>
  )
}

const EligibilityTiersSection = ({ className, parentRef }: Props) => {
  const { address, isWalletConnected } = useWalletContext()
  const { projectId } = useParams()
  const { projectData } = useProjectDataContext()

  const { data: eligibilityStatus, isFetching } = useQuery({
    queryFn: () => {
      if (!address || !projectId) return
      return backendApi.getEligibilityStatus({ address, projectId })
    },
    queryKey: ["getEligibilityStatus", address, projectId],
    enabled: Boolean(address) && Boolean(projectId),
    staleTime: 1000 * 60 * 60,
  })

  const scrollToLaunchPool = () => {
    const top = parentRef.current?.getBoundingClientRect().top ?? 0
    window.scrollBy({
      behavior: "smooth",
      top: top - 100,
    })
  }

  const getTiers = () => {
    if (!projectData) return []
    if (!eligibilityStatus) {
      const restOfQuest = { isCompleted: false }
      return projectData.info.tiers.map((tier) => {
        // tier container
        return (
          <TierWrapper key={tier.id} tier={tier}>
            {tier.quests.map((quest) => (
              <QuestComponent key={quest.type} quest={{ ...quest, ...restOfQuest }} />
            ))}
          </TierWrapper>
        )
      })
    } else {
      return eligibilityStatus.tiers.map((tier) => {
        const tierQuests = sortByCompletionStatus(tier.quests)

        const isPublicSaleTier = !tierQuests.length && tier.id === "tier99"
        return (
          <TierWrapper key={tier.id} tier={tier}>
            {!isPublicSaleTier ? (
              tierQuests.map((quest) => <QuestComponent key={quest.type} quest={quest} />)
            ) : (
              <Icon
                icon={"SvgRoundCheckmark"}
                className={"absolute right-[24px] top-3 text-xl text-fg-success-primary"}
              />
            )}
          </TierWrapper>
        )
      })
    }
  }

  const isConfirmed = !!eligibilityStatus && eligibilityStatus?.eligibilityTier !== null

  return (
    <section id="tiersSection" className={twMerge("relative flex w-full items-start gap-2 md:gap-5", className)}>
      <SideElements number={3} isCompleted={isConfirmed} hasVerticalElement={false} className="mt-0.5" />
      <div className="flex w-full max-w-[432px] flex-col">
        <div id="tiersHeading" className="flex w-full flex-col items-start gap-3 pb-4">
          <div className="flex w-full items-center justify-between">
            <span className="text-base md:text-lg">Qualify for desired tier</span>
            {eligibilityStatus && (
              <Badge.Confirmation
                label={eligibilityStatus.eligibilityTier?.label}
                isConfirmed={eligibilityStatus.eligibilityTier !== null}
              />
            )}
          </div>
          {!eligibilityStatus?.isCompliant && isWalletConnected && (
            <div className={twMerge("text-fg-primary")}>
              <span className="text-sm ">To become eligible,</span>
              <button type="button" className="px-1 text-sm underline" onClick={scrollToLaunchPool}>
                accept Terms of Use
              </button>
              <span className="text-sm">in the above section</span>
            </div>
          )}
        </div>
        <div id="tiersContainer" className="rounded-lg border-[1px] border-bd-secondary bg-default p-2">
          {!isFetching ? getTiers() : <TierSkeletonContainer />}
        </div>
        <FinalSnapshotTaken className="mt-2" />
      </div>
    </section>
  )
}

const DEFAULT_COMPLIANCES: EligibilityStatus["compliances"] = [
  {
    type: "ACCEPT_TERMS_OF_USE",
    isCompleted: false,
  },
  {
    type: "PROVIDE_INVESTMENT_INTENT",
    isOptional: true,
    isCompleted: false,
  },
]

const SideElements = ({
  number,
  isCompleted,
  hasVerticalElement = true,
  className,
}: {
  number: number
  className?: string
  isCompleted: boolean
  hasVerticalElement?: boolean
}) => {
  return (
    <>
      <div
        className={twMerge(
          "relative mt-[-2px] flex h-8 w-[32px] min-w-[32px] items-center justify-center rounded-full bg-secondary",
          className,
        )}
      >
        {isCompleted ? (
          <Icon icon={"SvgRoundCheckmark"} className={twMerge("text-xl text-fg-success-primary")} />
        ) : (
          <span className="text-sm text-fg-secondary">{number}</span>
        )}
      </div>
      {hasVerticalElement && (
        <div className="absolute left-[15px] top-7 h-[110%] min-h-[66px] border border-secondary"></div>
      )}
    </>
  )
}