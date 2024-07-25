import { CurrencyInputField } from "@/components/InputField/CurrencyInputField"
import { DropdownField } from "@/components/InputField/DropdownField"
import { TextField } from "@/components/InputField/TextField"
import UploadField from "@/components/InputField/UploadField"
import { timelineEventOptions } from "@/utils/constants"
import { Controller, SubmitHandler, useForm } from "react-hook-form"
import { ProjectModel } from "shared/models"

const BackOffice = () => {
  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<ProjectModel>()

  const onSubmit: SubmitHandler<ProjectModel> = (data) => console.log(data)

  return (
    <main className="z-[10] flex w-full max-w-full flex-col items-center gap-10 overflow-y-hidden py-[72px] font-normal text-fg-primary lg:py-[36px]">
      <h1>Back Office</h1>
      <form
        className="flex w-[320px] flex-col items-center gap-4 pb-[40px]"
        onSubmit={handleSubmit(onSubmit)}
      >
        <Controller name="curator.fullName" control={control} render={({ field: { value, onChange }, fieldState: { error } }) => <TextField
          label="Label"
          value={value}
          onChange={onChange}
          error={error?.message}
        />} />
        
        <UploadField
          label="Label"
          imgUrl={undefined} // input value
          onChange={(value) => console.log(value)}
        />
        <DropdownField
          label="Label"
          options={timelineEventOptions}
          value={undefined}
          onChange={(value) => console.log(value)}
        />
        <CurrencyInputField
          label="Label"
          value={undefined}
          onChange={(value) => console.log(value)}
        />
      </form>
    </main>
  )
}

export default BackOffice
