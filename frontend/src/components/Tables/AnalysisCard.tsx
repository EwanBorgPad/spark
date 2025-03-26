import React from "react"
import { GetListOfAnalysisResponse } from "shared/schemas/analysis-schema"
import { Button } from "../Button/Button"
import { Icon } from "../Icon/Icon"
import Img from "../Image/Img"

type Props = {
  analysis: GetListOfAnalysisResponse["analysisList"][number]
}

const AnalysisCard = ({ analysis }: Props) => {
  return (
    <div className="flex flex-col gap-4 border border-bd-secondary rounded-xl p-2">
      <div className="flex flex-row items-center gap-4">
        <Img size="8" src={analysis.analyst.twitterAvatar} isRounded />
        <div className="flex flex-col flex-nowrap items-start">
          <span className="truncate text-sm font-semibold text-fg-primary">{analysis.analyst.twitterName}</span>
          <span className="truncate text-sm font-normal text-fg-tertiary">@{analysis.analyst.twitterUsername}</span>
        </div>
      </div>
      <div className="flex gap-2.5">
        <div className="flex flex-col">
          <span className="truncate text-sm font-semibold text-fg-primary">Impressions</span>
          <span className="truncate text-sm font-normal text-fg-tertiary">{(402220).toLocaleString()}</span>
        </div>
        <div className="flex flex-col">
          <span className="truncate text-sm font-semibold text-fg-primary">Likes</span>
          <span className="truncate text-sm font-normal text-fg-tertiary">{(4020).toLocaleString()}</span>
        </div>
      </div>
      <a href={analysis.analysis.articleUrl} target="_blank" rel="noreferrer" className="w-full">
        <Button
          color="tertiary"
          btnText="Read"
          textClassName="text-sm font-medium"
          className="rounded-lg py-2 w-full"
          suffixElement={<Icon icon="SvgExternalLink" className="text-fg-secondary" />}
        />
      </a>
    </div>
  )
}

export default AnalysisCard
