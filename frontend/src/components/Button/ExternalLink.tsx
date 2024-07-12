import { twMerge } from "tailwind-merge"
import { AvailableIcons, Icon } from "../Icon/Icon"

type Props = {
  externalLink: ExternalLinkType
  className?: string
  iconClassName?: string
}
export type ExternalLinkType = {
  url: string
  iconType: IconLinkType
  label?: string
}
export type IconLinkType =
  | "MEDIUM"
  | "LINKED_IN"
  | "WEB"
  | "X_TWITTER"
  | "OUTER_LINK"
  | "NO_ICON"

const icons: Record<
  Exclude<Props["externalLink"]["iconType"], "NO_ICON">,
  AvailableIcons
> = {
  MEDIUM: "SvgMedium",
  LINKED_IN: "SvgLinkedin",
  WEB: "SvgWeb",
  X_TWITTER: "SvgTwitter",
  OUTER_LINK: "SvgExternalLink",
}

const ExternalLinkWithLabel = ({
  externalLink,
  className,
  iconClassName,
}: Props) => {
  return (
    <a
      href={externalLink.url}
      target="_blank"
      rel="noreferrer"
      className={twMerge(
        "flex items-center gap-2 rounded-full border-[1px] border-bd-primary px-2 py-1.5 hover:bg-bd-primary/40 active:scale-[98%]",
        className,
      )}
    >
      {externalLink.iconType !== "NO_ICON" && (
        <Icon
          icon={icons[externalLink.iconType]}
          className={twMerge("text-xl leading-none", iconClassName)}
        />
      )}
      <span className="text-nowrap text-sm">{externalLink?.label}</span>
    </a>
  )
}
const ExternalLinkIcon = ({
  externalLink,
  className,
  iconClassName,
}: Props) => {
  return (
    <a
      href={externalLink.url}
      target="_blank"
      rel="noreferrer"
      className={twMerge(
        "flex h-9 w-9 items-center justify-center rounded-full border-[1px] border-bd-primary p-1 px-[7px] hover:bg-bd-primary/40 active:scale-[98%]",
        className,
      )}
    >
      {externalLink.iconType !== "NO_ICON" && (
        <Icon
          icon={icons[externalLink.iconType]}
          className={twMerge("leading-none", iconClassName)}
        />
      )}
    </a>
  )
}

export const ExternalLink = Object.assign(ExternalLinkWithLabel, {
  Icon: ExternalLinkIcon,
})
