import { useTranslation } from "react-i18next"

import { useWhitelistStatusContext } from "@/hooks/useWhitelistContext"
import WhitelistRequirement from "../Whitelisting/WhitelistRequirement"
import { Badge } from "../Badge/Badge"
import { Icon } from "../Icon/Icon"
import { useWalletContext } from "@/hooks/useWalletContext.tsx"
import { useQuery } from "@tanstack/react-query"
import { backendApi } from "@/data/backendApi.ts"

const WhitelistStatus = () => {
  const { t } = useTranslation()
  const { address } = useWalletContext()

  const { whitelistStatus, isUserWhitelisted } = useWhitelistStatusContext()

  const numberOfRequirements = whitelistStatus?.requirements.length || 0

  const { data } = useQuery({
    queryFn: () => backendApi.getWhitelistingStatus({ address }),
    queryKey: ["getWhitelistingStatus", address],
    enabled: !!address
  })

  return (
    <div className="mt-5 flex w-full flex-col gap-4">
      <div className="flex w-full items-center justify-between">
        <span>{t("tge.whitelist_status")}</span>
        <Badge.Confirmation isConfirmed={!!isUserWhitelisted} />
      </div>
      {numberOfRequirements > 0 && (
        <div className="rounded-lg border-[1px] border-bd-primary bg-secondary">
          {whitelistStatus!.requirements.map((requirement, index) => {
            if (requirement.type === 'FOLLOW_ON_X') requirement.isFulfilled = data?.isFollowingOnX || false
            if (requirement.type === 'DONT_RESIDE_IN_US') requirement.isFulfilled = data?.isNotUsaResident || false
            // TODO @whitelisting BORG count

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
      <div className="flex w-full items-center justify-center gap-1">
        <Icon icon="SvgSnapshot" className="text-xl text-brand-primary" />
        <span className="text-sm text-fg-tertiary">
          Final Snapshot taken on
        </span>{" "}
        <span className="text-sm text-fg-primary">
          2nd Jan 2024, at 23:59 CET
        </span>
      </div>
    </div>
  )
}

export default WhitelistStatus
