import { backendApi, PostAfterSaleUpdateArgs } from "@/data/backendApi"
import { TextField } from "@/components/InputField/TextField"
import { Button } from "@/components/Button/Button"
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { useMutation, useQuery } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { DropdownSelector } from '@/components/Dropdown/Dropdown'
import { useEffect, useState } from 'react'
import { GetProjectsResponse } from "shared/models"
import { useWalletContext } from '@/hooks/useWalletContext'

const urlSchema = z.string().url()

// schema & types
const formSchema = z.object({
  claimUrl: urlSchema,
  tweetUrl: urlSchema,
  tokenContractUrl: urlSchema,
  poolContractUrl: urlSchema,
})
const formDefaultValues: FormType = {
  claimUrl: 'https://',
  tweetUrl: 'https://',
  tokenContractUrl: 'https://',
  poolContractUrl: 'https://',
}
type FormType = z.infer<typeof formSchema>

// component
const BackOffice = () => {
  const { address, signMessage } = useWalletContext()

  const { data, refetch, isLoading } = useQuery<GetProjectsResponse>({
    queryFn: () => backendApi.getProjects({ page: 1, limit: 999 }),
    queryKey: ["getProjects", "all"],
  })
  const [selectedProjectId, setSelectedProjectId] = useState('')

  const dropdownOptions = data ? data.projects.map(project => ({ label: project.info.title, value: project.id })) : []
  const selectedProject = data && selectedProjectId && data.projects.find(project => project.id)

  const {
    handleSubmit, 
    control,
    reset,
    formState: { isDirty },
  } = useForm<FormType>({
    defaultValues: formDefaultValues,
    resolver: zodResolver(formSchema),
    mode: "onBlur",
  })

  // create project - api
  const { mutate: postAfterSaleUpdate, isPending } = useMutation({
    mutationFn: async (payload: PostAfterSaleUpdateArgs) => backendApi.postAfterSaleUpdate(payload),
    onSuccess: async (_, _variables) => { 
      toast.success("Project updated!") 
      await refetch()
      if (selectedProject) reset(selectedProject.info)
    },
    onError: (error) => { toast.error(error.message) },
  })

  useEffect(() => {
    if (selectedProject) {
      reset(selectedProject.info)
    }
  }, [selectedProject, reset])

  const onSubmit: SubmitHandler<FormType> = async (info) => {
    const message = "I confirm I am an admin by signing this message."
    const signature = Array.from(await signMessage(message))
    const auth = { address, message, signature }

    postAfterSaleUpdate({
      projectId: selectedProjectId,
      info,
      auth,
    })
  }

  
  // load projects in dropdown
  // choose one project
  // load its state into the form
  // isDirty flag enables the button
  // isLoading on change
  // toast success
  // toast error
  // solve loading states, success, and error messages

  return (
    <main className="z-[10] flex w-full max-w-full flex-col items-center gap-10 overflow-y-hidden py-[100px] font-normal text-fg-primary lg:py-[100px]">
      <h1>Update Project</h1>
      <DropdownSelector
        baseColor='secondary'
        accentColor='tertiary'
        onChange={(value) => setSelectedProjectId(value)}
        selected={selectedProjectId}
        options={dropdownOptions} />
      <form
        className="max-w-screen flex w-full flex-col items-start gap-8 px-4 md:max-w-[720px]"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex w-full flex-col gap-4 rounded-2xl bg-gradient-to-b from-gray-200/20 to-gray-200/10 px-6 py-8 shadow-lg shadow-black">
          <Controller
            name="claimUrl"
            control={control}
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <TextField
                label="Claim URL"
                value={value}
                error={error?.message}
                onChange={(event) => { onChange(event) }}
              />
            )}
          />
          <Controller
            name="tweetUrl"
            control={control}
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <TextField
                label="Tweet URL"
                value={value}
                error={error?.message}
                onChange={(event) => { onChange(event) }}
              />
            )}
          />
          <Controller
            name="tokenContractUrl"
            control={control}
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <TextField
                label="Token Contract URL"
                value={value}
                error={error?.message}
                onChange={(event) => { onChange(event) }}
              />
            )}
          />
          <Controller
            name="poolContractUrl"
            control={control}
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <TextField
                label="Pool Contract URL"
                value={value}
                error={error?.message}
                onChange={(event) => { onChange(event) }}
              />
            )}
          />
        </div>
        <div className="flex w-full justify-center pt-3">
          <Button
            btnText="Update Project"
            type="submit"
            size="md"
            className="px-10"
            disabled={!isDirty}
            isLoading={isPending}
          />
        </div>
      </form>
    </main>
  )
}

export default BackOffice
