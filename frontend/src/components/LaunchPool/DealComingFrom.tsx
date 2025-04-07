import React from "react"
import Img from "../Image/Img"
import Text from "@/components/Text"
import { useProjectDataContext } from "@/hooks/useProjectData"
import { ExternalLink } from "../Button/ExternalLink"
import { twMerge } from "tailwind-merge"

const DealComingFrom = () => {
  const { projectData, isLoading } = useProjectDataContext()
  
  const isCuratorSet = projectData?.info.curator.fullName && projectData?.info.curator.avatarUrl

  return (
    <div className={twMerge("flex w-full flex-[1] flex-col gap-3", isCuratorSet ? "" : "hidden")}>
      <h4 className="text-sm font-normal">Deal coming from</h4>

      <div className="flex h-full flex-row items-start gap-4 rounded-lg border border-bd-secondary bg-default px-4 py-3 md:flex-col md:justify-between">
        <Img src={projectData?.info.curator.avatarUrl} size="10" isFetchingLink={isLoading} isRounded />
        <div className="flex w-full flex-col gap-4">
          <div className="flex min-w-[120px] flex-col">
            <Text text={projectData?.info.curator.fullName} className="text-base md:text-lg" isLoading={isLoading} />
            <Text
              text={projectData?.info.curator.position}
              className="text-sm text-fg-secondary"
              isLoading={isLoading}
            />
          </div>
          <div className="ml-[-56px] flex w-full flex-wrap gap-3 md:ml-0">
            {projectData?.info.curator.socials.map((social) => (
              <ExternalLink.Icon2
                className="min-w-[76px] max-w-[112px] flex-[1]"
                key={social.iconType}
                externalLink={social}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DealComingFrom
