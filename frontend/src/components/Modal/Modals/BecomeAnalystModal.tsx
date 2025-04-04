import React, { useEffect, useState } from "react"
import { SimpleModal } from "../SimpleModal"
import { Button } from "@/components/Button/Button"
import { Icon } from "@/components/Icon/Icon"
import { DropdownField } from "@/components/InputField/DropdownField"
import { TextField } from "@/components/InputField/TextField"
import { Controller, SubmitHandler, useForm } from "react-hook-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { backendApi } from "@/data/backendApi"
import { useNavigate, useSearchParams } from "react-router-dom"
import { usePersistedState } from "@/hooks/usePersistedState"
import Img from "@/components/Image/Img"
import { zodResolver } from "@hookform/resolvers/zod"
import { AnalystRoleEnum, NewAnalysisSchemaType, postNewAnalysisSchema } from "shared/schemas/analysis-schema"
import { toast } from "react-toastify"
import { useProjectDataContext } from "@/hooks/useProjectData"
import { twMerge } from "tailwind-merge"

type Props = {
  onClose: () => void
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

const BecomeAnalystModal = ({ onClose }: Props) => {
  const navigate = useNavigate()
  const [_, setRedirectionUrl] = usePersistedState("bp_redirectionUrl")
  const { projectData } = useProjectDataContext()
  const [searchParams, setSearchParams] = useSearchParams()
  const [analystId, setAnalystId] = useState<string>("")
  const queryClient = useQueryClient()

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
    mutationFn: async (payload: NewAnalysisSchemaType) => backendApi.postNewAnalysis({ newAnalysis: payload }),
    onSuccess: async (_, _variables) => {
      toast.success("New Analysis submitted successfully!", { theme: "colored" })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  // On submit handler
  const onSubmit: SubmitHandler<NewAnalysisSchemaType> = async (formData) => {
    postNewAnalysis(formData)
  }

  // fetch X (twitter) auth url
  const { data: authData, refetch: fetchTwitterAuthUrl } = useQuery({
    queryFn: () => backendApi.getTwitterAuthUrl(),
    queryKey: ["getTwitterAuthUrl"],
    enabled: false,
    staleTime: 30 * 60 * 1000,
  })

  // fetch Analyst as per id
  const { data: analyst, refetch: fetchAnalyst } = useQuery({
    queryFn: () => backendApi.getAnalyst({ analystId }),
    queryKey: ["getTwitterAuthUrl", analystId],
    enabled: false,
    staleTime: 30 * 60 * 1000,
  })

  const disconnectAnalyst = () => {
    const updatedParams = new URLSearchParams(searchParams) // Clone current params
    updatedParams.delete("analystId") // Modify the clone
    setSearchParams(updatedParams) // Pass the updated object
    queryClient.setQueryData(["getAnalyst", analystId], undefined)
    setAnalystId("")
  }

  useEffect(() => {
    if (!authData?.twitterAuthUrl) return
    setRedirectionUrl(window.location.href)
    window.open(authData.twitterAuthUrl, "_self")
  }, [navigate, authData, setRedirectionUrl])

  useEffect(() => {
    const analystIdSearchParam = searchParams.get("analystId")
    if (!analystIdSearchParam) return
    setAnalystId(analystIdSearchParam)
  }, [searchParams])

  useEffect(() => {
    if (!analystId || analystId === "null") return
    fetchAnalyst()
  }, [analystId, fetchAnalyst])

  useEffect(() => {
    if (!analyst?.id) return
    setValue("analystId", analyst.id, { shouldValidate: true, shouldDirty: true })
    setValue("twitterId", analyst.twitterId, { shouldValidate: true, shouldDirty: true })
    if (!projectData?.id) return
    setValue("projectId", projectData.id, { shouldValidate: true, shouldDirty: true })
  }, [analyst?.id, analyst?.twitterId, projectData?.id, setValue])

  const formValues = watch()

  return (
    <SimpleModal
      showCloseBtn
      onClose={onClose}
      className="relative w-full max-w-[700px] bg-default"
      headerClass="bg-default"
    >
      <div
        className={twMerge(
          "flex w-full flex-col items-center px-4 pb-6 md:px-[40px]",
          isAnalysisSubmittedSuccessfully && "animate-slide-exit-left",
        )}
      >
        <h1 className="pb-3 text-center text-2xl font-semibold text-fg-primary">
          <span>Share your insights.</span>
          <br></br>
          <span>Help the community make informed decisions.</span>
        </h1>
        <span className="pb-12 text-center text-fg-secondary">All analyses are considered personal opinions (NFA)</span>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-form-steps gap-x-[20px] gap-y-8">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-secondary p-1.5 text-fg-secondary">
            {analyst?.twitterAvatar ? (
              <>
                <Img src={analyst.twitterAvatar} size="5" isRounded />
                <Icon
                  icon={"SvgRoundCheckmark"}
                  className={"absolute left-4 top-4 text-base text-fg-success-primary"}
                />
              </>
            ) : (
              <span>1</span>
            )}
            <div className="absolute left-[15px] top-8 h-[152px] w-[2px] bg-secondary"></div>
          </div>
          <div className="flex w-full flex-col items-start">
            <div className="flex min-h-8 w-full flex-col items-start justify-between gap-2 md:flex-row md:items-center">
              <span className="font-semibold text-fg-primary">Connect your X account</span>
              {analyst?.twitterId && analystId ? (
                <Button
                  btnText="Disconnect"
                  color="tertiary"
                  className="h-fit rounded-lg py-1"
                  onClick={disconnectAnalyst}
                />
              ) : (
                <Button
                  prefixElement={<Icon icon="SvgTwitter" className="text-lg" />}
                  btnText="Connect"
                  className="h-fit rounded-lg py-1"
                  onClick={() => fetchTwitterAuthUrl()}
                />
              )}
            </div>
          </div>
          <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-fg-secondary">
            {formValues.analystRole ? (
              <Icon icon={"SvgRoundCheckmark"} className={"text-xl text-fg-success-primary"} />
            ) : (
              <span>2</span>
            )}
            <div className="absolute left-[15px] top-8 h-[100%] w-[2px] bg-secondary"></div>
          </div>
          <div className="flex w-full flex-col items-start gap-3 text-fg-primary">
            <div className="flex min-h-8 items-center ">
              <span className="font-semibold text-fg-primary">Select your role</span>
            </div>
            <Controller
              name="analystRole"
              control={control}
              render={({ field: { value, onChange }, fieldState: { error } }) => (
                <DropdownField
                  value={value}
                  onChange={onChange}
                  options={roleOptions}
                  containerClassName="max-w-[420px]"
                  inputClassName="bg-default text-fg-primary w-full"
                  error={error?.message}
                />
              )}
            />
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-fg-secondary">
            {formValues.articleUrl && !errors["articleUrl"] ? (
              <Icon icon={"SvgRoundCheckmark"} className={"text-xl text-fg-success-primary"} />
            ) : (
              <span>3</span>
            )}
          </div>
          <div className="flex w-full flex-col items-start gap-3 text-fg-primary">
            <div className="flex min-h-8 items-center">
              <span className="font-semibold text-fg-primary">Link your X article / tweet</span>
            </div>
            <Controller
              name="articleUrl"
              control={control}
              render={({ field: { value, onChange }, fieldState: { error } }) => (
                <TextField
                  value={value}
                  onChange={onChange}
                  inputClassName="bg-default text-fg-primary w-full"
                  containerClassName="max-w-[420px]"
                  placeholder="Paste Article URL here..."
                  error={error?.message}
                />
              )}
            />
          </div>
          <div className="hidden md:flex" />
          <div className={"col-span-2 mt-7 flex flex-col items-center gap-3 md:col-span-1"}>
            <Button
              isLoading={isPending}
              type="submit"
              btnText="Post My Analysis"
              className="w-full"
              // disabled={!isValid}
            />
            <span className="text-center text-sm text-fg-tertiary">
              Our team will review your application within 24hrs
            </span>
          </div>
        </form>
      </div>

      {/* After posting analysis success */}
      {isAnalysisSubmittedSuccessfully && (
        <div className={twMerge("absolute inset-0 z-[11] flex w-full flex-col items-center justify-center")}>
          <div
            style={{ animationDelay: "250ms" }}
            className={twMerge(
              "flex translate-x-[10%] flex-col items-center gap-3 opacity-0",
              isAnalysisSubmittedSuccessfully && "animate-slide-entrance-left",
            )}
          >
            <span className="mb-3 text-2xl font-semibold text-white">Thank you for applying</span>
            <span className="mb-10 text-center text-base font-normal text-fg-secondary">
              Once your analysis passes our team&apos;s review,<br></br>it will appear on the project page within 24
              hours.
            </span>
            <Button btnText="Close" onClick={onClose} className="px-20" />
          </div>
        </div>
      )}
    </SimpleModal>
  )
}

export default BecomeAnalystModal
