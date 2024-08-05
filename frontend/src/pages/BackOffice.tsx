import { useMutation } from "@tanstack/react-query"
import React, { useState } from "react"
import {
  Controller,
  SubmitHandler,
  useFieldArray,
  useForm,
} from "react-hook-form"

import { externalLinkObj, IconLinkType } from "@/components/Button/ExternalLink"
import { CurrencyInputField } from "@/components/InputField/CurrencyInputField"
import { DropdownField } from "@/components/InputField/DropdownField"
import DateTimeField from "@/components/InputField/DateTimeField"
import { getDefaultValues } from "@/utils/projectDefaultValues"
import { TextField } from "@/components/InputField/TextField"
import UploadField from "@/components/InputField/UploadField"
import BoWrapper from "@/components/BackOffice/BoWrapper"
import { formatCurrencyAmount } from "@/utils/format"
import { useFormDraft } from "@/hooks/useFormDraft"
import { Button } from "@/components/Button/Button"
import { backendApi } from "@/data/backendApi"
import { Icon } from "@/components/Icon/Icon"
import { ProjectModel, WhitelistRequirementModel } from "shared/models"
import CheckboxField from "@/components/InputField/CheckboxField"
import {
  WhitelistingRequirementType,
  whitelistRequirementsObj,
} from "@/utils/constants"

const iconOptions = Object.entries(externalLinkObj).map(([key, value]) => ({
  id: key,
  label: value.label,
}))
type IconType = Exclude<IconLinkType, "NO_ICON">

const valueOptions = {
  shouldDirty: true,
  shouldValidate: true,
}

