import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { addHours } from "date-fns/addHours"

import { useWhitelistStatusContext } from "@/hooks/useWhitelistContext"
import WhitelistRequirement from "../Whitelisting/WhitelistRequirement"
import { useWalletContext } from "@/hooks/useWalletContext.tsx"
import { formatDateForSnapshot } from "@/utils/date-helpers"
import { backendApi } from "@/data/backendApi.ts"
import { Badge } from "../Badge/Badge"
import { Icon } from "../Icon/Icon"

const WhitelistStatus = () => {
  const { t } = useTranslation()
  const { address } = useWalletContext()

  const { whitelistStatus, isUserWhitelisted } = useWhitelistStatusContext()

  const numberOfRequirements = whitelistStatus?.requirements.length || 0
  // move true values to the beginning of an array
  const sortedRequirements = whitelistStatus?.requirements
    ? [...whitelistStatus.requirements].sort((a, b) => {
        return Number(b.isFulfilled) - Number(a.isFulfilled)
      })
    : []

  const { data } = useQuery({
    queryFn: () => backendApi.getWhitelistingStatus({ address }),
    queryKey: ["getWhitelistingStatus", address],
    enabled: !!address,
  })

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex w-full items-center justify-between">
        <span>{t("tge.whitelist_status")}</span>
        <Badge.Confirmation isConfirmed={!!isUserWhitelisted} />
      </div>
      {numberOfRequirements > 0 && (
        <div className="rounded-lg border-[1px] border-bd-primary bg-secondary">
          {sortedRequirements.map((requirement, index) => {
            if (requirement.type === "FOLLOW_ON_X")
              requirement.isFulfilled = data?.isFollowingOnX || false
            if (requirement.type === "DONT_RESIDE_IN_US")
              requirement.isFulfilled = data?.isNotUsaResident || false
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
        <Icon
          icon="SvgSnapshot"
          className="shrink-0 text-xl text-brand-primary"
        />
        <span className="text-nowrap text-sm text-fg-tertiary">
          {t("whitelisting.snapshot_taken")}
        </span>{" "}
        <span className="text-nowrap text-sm text-fg-primary">
          {/* TODO @api swap dummy date below with real snapshot data */}
          {formatDateForSnapshot(addHours(new Date(), -4.4))}
        </span>
      </div>
    </div>
  )
}

export default WhitelistStatus
