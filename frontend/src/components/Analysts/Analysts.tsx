import React, { useCallback, useEffect, useState } from "react"
import Img from "../Image/Img"
import { formatNumber } from "react-tweet"
import { Button } from "../Button/Button"
import { twMerge } from "tailwind-merge"
import BecomeAnAnalystModal from "../Modal/Modals/BecomeAnAnalystModal"
import { useSearchParams } from "react-router-dom"
import { usePersistedState } from "@/hooks/usePersistedState"
import { useQuery } from "@tanstack/react-query"
import { backendApi } from "@/data/backendApi"
import { useProjectDataContext } from "@/hooks/useProjectData"

const DUMMY_AVATAR = "https://files.staging.borgpad.com/images/madagascar-social-yacht-club/curator-avatar-295950502"
const numOfSkeletonItems = 24
const skeletonLoaderArray = Array.from({ length: numOfSkeletonItems }, (_, i) => `Item ${i + 1}`)

type Props = {
  isFullWidth?: boolean
}

const OPEN_ANALYST_MODAL_PARAM = "openAnalystModal"

const Analysts = ({ isFullWidth }: Props) => {
  const [showBecomeAnalystModal, setShowBecomeAnalystModal] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const { projectData } = useProjectDataContext()
  const [redirectionUrl, setRedirectionUrl] = usePersistedState("bp_redirectionUrl")
  const projectId = projectData?.id ?? ""

  const { data, isLoading } = useQuery({
    queryFn: () => backendApi.getAnalysisList({ projectId }),
    queryKey: ["getAnalysisList", projectId],
    enabled: Boolean(projectId),
    refetchOnWindowFocus: false,
  })

  const addParam = useCallback(
    (key: string, value: string) => {
      searchParams.set(key, value)
      setSearchParams(searchParams)
    },
    [searchParams, setSearchParams],
  )
  const removeParam = (key: string) => {
    searchParams.delete(key)
    setSearchParams(searchParams)
  }
  const openModal = useCallback(() => {
    setShowBecomeAnalystModal(true)
    addParam(OPEN_ANALYST_MODAL_PARAM, "true")
  }, [addParam])

  const closeModal = () => {
    setShowBecomeAnalystModal(false)
    removeParam(OPEN_ANALYST_MODAL_PARAM)
  }

  useEffect(() => {
    if (!searchParams.get(OPEN_ANALYST_MODAL_PARAM)) return
    openModal()
  }, [openModal, searchParams])
  useEffect(() => {
    if (!redirectionUrl) return
    const analystIdSearchParam = searchParams.get("analystId")
    const redirectionWithAnalystId = `${redirectionUrl}&analystId=${analystIdSearchParam}`
    setRedirectionUrl("")
    window.location.href = redirectionWithAnalystId
  }, [redirectionUrl, searchParams, setRedirectionUrl])

  return (
    <div className="flex w-full max-w-[792px] flex-[1] flex-col items-start gap-3 self-stretch">
      <h4 className="text-sm font-normal">Analyzed by</h4>
      <div className="flex h-full w-full flex-col justify-between gap-4 rounded-lg border-[1px] border-bd-secondary bg-default p-[1px] px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {isLoading
            ? skeletonLoaderArray.map((item) => <Img size="6" isRounded key={item} isFetchingLink src="#" />)
            : data?.analysisList.map((item) => (
                <Img size="6" isRounded key={item.analysis.id} src={item.analyst.twitterAvatar} />
              ))}
        </div>
        <div className={twMerge("flex w-full flex-col gap-4", isFullWidth ? "md:flex-row" : "")}>
          <div className="flex w-full gap-4">
            <div className="flex flex-1 flex-col">
              <span className="text-sm text-fg-tertiary">Analysts</span>
              <span className="text-fg-primary">{133}</span>
            </div>
            <div className="flex flex-1 flex-col">
              <span className="text-sm text-fg-tertiary">Impressions</span>
              <span className="text-fg-primary">{formatNumber(123113)}</span>
            </div>
            <div className="flex flex-1 flex-col">
              <span className="text-sm text-fg-tertiary">Likes</span>
              <span className="text-fg-primary">{333}</span>
            </div>
          </div>
          <div className="flex w-full flex-wrap items-end gap-4">
            <Button
              btnText="View Analyses"
              color="tertiary"
              className="h-fit flex-[1] py-2 text-sm"
              onClick={openModal}
            />
            <Button
              btnText="Become an Analyst"
              color="plain"
              className="h-fit flex-[1] py-2 text-sm"
              onClick={openModal}
            />
          </div>
        </div>
      </div>
      {showBecomeAnalystModal && <BecomeAnAnalystModal onClose={closeModal} />}
    </div>
  )
}

export default Analysts
