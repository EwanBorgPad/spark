import React from "react"
import { SimpleModal } from "../SimpleModal"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Controller, SubmitHandler, useForm } from "react-hook-form"
import { useWalletContext } from "@/hooks/useWalletContext"
import { backendApi } from "@/data/api/backendApi"
import { AdminAuthFields, GetProjectsResponse } from "shared/models"
import { useMutation, useQuery } from "@tanstack/react-query"
import { DropdownSelector } from "@/components/Dropdown/Dropdown"
import { TextField } from "@/components/InputField/TextField"
import { Button } from "@/components/Button/Button"
import { toast } from "react-toastify"
import { AnalystRoleEnum, analystRoleSchema } from "shared/schemas/analysis-schema"
import { DropdownField } from "@/components/InputField/DropdownField"
import { SvgTwitter } from "@/components/Icon/Svg"
import { Icon } from "@/components/Icon/Icon"
import { analysisApi } from "@/data/api/analysisApi"

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

type Props = {
  onClose: () => void
}

// schema & types
const formSchema = z.object({
  projectId: z.string().min(1, { message: "Select project" }),
  analystRole: analystRoleSchema,
  articleUrl: z.string().url(),
})
const formDefaultValues: Partial<FormType> = {
  projectId: "",
  articleUrl: "",
}
type FormType = z.infer<typeof formSchema>

const ManuallyAddAnalysisModal = ({ onClose }: Props) => {
  const { address, signMessage } = useWalletContext()

  // API request - postNewAnalysis
  const { mutate: manuallyAddAnalysis, isPending } = useMutation({
    mutationFn: async (args: FormType & { auth: AdminAuthFields }) => analysisApi.manuallyAddAnalysis(args),
    onError: (error) => {
      toast.error(error.message)
    },
    onSuccess: () => {
      toast.success("Analysis added!", { theme: "colored" })
      onClose()
    },
  })

  const { handleSubmit, control } = useForm<FormType>({
    defaultValues: formDefaultValues,
    resolver: zodResolver(formSchema),
    mode: "onBlur",
  })

  const { data } = useQuery<GetProjectsResponse>({
    queryFn: () => backendApi.getProjects({ page: 1, limit: 999 }),
    queryKey: ["getProjects", "all"],
  })
  const dropdownOptions = data ? data.projects.map((project) => ({ label: project.info.title, id: project.id })) : []

  const onSubmit: SubmitHandler<FormType> = async (formInputs) => {
    const message = "I confirm I am an admin by signing this message."
    const signature = Array.from(await signMessage(message))
    const auth = { address, message, signature }

    // POST request
    manuallyAddAnalysis({ ...formInputs, auth })
  }

  return (
    <SimpleModal
      showCloseBtn
      onClose={onClose}
      className="relative w-full max-w-[480px] overflow-y-hidden bg-default"
      headerClass="bg-default"
    >
      <div className="flex h-full max-h-[90vh] w-full flex-col items-center overflow-y-auto px-4 pb-[40px] md:max-h-[90vh] md:overflow-y-hidden md:px-[40px] md:pb-10">
        <p className="mb-6 flex gap-2 text-wrap text-center text-2xl font-semibold text-white">
          <span className="">Manually Add</span>
          <div className="flex items-center pt-0.5">
            <Icon icon={"SvgTwitter"} />
          </div>{" "}
          <span>Analysis</span>
        </p>
        <form
          className="max-w-screen flex min-h-[400px] w-full flex-col items-start gap-8 px-4 md:max-w-[720px]"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex w-full flex-col items-start gap-1.5 text-fg-primary">
            <div className="flex min-h-8 items-center">
              <span className="font-semibold text-fg-primary">Select Project</span>
            </div>
            <Controller
              control={control}
              name="projectId"
              render={({ field: { value, onChange }, fieldState: { error } }) => (
                <DropdownField
                  value={value}
                  onChange={onChange}
                  options={dropdownOptions}
                  containerClassName="max-w-[420px]"
                  inputClassName="bg-default text-fg-primary w-full"
                  dropdownClassName="max-h-[240px]"
                  error={error?.message}
                />
              )}
            />
          </div>

          <div className="flex w-full flex-col items-start gap-1.5 text-fg-primary">
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
          <div className="flex w-full flex-col items-start gap-1.5 text-fg-primary">
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
          <div className={"flex w-full flex-col items-center gap-3 md:col-span-1"}>
            <Button isLoading={isPending} type="submit" btnText="Add Analysis" className="w-full" />
            <span className="text-center text-sm text-fg-tertiary">Analysis will be submitted immediately</span>
          </div>
        </form>
      </div>
    </SimpleModal>
  )
}

export default ManuallyAddAnalysisModal
