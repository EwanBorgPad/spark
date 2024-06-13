import { useTranslation } from "react-i18next"

import { AvailableIcons, Icon } from "../Icon/Icon"
import { twMerge } from "tailwind-merge"

type BadgeProps = {
  label: string
  icon: AvailableIcons
  className?: string
  iconClassName?: string
}

const BadgeRoot = ({ label, icon, className, iconClassName }: BadgeProps) => {
  return (
    <div
      className={twMerge(
        "flex items-center gap-2 rounded-full border-[1px] py-1 pl-[7px] pr-2 ",
        className,
      )}
    >
      <Icon icon={icon} className={twMerge("text-[18px]", iconClassName)} />
      <span className="leading-normal">{label}</span>
    </div>
  )
}

const EligibilityBadge = ({
  isUserWhitelisted,
}: {
  isUserWhitelisted: boolean
}) => {
  const { t } = useTranslation()

  return (
    <BadgeRoot
      icon={isUserWhitelisted ? "SvgCircledCheckmark" : "SvgCircledX"}
      label={isUserWhitelisted ? t("tge.eligible") : t("tge.not_eligible")}
      className={
        isUserWhitelisted
          ? "border-bd-success-primary bg-success-primary text-fg-success-primary"
          : "border-error-secondary bg-error-primary text-fg-error-primary"
      }
      iconClassName={isUserWhitelisted ? "text-fg-success-secondary" : ""}
    />
  )
}

export const Badge = Object.assign(BadgeRoot, {
  Eligibility: EligibilityBadge,
})
