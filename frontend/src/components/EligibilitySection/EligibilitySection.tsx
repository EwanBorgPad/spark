import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { useWalletContext } from "@/hooks/useWalletContext.tsx"
import { backendApi } from "@/data/backendApi.ts"
import { Badge } from "../Badge/Badge"
import { Icon } from "../Icon/Icon"
import { twMerge } from "tailwind-merge"
import React, { useMemo, useState } from "react"
import { QuestWithCompletion } from "../../../shared/eligibilityModel.ts"
import { Button } from "@/components/Button/Button.tsx"
import NotResidingInUsModal from "@/components/Modal/Modals/NotResidingInUs.tsx"
import { getSignInWithTwitterUrl } from "@/hooks/useTwitterContext.tsx"
import { ExternalLink } from "@/components/Button/ExternalLink.tsx"
import { useParams } from "react-router-dom"

export const EligibilitySection = () => {
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

  // TODO sort compliances/tiers/quests by completion status

  return (
    <section className="flex w-full max-w-[432px] flex-col gap-4 px-4">
      {/* compliances section */}
      <section>
        <div className="flex w-full items-center justify-between py-2">
          <span>{t('compliance')}</span>
        </div>
        <div className="rounded-lg border-[1px] border-bd-primary bg-secondary">
          {/* TODO check if these need to be sorted by completion */}
          {eligibilityStatus.compliances.map((compliance, index) =>
            <QuestComponent
              key={compliance.type}
              quest={compliance}
              isLastItem={index + 1 === eligibilityStatus.compliances.length}
            />
          )}
        </div>
      </section>

      {/* tiers section */}
      <section>
        <div className="flex w-full items-center justify-between py-2">
          <span>{t('tiers')}</span>
          <Badge.Confirmation label={eligibilityStatus.eligibilityTier?.label} isConfirmed={eligibilityStatus.eligibilityTier !== null} />
        </div>
        {/* tiers container */}
        <div className="rounded-lg border-[1px] border-bd-primary bg-secondary">
          {eligibilityStatus.tiers.map(tier => (
            // tier container
            <div
              key={tier.id}
              className="flex flex-col gap-2 p-2 rounded-lg border-[1px] border-bd-primary bg-primary">
              <span>{tier.label}</span>
              <div className='flex flex-col gap-2 rounded-2xl'>
                {/* singular tier */}
                {tier.quests.map((quest, index) =>
                  <QuestComponent
                    key={quest.type}
                    quest={quest}
                    isLastItem={index + 1 === eligibilityStatus.compliances.length}
                  />,
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </section>
  )
}

type QuestComponentProps = {
  quest: QuestWithCompletion
  isLastItem: boolean
}
const QuestComponent = ({ quest, isLastItem }: QuestComponentProps) => {
  const { t } = useTranslation()

  const { type, isCompleted } = quest

  const copy = ((): { label: string, description: string } => {
    if (type === "COUNTRY_OF_RESIDENCE") return { label: t('confirm.country.of.residence'), description: '' }
    if (type === "ACCEPT_TERMS_OF_USE") return { label: t('accept.terms.of.use'), description: '' }
    if (type === "PROVIDE_INVESTMENT_INTENT") return { label: t('how.much.will.you.invest'), description: '' }

    if (type === "FOLLOW_ON_TWITTER") return { label: t('follow.NAME.on.twitter', { name: quest.twitterLabel }), description: '' }
    if (type === "HOLD_TOKEN") return { label: t('hold.AMOUNT.NAME.in.your.wallet', { amount: quest.tokenAmount, name: quest.tokenName }), description: '' }

    else throw new Error('Unknown type')
  })()

  const renderCtaButton = () => {
    if (type === "COUNTRY_OF_RESIDENCE") return <CountryOfResidenceBtn />
    if (type === "ACCEPT_TERMS_OF_USE") return <AcceptTermsOfUseBtn />
    if (type === "PROVIDE_INVESTMENT_INTENT") return <ProvideInvestmentIntentBtn />

    if (type === "FOLLOW_ON_TWITTER") return <FollowOnTwitterBtn />
    if (type === "HOLD_TOKEN") return <HoldTokenBtn tokenName={quest.tokenName} />
  }

  return (
    <div
      className={twMerge(
        "flex w-full flex-col justify-start gap-1 border-b-[1px] border-b-bd-primary rounded-l p-4 text-sm bg-emphasis",
        isLastItem && "border-none",
      )}
    >
      <div className="flex w-full items-center justify-between">
        <span className={twMerge(
          "font-medium",
          isCompleted && "opacity-50",
        )}
        >
          {copy.label}
        </span>
        <Icon icon={isCompleted ? "SvgRoundCheckmark" : "SvgCircledX"}
          className={twMerge(
            "text-xl",
            isCompleted
              ? "text-fg-success-primary"
              : "text-fg-error-primary",
          )}
        />
      </div>
      {!isCompleted && renderCtaButton()}
      {copy.description && (
        <span className="font-normal opacity-50">
          {copy.description}
        </span>
      )}
    </div>
  )
}

// TODO @eligibility implement button for each quest

const CountryOfResidenceBtn = () => {
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
        {t("whitelisting.i_dont_reside_in_us")}
      </Button>
      {showModal && (
        <NotResidingInUsModal onClose={() => setShowModal(false)} />
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
        {t("buy")} { tokenName }
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
        {t('accept.terms.of.use')}
      </Button>
      {showModal && (
        <NotResidingInUsModal onClose={() => setShowModal(false)} />
      )}
    </div>
  )
}

const ProvideInvestmentIntentBtn = () => {
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
        Provide Value
      </Button>
      {showModal && (
        <NotResidingInUsModal onClose={() => setShowModal(false)} />
      )}
    </div>
  )
}
