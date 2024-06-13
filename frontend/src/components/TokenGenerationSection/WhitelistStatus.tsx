import { useTranslation } from "react-i18next"
import { twMerge } from "tailwind-merge"

import { WhitelistStatusType } from "@/data/whitelistingData"
import { ExternalLink } from "../Button/ExternalLink"
import { Badge } from "../Badge/Badge"
import { Icon } from "../Icon/Icon"

type Props = {
  isUserWhitelisted: boolean
  whitelistStatus: WhitelistStatusType
}

const WhitelistStatus = ({ isUserWhitelisted, whitelistStatus }: Props) => {
  const { t } = useTranslation()

  const numberOfRequirements = whitelistStatus.requirements.length

  return (
    <div className="mt-5 flex w-full flex-col gap-4">
      <div className="flex w-full items-center justify-between">
        <span>{t("tge.whitelist_status")}</span>
        <Badge.Eligibility isUserWhitelisted={isUserWhitelisted} />
      </div>
      <div className="rounded-lg border-[1px] border-bd-primary bg-secondary">
        {whitelistStatus.requirements.map((requirement, index) => {
          return (
            <div
              key={index}
              className={twMerge(
                "flex w-full flex-col justify-start gap-1 border-b-[1px] border-b-bd-primary p-4 text-sm",
                index + 1 === numberOfRequirements && "border-none",
              )}
            >
              <div className="flex w-full items-center justify-between">
                <span
                  className={twMerge(
                    "font-medium",
                    requirement.isFulfilled && "opacity-50",
                  )}
                >
                  {requirement.label}
                </span>
                <Icon
                  icon={
                    requirement.isFulfilled
                      ? "SvgRoundCheckmark"
                      : "SvgCircledX"
                  }
                  className={twMerge(
                    "text-xl",
                    requirement.isFulfilled
                      ? "text-fg-success-primary"
                      : "text-fg-error-primary",
                  )}
                />
              </div>
              {requirement.additionalCTA && !requirement.isFulfilled && (
                <div className="mt-2 flex justify-start">
                  <ExternalLink
                    externalLink={requirement.additionalCTA}
                    className="rounded-lg px-3"
                    iconClassName="opacity-50"
                  />
                </div>
              )}
              {requirement.description && (
                <span className="font-normal opacity-50">
                  {requirement.description}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default WhitelistStatus
