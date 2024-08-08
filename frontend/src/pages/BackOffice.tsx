import { Button } from "@/components/Button/Button"
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
        <Controller
          name="title"
          control={control}
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <TextField
              label="Title"
              value={value}
              onChange={onChange}
              error={error?.message}
            />
          )}
        />
        <Controller
          name="subtitle"
          control={control}
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <TextField
              label="Subtitle"
              value={value}
              onChange={onChange}
              error={error?.message}
            />
          )}
        />
        <Controller
          name="chain.name"
          control={control}
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <TextField
              label="Chain Name"
              value={value}
              onChange={onChange}
              error={error?.message}
            />
          )}
        />

        <UploadField
          label="Label"
          fileName="example.png"
          projectId="puffer-finance"
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

      {/* @TODO - remove this component when feature is finished */}
      <div className="fixed right-4 top-[75vh] rounded-3xl bg-pink-200 bg-secondary p-4 ring-brand-primary">
        <Button
          onClick={() => console.log(watch())}
          btnText="LOG VALUES"
          className="bg-pink-500 text-white"
        />
      </div>
    </main>
  )
}

export default BackOffice
