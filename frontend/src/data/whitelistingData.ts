import { ExternalLinkType } from "@/components/Button/ExternalLink"

export type WhitelistStatusType = {
  whitelisted: boolean
  requirements: {
    label: string
    description: string
    isFulfilled: boolean
    isMandatory: boolean
    additionalCTA?: ExternalLinkType
  }[]
}

export const whitelistDummyData: WhitelistStatusType = {
  whitelisted: true,
  requirements: [
    {
      label: "Hold 20,000 BORG in your wallet",
      description: "",
      isFulfilled: false,
      isMandatory: true,
      additionalCTA: {
        label: "Buy BORG",
        linkType: "NO_ICON",
        url: "#",
      },
    },
    {
      label: "Follow BorgPad on X",
      description: "",
      isFulfilled: false,
      isMandatory: true,
      additionalCTA: {
        label: "Follow Us",
        linkType: "X_TWITTER",
        url: "#",
      },
    },
    {
      label: "Another Requirement",
      description:
        "Consectetur a erat nam at. Interdum varius sit amet mattis vulputate enim nulla aliquet porttitor. ",
      isFulfilled: true,
      isMandatory: true,
    },
    {
      label: "Don’t reside in the US",
      description: "",
      isFulfilled: true,
      isMandatory: true,
    },
  ],
}
