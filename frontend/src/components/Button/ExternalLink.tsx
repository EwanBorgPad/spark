import { AvailableIcons, Icon } from "../Icon/Icon"

type Props = {
  externalLink: ExternalLinkType
}
export type ExternalLinkType = {
  url: string
  linkType: LinkType
  label?: string
}
export type LinkType = "medium" | "linkedin" | "web" | "x-twitter"

const icons: Record<Props["externalLink"]["linkType"], AvailableIcons> = {
  medium: "SvgMedium",
  linkedin: "SvgLinkedin",
  web: "SvgWeb",
  "x-twitter": "SvgTwitter",
}

const ExternalLinkWithLabel = ({ externalLink }: Props) => {
  return (
    <a
      href={externalLink.url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-2 rounded-full border-[1px] border-bd-primary px-2 py-1.5 hover:bg-bd-primary/40 active:scale-[98%]"
    >
      <Icon
        icon={icons[externalLink.linkType]}
        className="text-xl leading-none"
      />
      <span className="text-nowrap text-sm">{externalLink?.label}</span>
    </a>
  )
}
const ExternalLinkIcon = ({ externalLink }: Props) => {
  return (
    <a
      href={externalLink.url}
      target="_blank"
      rel="noreferrer"
      className="h-9 w-9 rounded-full border-[1px] border-bd-primary p-1 px-[7px] hover:bg-bd-primary/40 active:scale-[98%]"
    >
      <Icon
        icon={icons[externalLink.linkType]}
        className="text-xl leading-none"
      />
    </a>
  )
}

export const ExternalLink = Object.assign(ExternalLinkWithLabel, {
  Icon: ExternalLinkIcon,
})
