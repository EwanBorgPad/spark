import React, { useEffect, useState } from "react"
import { SimpleModal } from "../SimpleModal"
import { Button } from "@/components/Button/Button"
import { Icon } from "@/components/Icon/Icon"
import { DropdownField } from "@/components/InputField/DropdownField"
import { TextField } from "@/components/InputField/TextField"
import { Controller, SubmitHandler, useForm } from "react-hook-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { backendApi } from "@/data/api/backendApi"
import { useNavigate, useSearchParams } from "react-router-dom"
import { usePersistedState } from "@/hooks/usePersistedState"
import Img from "@/components/Image/Img"
import { zodResolver } from "@hookform/resolvers/zod"
import { AnalystRoleEnum, NewAnalysisSchemaType, postNewAnalysisSchema } from "shared/schemas/analysis-schema"
import { toast } from "react-toastify"
import { useProjectDataContext } from "@/hooks/useProjectData"
import { twMerge } from "tailwind-merge"
import { BP_JWT_TOKEN } from "@/utils/constants"
import { useSearchParamsUpdate } from "@/hooks/useSearchParamsUpdate"
import { analysisApi } from "@/data/api/analysisApi"
import fixedFdvImg from '@/assets/launchPools/fixed-fdv.png'
import floatFdvImg from '@/assets/launchPools/float-fdv.png'
import floorStrategyImg from '@/assets/launchPools/floor-strategy.png'

type Props = {
  onClose: () => void
  isOpen: boolean
}

const roleOptions: { label: string; id: AnalystRoleEnum }[] = [
  {
    label: "Free Writer",
    id: "FREE_WRITER",
  },
  {
    label: "Team Member",
    id: "TEAM_MEMBER",
  },
  {
    label: "Sponsored Analyst",
    id: "SPONSORED_ANALYST",
  },
]

