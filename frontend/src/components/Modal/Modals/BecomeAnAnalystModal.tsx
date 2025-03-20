import React, { useEffect } from "react"
import { SimpleModal } from "../SimpleModal"
import { Button } from "@/components/Button/Button"
import { Icon } from "@/components/Icon/Icon"
import { DropdownField } from "@/components/InputField/DropdownField"
import { TextField } from "@/components/InputField/TextField"
import { Controller, SubmitHandler, useForm } from "react-hook-form"
import { useQuery } from "@tanstack/react-query"
import { backendApi } from "@/data/backendApi"
import { useNavigate } from "react-router-dom"

type Props = {
  onClose: () => void
}

const roleOptions = [
  {
    label: "Freelance Writer",
    id: "FREELANCE_WRITER",
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

type FormInputs = {
  xAccount: string
  role: (typeof roleOptions)[number]["id"]
  linkPost: string
}

const BecomeAnAnalystModal = ({ onClose }: Props) => {
  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<FormInputs>({})
  const navigate = useNavigate()

  const onSubmit: SubmitHandler<FormInputs> = (data) => console.log(data)

  const { data: authData, refetch: fetchTwitterAuthUrl } = useQuery({
    queryFn: () => backendApi.getTwitterAuthUrl(),
    queryKey: ["getTwitterAuthUrl"],
    enabled: false,
    staleTime: 30 * 60 * 1000,
  })

  useEffect(() => {
    if (!authData?.twitterAuthUrl) return
    window.open(authData.twitterAuthUrl, "_blank")
  }, [navigate, authData])

  return (
    <SimpleModal
      showCloseBtn
      onClose={onClose}
      className="w-full max-w-[700px] !bg-default px-[40px]"
      headerClass="bg-default"
    >
      <div className="flex w-full max-w-[644px] flex-col items-center pb-6">
        <h1 className="pb-3 text-center text-xl font-semibold text-fg-primary">
          <span>Share your insights.</span>
          <br></br>
          <span>Help the community make informed decisions.</span>
        </h1>
        <span className="pb-12 text-fg-secondary">All analyses are considered personal opinions (NFA)</span>

        <form onSubmit={handleSubmit(onSubmit)} className="grid-cols-form-steps grid gap-x-[20px] gap-y-8 pb-[60px]">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-fg-secondary">1</div>
          <div className="flex w-full flex-col items-start">
            <div className="flex min-h-8 w-full items-center justify-between">
              <span className="font-semibold text-fg-primary">Connect your X account</span>
              <Button
                prefixElement={<Icon icon="SvgTwitter" className="text-lg" />}
                btnText="Connect"
                className="h-fit rounded-lg py-1"
                onClick={() => fetchTwitterAuthUrl()}
              />
            </div>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-fg-secondary">2</div>
          <div className="flex w-full flex-col items-start gap-3 text-fg-primary">
            <div className="flex min-h-8 items-center ">
              <span className="font-semibold text-fg-primary">Select your role</span>
            </div>
            <Controller
              name="role"
              control={control}
              render={({ field: { value, onChange }, fieldState: { error } }) => (
                <DropdownField
                  value={value}
                  onChange={onChange}
                  options={roleOptions}
                  inputClassName="bg-default text-fg-primary"
                />
              )}
            />
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-fg-secondary">3</div>
          <div className="flex w-full flex-col items-start gap-3 text-fg-primary">
            <div className="flex min-h-8 items-center">
              <span className="font-semibold text-fg-primary">Link your X article / tweet</span>
            </div>
            <Controller
              name="linkPost"
              control={control}
              render={({ field: { value, onChange }, fieldState: { error } }) => (
                <TextField
                  value={value}
                  onChange={onChange}
                  inputClassName="bg-default text-fg-primary"
                  placeholder="Paste Article URL here..."
                />
              )}
            />
          </div>
        </form>
        <div className="grid-cols-form-steps grid gap-x-[20px] gap-y-8">
          <div />
          <div className="flex flex-col items-center gap-3">
            <Button btnText="Post My Analysis" className="w-full" />
            <span className="text-sm text-fg-tertiary">Our team will review your application within 24hrs</span>
          </div>
        </div>
      </div>
    </SimpleModal>
  )
}

export default BecomeAnAnalystModal
