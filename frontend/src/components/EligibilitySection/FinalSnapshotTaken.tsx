import { Icon } from "@/components/Icon/Icon.tsx"
import { formatDateForSnapshot } from "@/utils/date-helpers.ts"
import React from "react"
import { useTranslation } from "react-i18next"
import { useProjectDataContext } from "@/hooks/useProjectData.tsx"

type Props = {
  className?: string
}
export const FinalSnapshotTaken = ({ className }: Props) => {
  const { t } = useTranslation()
  const { projectData } = useProjectDataContext()
  const timestamp = projectData.info.finalSnapshotTimestamp

  const formattedDate = timestamp && timestamp.getTime() ? formatDateForSnapshot(timestamp) : "TBD"

  return (
    <section className={className}>
      <div className="flex w-full flex-wrap items-center justify-center gap-1">
        <Icon icon="SvgSnapshot" className="shrink-0 text-xl text-brand-primary" />
        <span className="text-nowrap text-sm text-fg-tertiary">{t("whitelisting.snapshot_taken")}</span>{" "}
        <span className="text-nowrap text-sm text-fg-primary">
          {t("whitelisting.update_every", { date: formattedDate })}
        </span>
      </div>
    </section>
  )
}