const BackOffice = () => {
  const [idConfirmed, setIdConfirmed] = useState(false)

  const {
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitted },
  } = useForm<ProjectModel["info"]>({
    defaultValues: getDefaultValues(),
  })
  useFormDraft("create-new-project", {
    formValues: watch(),
    setValue,
    isSubmitted,
  })

  const { mutate: createProject, isPending } = useMutation({
    mutationFn: (projectInfo: ProjectModel) =>
      backendApi.createProject(projectInfo),
  })

  const onSubmit: SubmitHandler<ProjectModel["info"]> = async (data) => {
    const response = await createProject({ info: data })
    console.log(response)
  }

  // form arrays
  const { append: addCuratorSocials, remove: removeCuratorSocials } =
    useFieldArray({
      control,
      name: "curator.socials",
    })
  const { append: addProjectLinks, remove: removeProjectLinks } = useFieldArray(
    {
      control,
      name: "projectLinks",
    },
  )
  const {
    append: addWhitelistRequirement,
    remove: removeWhitelistRequirement,
  } = useFieldArray({
    control,
    name: "whitelistRequirements",
  })

  // component handlers
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
  const getMinDate = (index: number) => {
    const lastPickedEventDate = watch("timeline")[index - 1]?.date ?? null
    if (!lastPickedEventDate) return new Date()
    return lastPickedEventDate
  }

  const tokenTicker = watch("tge.projectCoin.ticker")
  const fixedCoinPriceInBorg = watch("tge.fixedCoinPriceInBorg")

  const getRequirementLabel = (
    requirement: WhitelistRequirementModel,
    index: number,
  ) => {
    if (requirement.type !== "HOLD_BORG_IN_WALLET") return requirement.label
    return requirement.label.replace(
      "XXXXX",
      watch("whitelistRequirements")[index]?.heldAmount + "",
    )
  }

  const getMissingRequirements = (
    requirements: WhitelistRequirementModel[],
  ) => {
    const selectedTypes = requirements?.map((req) => req.type) ?? []
    const allKeys = Object.keys(
      whitelistRequirementsObj,
    ) as WhitelistingRequirementType[]

    const missingKeys = allKeys.filter((x) => !selectedTypes.includes(x))
    return missingKeys.map((key) => ({
      type: key,
      ...whitelistRequirementsObj[key],
    }))
  }
  getMissingRequirements(watch("whitelistRequirements"))

  return (
    <main className="z-[10] flex w-full max-w-full flex-col items-center gap-10 overflow-y-hidden py-[72px] font-normal text-fg-primary lg:py-[100px]">
      <h1>Create New Project</h1>
      <form
        className="max-w-screen flex w-full flex-col items-start gap-8 px-4 md:max-w-[720px]"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex w-full flex-col gap-4 rounded-2xl bg-gradient-to-b from-black/40 to-black/20 px-6 py-8 shadow-lg shadow-black/50">
          <Controller
            name="title"
            control={control}
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <TextField
                label="Project Title"
                value={value}
                error={error?.message}
                onChange={(event) => {
                  onChange(event)
                  const value = (event as React.ChangeEvent<HTMLInputElement>)
                    .target.value
                  if (idConfirmed) return
                  setValue(
                    `id`,
                    value.toLowerCase().replaceAll(" ", "-"),
                    valueOptions,
                  )
                }}
              />
            )}
          />
          <div className="flex w-full items-start">
            <Controller
              name="id"
              control={control}
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
                <TextField
                  disabled={idConfirmed}
                  label="Project ID"
                  value={value}
                  onChange={onChange}
                  error={error?.message}
                />
              )}
            />
            {idConfirmed && (
              <div className="flex items-center gap-1 pt-9">
                <Icon icon="SvgRoundCheckmark" />
                <span className="text-brand-primary">Confirmed</span>
              </div>
            )}
          </div>
          <div className="flex flex-col items-start gap-2 px-4">
            {idConfirmed ? (
              <span className="text-sm">
                ID confirmed and used for a file folder for storing images.
              </span>
            ) : (
              <ul className="list-inside list-disc text-sm">
                <li>Project ID should be unique.</li>
                <li>
                  ID will be used as a path on borgpad.com and as a file folder
                  for storing images.
                </li>
                <li>Once you confirm it you will not be able to change it.</li>
                <li className="font-semibold">
                  Do not use same ID from existing projects.
                </li>
              </ul>
            )}
            <span className="text-sm">See mockup url below:</span>
            <span className="w-fit rounded-lg bg-secondary px-2 py-1 text-sm ring-1 ring-brand-secondary/50">{`https://borgpad.com/project/${watch("id")}`}</span>
          </div>
          {!idConfirmed && (
            <div className="flex w-full justify-center pt-2">
              <Button
                btnText="Confirm ID"
                onClick={() => setIdConfirmed(true)}
              />
            </div>
          )}
        </div>

        <div className="flex w-full flex-col gap-4 rounded-2xl bg-gradient-to-b from-black/40 to-black/20 px-6 py-8  shadow-lg shadow-black/50">
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
                disabled // @TODO - remove "disabled" when file upload is ready
                label="Project Logo"
                fileName="avatar.png"
                imgUrl={undefined} // input value
                onChange={(value) => console.log(value)}
                error={error?.message}
              />
            )}
          />
          <Controller
            name="sector"
            control={control}
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <TextField
                label="Sector"
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

          <BoWrapper title="Chain Info">
            <Controller
              name="chain.name"
              control={control}
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
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
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
                <UploadField
                  disabled // @TODO - remove "disabled" when file upload is ready
                  label="Project Avatar"
                  fileName="chain-icon.png"
                  imgUrl={undefined} // input value
                  onChange={(value) => console.log(value)}
                  error={error?.message}
                />
              )}
            />
          </BoWrapper>

          <BoWrapper title="Project Links">
            <div className="flex w-full flex-col items-start gap-2 pl-4">
              <div className="grid grid-cols-curator-socials gap-8 text-sm">
                <span>Type</span>
                <span>Icon</span>
                <span>URL</span>
                <span></span>
              </div>
              {watch("projectLinks")?.map((_, index) => (
                <div className="flex w-full items-center gap-8" key={index}>
                  <Controller
                    name={`projectLinks.${index}.iconType`}
                    control={control}
                    render={({ field: { value }, fieldState: { error } }) => (
                      <DropdownField
                        options={iconOptions}
                        value={value}
                        error={error?.message}
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
          </BoWrapper>
          <BoWrapper title="Curator">
            <Controller
              name="curator.avatarUrl"
              control={control}
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
                <UploadField
                  disabled // @TODO - remove "disabled" when file upload is ready
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
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
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
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
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
              <div className="grid grid-cols-curator-socials gap-8 text-sm">
                <span>Type</span>
                <span>Icon</span>
                <span>URL</span>
                <span></span>
              </div>
              {watch("curator.socials")?.map((_, index) => (
                <div className="flex w-full items-center gap-8" key={index}>
                  <Controller
                    name={`curator.socials.${index}.iconType`}
                    control={control}
                    render={({ field: { value }, fieldState: { error } }) => (
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
                      externalLinkObj[
                        watch(`curator.socials.${index}.iconType`)
                      ].icon
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
          </BoWrapper>
          <BoWrapper title="Project's Token Info">
            <Controller
              name={`tge.projectCoin.ticker`}
              control={control}
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
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
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
                <UploadField
                  disabled // @TODO - remove "disabled" when file upload is ready
                  label="Token Image"
                  fileName="project-coin-icon"
                  containerClassName="px-0"
                  imgUrl={undefined} // input value
                  onChange={(value) => console.log(value)}
                  error={error?.message}
                />
              )}
            />
          </BoWrapper>
          <BoWrapper title="Tokens Availability">
            <div className="flex items-start gap-2">
              <Controller
                name={`totalTokensForSale`}
                control={control}
                render={({
                  field: { value, onChange },
                  fieldState: { error },
                }) => (
                  <CurrencyInputField
                    label="total"
                    value={value}
                    containerClassName="px-0"
                    onChange={onChange}
                    error={error?.message}
                  />
                )}
              />
              {tokenTicker && (
                <span className="mt-9 opacity-30">${tokenTicker}</span>
              )}
            </div>
          </BoWrapper>

          <BoWrapper title="Data Room">
            <Controller
              name={`dataRoom.url`}
              control={control}
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
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
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
                <UploadField
                  disabled // @TODO - remove "disabled" when file upload is ready
                  label="Backdrop Image"
                  fileName="project-coin-icon"
                  containerClassName="px-0"
                  imgUrl={undefined} // input value
                  onChange={(value) => console.log(value)}
                  error={error?.message}
                />
              )}
            />
          </BoWrapper>
          <h2 className="pt-3 text-xl font-semibold">
            Token Generation Section
          </h2>
          <BoWrapper>
            <div className="flex items-start gap-2">
              <Controller
                name={`tge.raiseTarget`}
                control={control}
                render={({
                  field: { value, onChange },
                  fieldState: { error },
                }) => (
                  <CurrencyInputField
                    label="Raise Target"
                    value={value}
                    containerClassName="px-0"
                    onChange={onChange}
                    error={error?.message}
                  />
                )}
              />
              <span className="mt-9 opacity-30">$BORG</span>
            </div>
            <Controller
              name={`tge.fixedCoinPriceInBorg`}
              control={control}
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
                <CurrencyInputField
                  label="Fixed Token Price in $BORG"
                  value={value}
                  containerClassName="px-0"
                  onChange={onChange}
                  error={error?.message}
                />
              )}
            />
            {!!tokenTicker && !!fixedCoinPriceInBorg && (
              <p>
                <span className="font-mono"></span>1{" "}
                <span className="opacity-50">${tokenTicker}</span> ={" "}
                <span className="font-mono">
                  {formatCurrencyAmount(fixedCoinPriceInBorg, false, 6)}
                </span>{" "}
                <span className="opacity-50">$BORG</span>
              </p>
            )}
            <Controller
              name={`tge.tweetUrl`}
              control={control}
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
                <TextField
                  label="Tweet Url"
                  value={value}
                  containerClassName="px-0"
                  onChange={onChange}
                  error={error?.message}
                />
              )}
            />
          </BoWrapper>
          <BoWrapper title="Liquidity Pool">
            <Controller
              name={`tge.liquidityPool.name`}
              control={control}
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
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
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
                <UploadField
                  disabled // @TODO - remove "disabled" when file upload is ready
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
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
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
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
                <TextField
                  label="Locking Period (short description)"
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
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
                <DateTimeField
                  label="Unlock Date"
                  value={value}
                  containerClassName="px-0"
                  onChange={onChange}
                  error={error?.message}
                />
              )}
            />
          </BoWrapper>

          <BoWrapper title="Timeline Events">
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-bo-timeline gap-2">
                <span className="self-center">Event Type</span>
                <span className="font-semibold">Date</span>
              </div>
              {watch("timeline")?.map((timelineEvent, index) => {
                return (
                  <div
                    key={index}
                    className="grid w-full grid-cols-bo-timeline gap-2"
                  >
                    <span className="self-center">{timelineEvent.label}</span>
                    <Controller
                      name={`timeline.${index}.date`}
                      control={control}
                      render={({
                        field: { value, onChange },
                        fieldState: { error },
                      }) => (
                        <DateTimeField
                          value={value}
                          containerClassName="px-0"
                          onChange={onChange}
                          error={error?.message}
                          minDate={getMinDate(index)}
                        />
                      )}
                    />
                  </div>
                )
              })}
            </div>
          </BoWrapper>
          <BoWrapper title="Whitelist Requirements">
            <div className="flex w-full flex-col gap-2">
              {watch("whitelistRequirements")?.map((requirement, index) => {
                return (
                  <div
                    key={index}
                    className="relative flex min-h-[40px] w-full items-center justify-between gap-4 rounded-md py-3 pl-3 ring-1 ring-brand-primary/20"
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-semibold">
                        {getRequirementLabel(requirement, index)}
                      </span>
                      <Controller
                        name={`whitelistRequirements.${index}.isMandatory`}
                        control={control}
                        render={({
                          field: { value, onChange },
                          fieldState: { error },
                        }) => {
                          return (
                            <CheckboxField
                              value={value}
                              onChange={onChange}
                              label="Is Mandatory"
                              error={error?.message}
                            />
                          )
                        }}
                      />
                      {requirement.type === "HOLD_BORG_IN_WALLET" && (
                        <Controller
                          name={`whitelistRequirements.${index}.heldAmount`}
                          control={control}
                          render={({
                            field: { value, onChange },
                            fieldState: { error },
                          }) => (
                            <CurrencyInputField
                              label="Held Amount"
                              value={value}
                              defaultValue={value}
                              containerClassName="px-0 pt-2"
                              onChange={onChange}
                              error={error?.message}
                            />
                          )}
                        />
                      )}
                    </div>
                    <Button.Icon
                      icon="SvgX"
                      color="plain"
                      className="absolute right-1 top-1 p-1 hover:bg-bd-danger/10 hover:text-bd-danger"
                      onClick={() => removeWhitelistRequirement(index)}
                    />
                  </div>
                )
              })}
              {getMissingRequirements(watch("whitelistRequirements"))?.map(
                (item) => (
                  <div
                    key={item.type}
                    className="flex items-center gap-2 opacity-30 hover:opacity-100"
                  >
                    <Button.Icon
                      icon="SvgPlus"
                      color="secondary"
                      size="xs"
                      onClick={() => addWhitelistRequirement(item)}
                    />
                    <span>Add</span>
                    <span>{`"${item.label}"`}</span>
                  </div>
                ),
              )}
            </div>
          </BoWrapper>
        </div>
        <div className="flex w-full justify-center pt-3">
          <Button
            btnText="Create Project"
            type="submit"
            size="md"
            className="px-10"
          />
        </div>
      </form>

      {/* @TODO - remove this component when feature is finished */}
      <div className="fixed right-4 top-[75vh] rounded-3xl bg-pink-100/10  p-4 ring-brand-primary">
        <Button
          isLoading={isPending}
          onClick={() => {
            // eslint-disable-next-line no-console
            console.log("formValues: ", watch())
            // eslint-disable-next-line no-console
            console.log("errors: ", errors)
          }}
          btnText="LOG VALUES"
          className="bg-pink-500 text-white active:bg-pink-300"
        />
      </div>
    </main>
  )
}

export default BackOffice
