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
          <button className="flex h-11 w-fit items-center gap-2 rounded-xl border border-bd-primary bg-[#060a1440] px-3 md:px-6 hover:bg-[#20212168] active:scale-[98%] md:h-12">
            <Icon icon="SvgFixedFDV" className="h-6 w-6 text-fg-fixed-fdv" />
            <span className="text-center text-sm font-medium text-fg-fixed-fdv">Fixed FDV</span>
          </button>

          <button className="flex h-11 w-fit items-center gap-2 rounded-xl border border-bd-primary bg-[#060a1440] px-3 md:px-6 hover:bg-[#20212168] active:scale-[98%] md:h-12">
            <Icon icon="SvgFloatFDV" className="h-6 w-6 text-fg-float-fdv" />
            <span className="text-center text-sm font-medium text-fg-float-fdv">Float FDV</span>
          </button>

          <button className="flex h-11 w-fit items-center gap-2 rounded-xl border border-bd-primary bg-[#060a1440] px-3 md:px-6 hover:bg-[#20212168] active:scale-[98%] md:h-12">
            <Icon icon="SvgFloorStrategy" className="h-6 w-6 text-fg-floor-strategy" />
            <span className="text-center text-sm font-medium text-fg-floor-strategy">Floor Strategy</span>
          </button>
        </div>

      </div>
    </SimpleModal>
  )
}

export default FloorStrategyModal
