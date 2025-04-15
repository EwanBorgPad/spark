import React, { useCallback, useEffect, useState } from "react"
import Img from "../Image/Img"
import { formatNumber } from "react-tweet"
import { Button } from "../Button/Button"
import { twMerge } from "tailwind-merge"
import BecomeAnAnalystModal from "../Modal/Modals/BecomeAnalystModal"
import { useSearchParams } from "react-router-dom"
import { usePersistedState } from "@/hooks/usePersistedState"
import { useQuery } from "@tanstack/react-query"
import { backendApi } from "@/data/backendApi"
import { useProjectDataContext } from "@/hooks/useProjectData"
import ProjectAnalysisModal from "../Modal/Modals/ProjectAnalysisModal"
import { Icon } from "../Icon/Icon"
import { BP_JWT_TOKEN } from "@/utils/constants"
import { useSearchParamsUpdate } from "@/hooks/useSearchParamsUpdate"

const numOfSkeletonItems = 12
const skeletonLoaderArray = Array.from({ length: numOfSkeletonItems }, (_, i) => `Item ${i + 1}`)

const OPEN_ANALYST_MODAL_PARAM = "openAnalystModal"

const Analysts = () => {
  const [showBecomeAnalystModal, setShowBecomeAnalystModal] = useState(false)
  const [showProjectAnalysisModal, setShowProjectAnalysisModal] = useState(false)
  const { addParam, removeParam, getParam, removeParamIfNull } = useSearchParamsUpdate()
  const { projectData } = useProjectDataContext()
  const [redirectionUrl, setRedirectionUrl] = usePersistedState("bp_redirectionUrl")
  const projectId = projectData?.id ?? ""
  const isCuratorSet = projectData?.info.curator.fullName && projectData?.info.curator.avatarUrl

  const { data, isLoading } = useQuery({
    queryFn: () =>
      backendApi.getAnalysisList({ projectId, isApproved: true, sortBy: "impressions", sortDirection: undefined }),
    queryKey: ["getAnalysisList", "isApproved=true", "impressions", projectId],
    enabled: Boolean(projectId),
    refetchOnWindowFocus: false,
  })

  const openBecomeAnalystModal = useCallback(() => {
    setShowBecomeAnalystModal(true)
    addParam(OPEN_ANALYST_MODAL_PARAM, "true")
  }, [addParam])

  const closeBecomeAnalystModal = () => {
    setShowBecomeAnalystModal(false)
    removeParam(OPEN_ANALYST_MODAL_PARAM)
    localStorage.removeItem(BP_JWT_TOKEN)
  }

  useEffect(() => {
    if (!getParam(OPEN_ANALYST_MODAL_PARAM)) return
    openBecomeAnalystModal()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!redirectionUrl) return
    removeParamIfNull("sessionId")
    const sessionIdSearchParam = getParam("sessionId")
    let newUrl = redirectionUrl
    if (sessionIdSearchParam) {
      const redirectionWithSessionId = redirectionUrl + `&sessionId=${sessionIdSearchParam}`
      newUrl = redirectionWithSessionId
    }
    setRedirectionUrl("")
    window.location.href = newUrl
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [redirectionUrl])

  return (
    <div className="flex w-full max-w-[792px] flex-[1] flex-col items-start gap-3 self-stretch">
      <h4 className="text-sm font-normal">Analyzed by</h4>
      <div className="flex h-full w-full flex-col justify-between gap-4 rounded-lg border-[1px] border-bd-secondary bg-default p-[1px] px-4 py-3">
        {isLoading ? (
          <div className="flex flex-wrap gap-1">
            {skeletonLoaderArray.map((item) => (
              <Img size="6" isRounded key={item} isFetchingLink src="" />
            ))}
          </div>
        ) : data?.analysisList.length ? (
          <>
            <div className="flex flex-wrap gap-1">
              {data?.analysisList.map((item) => (
                <Img size="6" isRounded key={item.analysis.id} src={item.analyst.twitterAvatar} />
              ))}
            </div>
            <div className={twMerge("flex w-full flex-col gap-4", !isCuratorSet ? "md:flex-row" : "")}>
              <div className="flex w-full gap-4">
                <div className="flex flex-1 flex-col">
                  <span className="text-sm text-fg-tertiary">Analysts</span>
                  <span className="text-fg-primary">{data.analystCount}</span>
                </div>
                <div className="flex flex-1 flex-col">
                  <span className="text-sm text-fg-tertiary">Impressions</span>
                  <span className="text-fg-primary">{formatNumber(data.sumImpressions)}</span>
                </div>
                <div className="flex flex-1 flex-col">
                  <span className="text-sm text-fg-tertiary">Likes</span>
                  <span className="text-fg-primary">{data.sumLikes}</span>
                </div>
              </div>
              <div className="flex w-full flex-wrap items-end gap-4">
                <Button
                  btnText="View Analyses"
                  color="tertiary"
                  className="h-fit flex-[1] rounded-lg py-2 text-sm"
                  onClick={() => setShowProjectAnalysisModal(true)}
                />
                <Button
                  btnText="Become an Analyst"
                  color="tertiary"
                  className="h-fit flex-[1] rounded-lg py-2 text-sm"
                  onClick={openBecomeAnalystModal}
                />
              </div>
            </div>
          </>
        ) : (
          <NoAnalystsYet isFullWidth={!isCuratorSet} openBecomeAnalystModal={openBecomeAnalystModal} />
        )}
      </div>
      {showBecomeAnalystModal && <BecomeAnAnalystModal onClose={closeBecomeAnalystModal} />}
      {showProjectAnalysisModal && (
        <ProjectAnalysisModal analysisList={data?.analysisList} onClose={() => setShowProjectAnalysisModal(false)} />
      )}
    </div>
  )
}

export default Analysts

const NoAnalystsYet = ({
  isFullWidth,
  openBecomeAnalystModal,
}: {
  isFullWidth: boolean
  openBecomeAnalystModal: () => void
}) => {
  return (
    <div
      className={twMerge(
        "flex h-full flex-col items-center justify-between gap-5 pt-3",
        isFullWidth && "md:flex-row md:pt-0",
      )}
    >
      <div className={twMerge("flex flex-col items-center gap-2 ", isFullWidth && "md:flex-row md:gap-4")}>
        <Icon icon="SvgChartLine" className="text-2xl text-fg-secondary" />
        <div className={twMerge("flex flex-col items-center gap-1", isFullWidth && "md:items-start")}>
          <span className="text-center text-base text-fg-primary md:text-left">No analyses yet</span>
          <span className="text-center text-sm text-fg-secondary md:text-left">
            CT&apos;s fresh thoughts about <br className={twMerge(isFullWidth && "md:hidden")}></br>this project will
            appear here
          </span>
        </div>
      </div>
      <Button
        btnText="Become an Analyst"
        color="tertiary"
        className={twMerge("h-[36px] w-full rounded-lg py-2 text-sm", isFullWidth && "max-w-[220px]")}
        onClick={openBecomeAnalystModal}
      />
    </div>
  )
}