const FloorStrategyModal = ({ onClose, isOpen }: Props) => {
  const navigate = useNavigate()
  const [_, setRedirectionUrl] = usePersistedState("bp_redirectionUrl")
  const [__, setJwtToken] = usePersistedState(BP_JWT_TOKEN)
  const { projectData } = useProjectDataContext()
  const [sessionId, setSessionId] = useState<string>("")
  const [selectedStrategy, setSelectedStrategy] = useState<"Floor Strategy" | "Fixed FDV" | "Float FDV">("Floor Strategy")
  const queryClient = useQueryClient()
  const { removeParam, getParam, removeParamIfNull } = useSearchParamsUpdate()

  // configure and manage form
  const {
    watch,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
  } = useForm<NewAnalysisSchemaType>({
    defaultValues: { articleUrl: "" },
    mode: "onBlur",
    resolver: zodResolver(postNewAnalysisSchema),
  })

  // API request - postNewAnalysis
  const {
    mutate: postNewAnalysis,
    isPending,
    isSuccess: isAnalysisSubmittedSuccessfully,
  } = useMutation({
    mutationFn: async (payload: NewAnalysisSchemaType) => analysisApi.postNewAnalysis({ newAnalysis: payload }),
    onSuccess: async (_, _variables) => toast.success("New Analysis submitted successfully!", { theme: "colored" }),
    onError: (error) => toast.error(error.message),
  })

  // On submit handler
  const onSubmit: SubmitHandler<NewAnalysisSchemaType> = async (formData) => postNewAnalysis(formData)

  // fetch X (twitter) auth url
  const { data: authData, refetch: fetchTwitterAuthUrl } = useQuery({
    queryFn: () => analysisApi.getTwitterAuthUrl(),
    queryKey: ["getTwitterAuthUrl"],
    enabled: false,
    staleTime: 30 * 60 * 1000,
  })

  // fetch Analyst and token via sessionId
  const { data: session } = useQuery({
    queryFn: async () =>
      analysisApi.getSession(sessionId).then((result) => {
        removeParam("sessionId")
        return result
      }),
    queryKey: ["fetchSession", sessionId],
    enabled: Boolean(sessionId) && sessionId !== "null",
    staleTime: 30 * 60 * 1000,
  })
  const analyst = session?.analyst

  const disconnectAnalystHandler = () => {
    queryClient.setQueryData(["fetchSession", sessionId], undefined)
    setSessionId("")
    setJwtToken("")
  }

  // open X (twitter) Authorization window
  useEffect(() => {
    if (!authData?.twitterAuthUrl) return
    setRedirectionUrl(window.location.href)
    window.open(authData.twitterAuthUrl, "_self")
  }, [navigate, authData, setRedirectionUrl])

  // check sessionId
  useEffect(() => {
    const sessionIdSearchParam = getParam("sessionId")
    if (!sessionIdSearchParam) return
    if (sessionIdSearchParam === "null") {
      removeParamIfNull("sessionId")
      return
    }
    setSessionId(sessionIdSearchParam)
  }, [getParam, removeParamIfNull])

  useEffect(() => {
    if (!session) return
    const token = session.token
    const analyst = session.analyst
    setJwtToken(token) // set to local storage
    setValue("analystId", analyst.id, { shouldValidate: true, shouldDirty: true })
    setValue("twitterId", analyst.twitterId, { shouldValidate: true, shouldDirty: true })
    if (!projectData?.id) return
    setValue("projectId", projectData.id, { shouldValidate: true, shouldDirty: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectData?.id, session, setValue])

  const formValues = watch()

  return (
    <SimpleModal
      showCloseBtn
      onClose={onClose}
      className="relative w-full max-w-[908px] bg-default"
      headerClass="bg-default"
      isOpen={isOpen}
    >
      <div
        className={twMerge(
          "flex w-full flex-col items-center px-4 pb-6 md:px-[40px]",
          isAnalysisSubmittedSuccessfully && "animate-slide-exit-left",
        )}
      >
        <h1 className="pb-3 text-center text-3xl font-semibold text-fg-primary">
          BorgPad Strategy
        </h1>
        <span className="pb-12 text-center text-fg-secondary">Learn more about what different pool strategies mean</span>

        <div className="flex flex-col gap-4 md:flex-row md:justify-center">
          <button
            onClick={() => setSelectedStrategy("Fixed FDV")}
            className={`flex h-11 w-fit items-center gap-2 rounded-xl border border-bd-primary px-3 md:px-6 hover:bg-[#20212168] active:scale-[98%] md:h-12 ${selectedStrategy === "Fixed FDV" ? "bg-[#20212168]" : "bg-[#060a1440]"
              }`}
          >
            <div className="p-1 rounded-lg bg-fg-floor-strategy bg-opacity-10 mx-0">
              <Icon icon="SvgFixedFDV" className="h-6 w-6 text-fg-fixed-fdv" />
            </div>
            <span className="text-center text-sm font-medium text-fg-fixed-fdv">Fixed FDV</span>
          </button>

          <button
            onClick={() => setSelectedStrategy("Float FDV")}
            className={`flex h-11 w-fit items-center gap-2 rounded-xl border border-bd-primary px-3 md:px-6 hover:bg-[#20212168] active:scale-[98%] md:h-12 ${selectedStrategy === "Float FDV" ? "bg-[#20212168]" : "bg-[#060a1440]"
              }`}
          >
            <div className="p-1 rounded-lg bg-fg-float-fdv bg-opacity-10 mx-0">
              <Icon icon="SvgFloatFDV" className="h-6 w-6 text-fg-float-fdv" />
            </div>
            <span className="text-center text-sm font-medium text-fg-float-fdv">Float FDV</span>
          </button>

          <button
            onClick={() => setSelectedStrategy("Floor Strategy")}
            className={`flex h-11 w-fit items-center gap-2 rounded-xl border border-bd-primary px-3 md:px-6 hover:bg-[#20212168] active:scale-[98%] md:h-12 ${selectedStrategy === "Floor Strategy" ? "bg-[#20212168]" : "bg-[#060a1440]"
              }`}
          >
            <div className="p-1 rounded-lg bg-fg-floor-strategy bg-opacity-10 mx-0">
              <Icon icon="SvgFloorStrategy" className="h-6 w-6 text-fg-floor-strategy" />
            </div>
            <span className="text-center text-sm font-medium text-fg-floor-strategy">Floor Strategy</span>
          </button>
        </div>

        <div className="mt-8">
          {selectedStrategy === "Floor Strategy" && (
            <div className="flex flex-col md:flex-row-reverse md:items-start md:gap-8">
              <div className="flex flex-col items-start text-left w-[330px] md:w-[390px] gap-4 font-body font-normal ml-2 mb-4 md:mb-0">
                <div className="p-1 rounded-lg bg-fg-floor-strategy bg-opacity-10 mx-0">
                  <Icon icon="SvgFloorStrategy" className="h-6 w-6 text-fg-floor-strategy" />
                </div>
                <span className="text-lg font-semibold text-fg-primary">Floor Strategy</span>
                <span className="text-sm text-fg-secondary font-body font-normal">
                  A TGE model that protects your downside and unleashes infinite upside.<br />
                  <span className="text-fg-primary">The downside is capped, but your upside is unlimited.</span> The risk curve is flipped in your favour.
                </span>
                <span className="text-sm text-fg-secondary font-body font-normal">At TGE, your tokens can&apos;t be sold below a protected price - The Floor.</span>
              </div>
              <div className="w-[340px] h-[340px] md:w-[390px] md:h-[360px] flex items-center justify-center bg-accent rounded-xl mx-auto md:mx-0 mb-4 md:mb-0">
                <img src={floorStrategyImg} alt="Floor Strategy Chart" className="max-w-[90%] max-h-[90%]" />
              </div>
            </div>
          )}

          {selectedStrategy === "Fixed FDV" && (
            <div className="flex flex-col md:flex-row-reverse md:items-start md:gap-8">
              <div className="flex flex-col items-start text-left w-[330px] md:w-[390px] gap-4 font-body font-normal ml-2 mb-4 md:mb-0">
                <div className="p-1 rounded-lg bg-fg-fixed-fdv bg-opacity-10 mx-0">
                  <Icon icon="SvgFixedFDV" className="h-6 w-6 text-fg-fixed-fdv" />
                </div>
                <span className="text-lg font-semibold text-fg-primary">Fixed FDV</span>
                <span className="text-sm text-fg-secondary font-body font-normal">
                  The Fully Diluted Valuation (FDV) is <span className="text-fg-primary">set in advance</span> and <span className="text-fg-primary">does not change</span> based on the amount raised during the final raise on BorgPad.
                </span>
                <div className="flex flex-col items-start text-left">
                  <span className="text-sm font-semibold text-fg-primary mb-2 font-body font-normal">What this means:</span>
                  <ul className="list-disc space-y-2 ml-5">
                    <li className="text-sm text-fg-secondary font-body font-normal">Investors know upfront the valuation they are investing at.</li>
                    <li className="text-sm text-fg-secondary font-body font-normal">This offers <span className="text-fg-primary">full predictability</span> for both projects and investors.</li>
                  </ul>
                  <div className="mt-2">
                    <span className="text-sm font-semibold text-fg-primary block font-body font-normal">Example:</span>
                    <span className="text-sm text-fg-secondary font-body font-normal">If the FDV is set at $10 million, no matter how much is raised, the total valuation stays at $10M.</span>
                  </div>
                </div>
              </div>
              <div className="w-[340px] h-[340px] md:w-[390px] md:h-[360px] flex items-center justify-center bg-accent rounded-xl mx-auto md:mx-0 mb-4 md:mb-0">
                <img src={fixedFdvImg} alt="Fixed FDV Chart" className="max-w-[90%] max-h-[90%]" />
              </div>
            </div>
          )}

          {selectedStrategy === "Float FDV" && (
            <div className="flex flex-col md:flex-row-reverse md:items-start md:gap-8">
              <div className="flex flex-col items-start text-left w-[330px] md:w-[390px] gap-4 font-body font-normal ml-2 mb-4 md:mb-0">
                <div className="p-1 rounded-lg bg-fg-float-fdv bg-opacity-10 mx-0">
                  <Icon icon="SvgFloatFDV" className="h-6 w-6 text-fg-float-fdv" />
                </div>
                <span className="text-lg font-semibold text-fg-primary">Float FDV</span>
                <span className="text-sm text-fg-secondary font-body font-normal">
                  The Fully Diluted Valuation (FDV) is determined by the amount raised during the final raise on BorgPad. <span className="text-fg-primary">The more capital raised, the higher the final valuation.</span>
                </span>
                <div className="flex flex-col items-start text-left">
                  <span className="text-sm font-semibold text-fg-primary mb-2 font-body font-normal">What this means:</span>
                  <ul className="list-disc space-y-2 ml-5">
                    <li className="text-sm text-fg-secondary font-body font-normal">FDV dynamically adjusts based on market demand.</li>
                    <li className="text-sm text-fg-secondary font-body font-normal">Investors are buying into a valuation that <span className="text-fg-primary">directly reflects real user interest.</span></li>
                    <li className="text-sm text-fg-secondary font-body font-normal">This enables <span className="text-fg-primary">natural price discovery</span> and measures organic traction.</li>
                  </ul>
                  <div className="mt-2">
                    <span className="text-sm font-semibold text-fg-primary block font-body font-normal">Example:</span>
                    <li className="text-sm text-fg-secondary font-body font-normal">If <span className="text-fg-primary">$50,000</span> is raised, the final FDV might be <span className="text-fg-primary">$1 million.</span></li>
                    <li className="text-sm text-fg-secondary font-body font-normal">If <span className="text-fg-primary">$200,000</span> is raised, the FDV could rise to <span className="text-fg-primary">$5 million.</span></li>
                  </div>
                </div>
              </div>
              <div className="w-[340px] h-[340px] md:w-[390px] md:h-[360px] flex items-center justify-center bg-accent rounded-xl mx-auto md:mx-0 mb-4 md:mb-0">
                <img src={floatFdvImg} alt="Float FDV Chart" className="max-w-[90%] max-h-[90%]" />
              </div>
            </div>
          )}
        </div>

      </div>
    </SimpleModal>
  )
}

export default FloorStrategyModal
