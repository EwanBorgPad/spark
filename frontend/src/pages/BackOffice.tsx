import { Button } from "@/components/Button/Button"
import { externalLinkObj, IconLinkType } from "@/components/Button/ExternalLink"
import { Icon } from "@/components/Icon/Icon"
import { CurrencyInputField } from "@/components/InputField/CurrencyInputField"
import DateTimeField from "@/components/InputField/DateTimeField"
import { DropdownField } from "@/components/InputField/DropdownField"
import { TextField } from "@/components/InputField/TextField"
import UploadField from "@/components/InputField/UploadField"
import { timelineEventLabels, timelineEventOptions } from "@/utils/constants"
import {
  Controller,
  SubmitHandler,
  useFieldArray,
  useForm,
} from "react-hook-form"
import { ProjectModel } from "shared/models"

export const iconOptions = Object.entries(externalLinkObj).map(
  ([key, value]) => ({ id: key, label: value.label }),
)
type IconType = Exclude<IconLinkType, "NO_ICON">

const BackOffice = () => {
  const getDefaultValues = () => ({
    tokensAvailability: { available: 0 },
    projectLinks: [{ url: "", iconType: "WEB" as IconType, label: "" }],
    curator: { socials: [{ url: "", iconType: "WEB" as IconType, label: "" }] },
    timeline: [{ id: undefined, date: undefined, label: undefined }],
    registrations: 0,
  })

  const {
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<ProjectModel>({ defaultValues: getDefaultValues() })

  const onSubmit: SubmitHandler<ProjectModel> = (data) => console.log(data)

  const {
    fields: curatorSocials,
    append: addCuratorSocials,
    remove: removeCuratorSocials,
  } = useFieldArray({
    control,
    name: "curator.socials",
  })
  const {
    fields: projectLinks,
    append: addProjectLinks,
    remove: removeProjectLinks,
  } = useFieldArray({
    control,
    name: "projectLinks",
  })
  const {
    fields: timelineEvents,
    append: addTimelineEvent,
    remove: removeTimelineEvent,
  } = useFieldArray({
    control,
    name: "timeline",
  })

  const updateExternalLinks = (
    basePath: "curator.socials" | "projectLinks",
    value: IconLinkType,
    index: number,
  ) => {
    setValue(`${basePath}.${index}.iconType`, value as IconType)
    setValue(
      `${basePath}.${index}.label`,
      externalLinkObj[value as IconType].label,
    )
  }

  return (
    <main className="z-[10] flex w-full max-w-full flex-col items-center gap-10 overflow-y-hidden py-[72px] font-normal text-fg-primary lg:py-[100px]">
      <h1>Back Office</h1>
      <form
        className="max-w-screen flex w-full flex-col items-start gap-4 rounded-2xl bg-black/20 px-6 py-8 pb-[40px] lg:max-w-[720px]"
        onSubmit={handleSubmit(onSubmit)}
      >
        <Controller
          name="title"
          control={control}
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <TextField
              label="Project Title"
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
              label="Project Subtitle"
              value={value}
              onChange={onChange}
              error={error?.message}
            />
          )}
        />
        <Controller
          name="logoUrl"
          control={control}
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <UploadField
              label="Project Logo"
              fileName="avatar.png"
              imgUrl={undefined} // input value
              onChange={(value) => console.log(value)}
              error={error?.message}
            />
          )}
        />

        <div className="flex w-full max-w-[372px] flex-col items-start gap-4 rounded-xl bg-secondary/30 p-2 py-6 ring-[1px] ring-white/20">
          <h2 className="px-4 text-xl font-semibold">Chain Info</h2>

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

          <Controller
            name="logoUrl"
            control={control}
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <UploadField
                label="Project Avatar"
                fileName="chain-icon.png"
                imgUrl={undefined} // input value
                onChange={(value) => console.log(value)}
                error={error?.message}
              />
            )}
          />
        </div>

        <Controller
          name="lbpType"
          control={control}
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <TextField
              label="LBP Type"
              value={value}
              onChange={onChange}
              error={error?.message}
            />
          )}
        />
        <Controller
          name="origin"
          control={control}
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <TextField
              label="Origin"
              value={value}
              onChange={onChange}
              error={error?.message}
            />
          )}
        />
        <div className="flex w-full max-w-[720px] flex-col items-start gap-4 rounded-xl bg-secondary/30 p-2 py-6 ring-[1px] ring-white/20">
          <h2 className="px-4 text-xl font-semibold">Project Links</h2>
          <div className="flex w-full flex-col items-start gap-2 pl-4">
            <div className="grid-cols-curator-socials grid gap-8 text-sm">
              <span>Type</span>
              <span>Icon</span>
              <span>URL</span>
              <span></span>
            </div>
            {projectLinks.map((social, index) => (
              <div className="flex w-full items-center gap-8" key={index}>
                <Controller
                  name={`projectLinks.${index}.iconType`}
                  control={control}
                  render={({
                    field: { value, onChange },
                    fieldState: { error },
                  }) => (
                    <DropdownField
                      options={iconOptions}
                      value={value}
                      containerClassName="w-[128px] px-0"
                      onChange={(value) => {
                        updateExternalLinks(
                          "projectLinks",
                          value as IconType,
                          index,
                        )
                      }}
                    />
                  )}
                />
                <Icon
                  icon={
                    externalLinkObj[watch(`projectLinks.${index}.iconType`)]
                      .icon
                  }
                  className="text-2xl"
                />
                <Controller
                  name={`projectLinks.${index}.url`}
                  control={control}
                  render={({
                    field: { value, onChange },
                    fieldState: { error },
                  }) => (
                    <TextField
                      value={value}
                      containerClassName="px-0"
                      onChange={onChange}
                      error={error?.message}
                    />
                  )}
                />
                <Button.Icon
                  icon="SvgX"
                  color="plain"
                  className="p-1 hover:bg-bd-danger/10 hover:text-bd-danger"
                  onClick={() => removeProjectLinks(index)}
                />
              </div>
            ))}
          </div>
          <Button
            btnText="Add New Social"
            size="xs"
            color="plain"
            prefixElement={<Icon icon="SvgPlus" />}
            onClick={() =>
              addProjectLinks({ iconType: "WEB", label: "", url: "" })
            }
            className="ml-4"
          />
        </div>
        <div className="flex w-full max-w-[720px] flex-col items-start gap-4 rounded-xl bg-secondary/30 p-2 py-6 ring-[1px] ring-white/20">
          <h2 className="px-4 text-xl font-semibold">Curator</h2>
          <Controller
            name="curator.avatarUrl"
            control={control}
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <UploadField
                label="Avatar"
                fileName="curator-avatar.png"
                imgUrl={undefined} // input value
                onChange={(value) => console.log(value)}
                error={error?.message}
              />
            )}
          />
          <Controller
            name="curator.fullName"
            control={control}
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <TextField
                label="Full Name"
                value={value}
                onChange={onChange}
                error={error?.message}
              />
            )}
          />
          <Controller
            name="curator.position"
            control={control}
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <TextField
                label="Position"
                value={value}
                onChange={onChange}
                error={error?.message}
              />
            )}
          />
          <div className="flex w-full flex-col items-start gap-2 pl-4">
            <h2 className="text-lg font-semibold">Socials</h2>
            <div className="grid-cols-curator-socials grid gap-8 text-sm">
              <span>Type</span>
              <span>Icon</span>
              <span>URL</span>
              <span></span>
            </div>
            {curatorSocials.map((social, index) => (
              <div className="flex w-full items-center gap-8" key={index}>
                <Controller
                  name={`curator.socials.${index}.iconType`}
                  control={control}
                  render={({
                    field: { value, onChange },
                    fieldState: { error },
                  }) => (
                    <DropdownField
                      options={iconOptions}
                      value={value}
                      containerClassName="w-[128px] px-0"
                      onChange={(value) => {
                        updateExternalLinks(
                          "curator.socials",
                          value as IconType,
                          index,
                        )
                      }}
                    />
                  )}
                />
                <Icon
                  icon={
                    externalLinkObj[watch(`curator.socials.${index}.iconType`)]
                      .icon
                  }
                  className="text-2xl"
                />
                <Controller
                  name={`curator.socials.${index}.url`}
                  control={control}
                  render={({
                    field: { value, onChange },
                    fieldState: { error },
                  }) => (
                    <TextField
                      value={value}
                      containerClassName="px-0"
                      onChange={onChange}
                      error={error?.message}
                    />
                  )}
                />
                <Button.Icon
                  icon="SvgX"
                  color="plain"
                  className="p-1 hover:bg-bd-danger/10 hover:text-bd-danger"
                  onClick={() => removeCuratorSocials(index)}
                />
              </div>
            ))}
          </div>
          <Button
            btnText="Add New Social"
            size="xs"
            color="plain"
            prefixElement={<Icon icon="SvgPlus" />}
            onClick={() =>
              addCuratorSocials({ iconType: "WEB", label: "", url: "" })
            }
            className="ml-4"
          />
        </div>

        <div className="flex w-full flex-col items-start gap-2 rounded-xl bg-secondary/30 p-4  ring-[1px] ring-white/20 ">
          <h2 className="text-lg font-semibold">Tokens Availability</h2>
          <Controller
            name={`tokensAvailability.total`}
            control={control}
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <CurrencyInputField
                label="total"
                value={value}
                containerClassName="px-0"
                onChange={onChange}
                error={error?.message}
              />
            )}
          />
        </div>
        <div className="flex w-full flex-col items-start gap-2 rounded-xl bg-secondary/30 p-4  ring-[1px] ring-white/20 ">
          <h2 className="text-lg font-semibold">{"Project's Token Info"}</h2>
          <Controller
            name={`tge.projectCoin.ticker`}
            control={control}
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <TextField
                label="Ticker"
                value={value}
                containerClassName="px-0"
                onChange={onChange}
                error={error?.message}
              />
            )}
          />
          <Controller
            name="tge.projectCoin.iconUrl"
            control={control}
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <UploadField
                label="Token Image"
                fileName="project-coin-icon"
                containerClassName="px-0"
                imgUrl={undefined} // input value
                onChange={(value) => console.log(value)}
                error={error?.message}
              />
            )}
          />
        </div>
        <h2 className="text-xl font-semibold">Token Generation Section</h2>
        <div className="flex w-full flex-col items-start gap-2 rounded-xl bg-secondary/30 p-4  ring-[1px] ring-white/20 ">
          <Controller
            name={`tge.raiseTarget`}
            control={control}
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <CurrencyInputField
                label="Raise Target"
                value={value}
                containerClassName="px-0"
                onChange={onChange}
                error={error?.message}
              />
            )}
          />
          <Controller
            name={`tge.fixedCoinPriceInBorg`}
            control={control}
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <CurrencyInputField
                label="Fixed Token Price in $BORG"
                value={value}
                containerClassName="px-0"
                onChange={onChange}
                error={error?.message}
              />
            )}
          />
          <Controller
            name={`tge.tweetUrl`}
            control={control}
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <TextField
                label="Tweet Url"
                value={value}
                containerClassName="px-0"
                onChange={onChange}
                error={error?.message}
              />
            )}
          />
        </div>
        <div className="flex w-full flex-col items-start gap-4 rounded-xl bg-secondary/30 p-4  ring-[1px] ring-white/20 ">
          <h2 className="text-lg font-semibold">Liquidity Pool</h2>

          <Controller
            name={`tge.liquidityPool.name`}
            control={control}
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <TextField
                label="Name"
                value={value}
                containerClassName="px-0"
                onChange={onChange}
                error={error?.message}
              />
            )}
          />
          <Controller
            name="tge.liquidityPool.iconUrl"
            control={control}
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <UploadField
                label="Icon"
                fileName="project-coin-icon"
                containerClassName="px-0"
                imgUrl={undefined} // input value
                onChange={(value) => console.log(value)}
                error={error?.message}
              />
            )}
          />
          <Controller
            name={`tge.liquidityPool.lbpType`}
            control={control}
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <TextField
                label="LBP Type"
                value={value}
                containerClassName="px-0"
                onChange={onChange}
                error={error?.message}
              />
            )}
          />
          <Controller
            name={`tge.liquidityPool.lockingPeriod`}
            control={control}
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <TextField
                label="Locking Period"
                value={value}
                containerClassName="px-0"
                onChange={onChange}
                error={error?.message}
              />
            )}
          />
          <Controller
            name={`tge.liquidityPool.unlockDate`}
            control={control}
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <DateTimeField
                label="Unlock Date"
                value={value}
                containerClassName="px-0"
                onChange={onChange}
                error={error?.message}
              />
            )}
          />
        </div>
        <div className="flex w-full max-w-[720px] flex-col items-start gap-4 rounded-xl bg-secondary/30 p-2 py-6 ring-[1px] ring-white/20">
          <h2 className="px-4 text-xl font-semibold">Data Room</h2>
          <Controller
            name={`dataRoom.url`}
            control={control}
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <TextField
                label="Link"
                value={value}
                containerClassName="px-0"
                onChange={onChange}
                error={error?.message}
              />
            )}
          />
          <Controller
            name="dataRoom.backgroundImgUrl"
            control={control}
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <UploadField
                label="Backdrop Image"
                fileName="project-coin-icon"
                containerClassName="px-0"
                imgUrl={undefined} // input value
                onChange={(value) => console.log(value)}
                error={error?.message}
              />
            )}
          />
        </div>
        <div className="flex w-full max-w-[720px] flex-col items-start gap-4 rounded-xl bg-secondary/30 p-2 py-6 ring-[1px] ring-white/20">
          <h2 className="px-4 text-xl font-semibold">Timeline Events</h2>
          <div className="grid-cols-bo-timeline grid gap-2">
            <span className="font-semibold">Event Type</span>
            <span className="font-semibold">Date</span>
            {timelineEventOptions.map((timelineEvent, index) => {
              return (
                <>
                  <span key={"span" + index}>{timelineEvent.label}</span>
                  <Controller
                    name={`tge.liquidityPool.unlockDate`}
                    control={control}
                    render={({
                      field: { value, onChange },
                      fieldState: { error },
                    }) => (
                      <DateTimeField
                        value={value}
                        containerClassName="px-0"
                        key={index}
                        onChange={onChange}
                        error={error?.message}
                      />
                    )}
                  />
                </>
              )
            })}
          </div>
        </div>

        {/* ///////////////// */}
        {/* // more fields // */}
        {/* ///////////////// */}
        {/* <DropdownField
          label="Label"
          options={timelineEventOptions}
          value={undefined}
          onChange={(value) => console.log(value)}
        /> */}
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
