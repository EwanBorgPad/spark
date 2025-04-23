import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { useWalletContext } from "@/hooks/useWalletContext.tsx"
import { backendApi } from "@/data/backendApi.ts"
import { Badge } from "../Badge/Badge"
import { twMerge } from "tailwind-merge"
import { RefObject, useRef, useEffect, useState } from "react"
import { useParams, useSearchParams, useNavigate } from "react-router-dom"
import { FinalSnapshotTaken } from "@/components/EligibilitySection/FinalSnapshotTaken.tsx"
import { QuestComponent, sortByCompletionStatus, TierWrapper } from "./Quests.tsx"
import { Skeleton, TierSkeletonContainer } from "./EligibilitySkeletons.tsx"
import { EligibilityStatus } from "shared/eligibilityModel.ts"
import { useProjectDataContext } from "@/hooks/useProjectData.tsx"
import { ConnectButton } from "../Header/ConnectButton.tsx"
import Divider from "../Divider.tsx"
import { Icon } from "../Icon/Icon.tsx"
import { SimpleModal } from "../Modal/SimpleModal"
import ProvideReferralCodeModal from "../Modal/Modals/ProvideReferralCodeModal"
import { Button } from "../Button/Button"

type Props = {
  className?: string
  parentRef: RefObject<HTMLDivElement>
}

export const JoinThePool = () => {
  const eligibilityRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { address, isWalletConnected } = useWalletContext()
  const { projectId } = useParams()
  const [showReferralModal, setShowReferralModal] = useState(false)
  const [showAlreadyUsedModal, setShowAlreadyUsedModal] = useState(false)
  const referralCodeFromUrl = searchParams.get('referral')

  // Query to check if the user already has a referral code
  const { data: eligibilityStatus } = useQuery({
    queryFn: () => {
      if (!address || !projectId) return
      return backendApi.getEligibilityStatus({ address, projectId })
    },
    queryKey: ["getEligibilityStatus", address, projectId],
    enabled: Boolean(address) && Boolean(projectId),
  })

  const removeReferralFromUrl = () => {
    if (referralCodeFromUrl) {
      const url = new URL(window.location.href)
      url.searchParams.delete('referral')
      navigate(`${url.pathname}${url.search}`, { replace: true })
    }
  }

  useEffect(() => {
    if (!referralCodeFromUrl || !isWalletConnected || !eligibilityStatus) return

    // Check if user has already provided a referral code
    const hasProvidedReferralCode = eligibilityStatus.compliances?.some(
      compliance => compliance.type === "PROVIDE_REFERRAL_CODE" && compliance.isCompleted
    )

    if (hasProvidedReferralCode) {
      setShowAlreadyUsedModal(true)
      removeReferralFromUrl()
    } else {
      setShowReferralModal(true)
    }
  }, [referralCodeFromUrl, isWalletConnected, eligibilityStatus])

  const handleReferralModalClose = () => {
    setShowReferralModal(false)
    removeReferralFromUrl()
  }

  const handleAlreadyUsedModalClose = () => {
    setShowAlreadyUsedModal(false)
    removeReferralFromUrl()
  }

  return (
    <div ref={eligibilityRef} className="flex w-full max-w-[536px] flex-col items-center gap-[36px] pt-10">
      <Divider icon="SvgTwoAvatars" />
      <div id="complianceHeading" className="flex w-full items-center justify-center py-2">
        <h2 className="-mt-5 text-2xl font-semibold leading-tight md:text-[32px]">{t("tge.join_launch_pool")}</h2>
      </div>
      <ConnectWalletStep />
      <EligibilityCompliancesSection />
      <EligibilityTiersSection parentRef={eligibilityRef} />

      {/* Modal for already used referral code */}
      {showAlreadyUsedModal && (
        <SimpleModal 
          showCloseBtn={true} 
          onClose={handleAlreadyUsedModalClose}
          title="Referral Code Already Used"
        >
          <div className="flex w-full max-w-[460px] flex-col items-center justify-center px-4 py-6 md:px-10">
            <p className="text-center text-base text-fg-tertiary mb-4">
              You have already provided a referral code for this project. Please try with another wallet if you want to use a different referral code.
            </p>
            <Button btnText="Close" onClick={handleAlreadyUsedModalClose} />
          </div>
        </SimpleModal>
      )}

      {/* Referral Modal with prefilled code */}
      {showReferralModal && (
        <ProvideReferralCodeModal 
          onClose={handleReferralModalClose} 
          initialReferralCode={referralCodeFromUrl || ""}
        />
      )}
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
      <EligibilityCompliancesSection isLastStep={true} isDraftPicks={true} />
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
          <span className="text-base md:text-lg">Step 1: Connect Wallet</span>
        </div>
        {!isWalletConnected && <ConnectButton />}
      </div>
    </div>
  )
}

const EligibilityCompliancesSection = ({
  className,
  isLastStep,
  isDraftPicks,
}: {
  className?: string
  isLastStep?: boolean
  isDraftPicks?: boolean
}) => {
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
        <span className="text-base md:text-lg">Step 2: Register</span>
        {!isLoading
          ? complianceQuests
            ? complianceQuests?.map((quest) => <QuestComponent key={quest.type} quest={quest} isCompliance />)
            : DEFAULT_COMPLIANCES.map((quest) => <QuestComponent key={quest.type} quest={quest} isCompliance />)
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
          <TierWrapper key={tier.id} tier={tier} tierWithCompletion={null}>
            {tier.quests.map((quest) => (
              <QuestComponent key={quest.type} quest={{ ...quest, ...restOfQuest }} />
            ))}
          </TierWrapper>
        )
      })
    } else {
      const isCompliant = isWalletConnected && !!eligibilityStatus?.isCompliant

      return eligibilityStatus.tiers.map((tier) => {
        const tierQuests = sortByCompletionStatus(tier.quests)

        return (
          <TierWrapper key={tier.id} tier={tier} isCompliant={isCompliant} tierWithCompletion={tier}>
            {tierQuests.map((quest) => (
              <QuestComponent key={quest.type} quest={quest} />
            ))}
          </TierWrapper>
        )
      })
    }
  }

  const isConfirmed = !!eligibilityStatus && eligibilityStatus?.eligibilityTier !== null

  return (
    <section id="tiersSection" className={twMerge("relative flex w-full items-start gap-2 md:gap-5", className)}>
      <SideElements number={3} isCompleted={isConfirmed} hasVerticalElement={false} className="mt-[-2px]" />
      <div className="flex w-full max-w-[432px] flex-col">
        <div id="tiersHeading" className="flex w-full flex-col items-start gap-3 pb-4">
          <div className="flex w-full items-center justify-between">
            <span className="text-base md:text-lg">Step 3: Whitelist for the desired tier</span>
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
        <div id="tiersContainer" className="flex flex-col gap-4">
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
    isCompleted: false,
    isOptional: true,
  },
  {
    type: "PROVIDE_EMAIL",
    isCompleted: false,
    isOptional: true,
  },
  {
    type: "PROVIDE_REFERRAL_CODE",
    isCompleted: false,
    isOptional: true,
  }
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