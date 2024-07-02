import { useTranslation } from "react-i18next"

import { useWhitelistStatusContext } from "@/hooks/useWhitelistContext"
import WhitelistRequirement from "../Whitelisting/WhitelistRequirement"
import { Badge } from "../Badge/Badge"

const WhitelistStatus = () => {
  const { t } = useTranslation()

  const { whitelistStatus, isUserWhitelisted } = useWhitelistStatusContext()

  const numberOfRequirements = whitelistStatus?.requirements.length || 0

  return (
    <div className="mt-5 flex w-full flex-col gap-4">
      <div className="flex w-full items-center justify-between">
        <span>{t("tge.whitelist_status")}</span>
        <Badge.Eligibility isUserWhitelisted={!!isUserWhitelisted} />
      </div>
      {numberOfRequirements > 0 && (
        <div className="rounded-lg border-[1px] border-bd-primary bg-secondary">
          {whitelistStatus!.requirements.map((requirement, index) => {
            return (
              <WhitelistRequirement
                requirementStatus={requirement}
                key={requirement.type}
                type={requirement.type}
                isLastItem={index + 1 === numberOfRequirements}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

export default WhitelistStatus
