import {
  Controller,
  FieldError,
  SubmitHandler,
  useFieldArray,
  useForm,
} from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import React, { useState } from "react"
import { toast } from "react-toastify"
import { z } from "zod"

import {
  distributionTypeOptions,
  iconOptions,
  getDefaultValues,
  payoutIntervalOptions,
  setValueOptions,
} from "@/utils/back-office"
import {
  WhitelistingRequirementType,
  whitelistRequirementsObj,
} from "@/utils/constants"
import { externalLinkObj, IconLinkType } from "@/components/Button/ExternalLink"
import { CurrencyInputField } from "@/components/InputField/CurrencyInputField"
import ProjectCreatedModal from "@/components/Modal/Modals/ProjectCreatedModal"
import { projectSchema, WhitelistRequirementModel } from "../../shared/models"
import { DropdownField } from "@/components/InputField/DropdownField"
import { backendApi, CreateProjectRequest } from "@/data/backendApi"
import DateTimeField from "@/components/InputField/DateTimeField"
import CheckboxField from "@/components/InputField/CheckboxField"
import { TextField } from "@/components/InputField/TextField"
import UploadField from "@/components/InputField/UploadField"
import BoWrapper from "@/components/BackOffice/BoWrapper"
import { getStoredValue } from "@/utils/getStoredValue"
import { formatCurrencyAmount } from "@/utils/format"
import { useFormDraft } from "@/hooks/useFormDraft"
import { Button } from "@/components/Button/Button"
import { Icon } from "@/components/Icon/Icon"
import Divider from "@/components/Divider"

// schema & types
const extendedProjectSchema = projectSchema.extend({
  adminKey: z.string().min(1),
})
type FormType = z.infer<typeof extendedProjectSchema>
type IconType = Exclude<IconLinkType, "NO_ICON">

// component
const BackOffice = () => {
  const [idConfirmed, setIdConfirmed] = useState(false)
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null)

  const defaultValues =
    getStoredValue("create-new-project") ?? getDefaultValues()

  const {
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { isSubmitted },
  } = useForm<FormType>({
    defaultValues,
    resolver: zodResolver(extendedProjectSchema),
    mode: "onBlur",
  })
  useFormDraft(
    "create-new-project",
    {
      formValues: watch(),
      setValue,
      isSubmitted,
    },
    true,
    { key: "adminKey", value: "" },
  )

  // create project - api
  const { mutate: createProject, isPending } = useMutation({
    mutationFn: (payload: CreateProjectRequest) =>
      backendApi.createProject({
        project: payload.project,
        adminKey: payload.adminKey,
      }),
    onSuccess: (_, variables) => {
      toast.success("Project Created!")
      setCreatedProjectId(variables.project.info.id)
    },
    onError: (error) => {
      toast.error(error.message)
      setIdConfirmed(false)
    },
  })

  // onSubmit handler
  const onSubmit: SubmitHandler<FormType> = async (data) => {
    const { adminKey, ...project } = data

    createProject({
      project,
      adminKey,
    })
  }

  // form arrays - react hook forms
  const { append: addCuratorSocials, remove: removeCuratorSocials } =
    useFieldArray({
      control,
      name: "info.curator.socials",
    })
  const { append: addProjectLinks, remove: removeProjectLinks } = useFieldArray(
    {
      control,
      name: "info.projectLinks",
    },
  )
  const {
    append: addWhitelistRequirement,
    remove: removeWhitelistRequirement,
  } = useFieldArray({
    control,
    name: "info.whitelistRequirements",
  })

  // variable helpers
  const tokenTicker = watch("info.tge.projectCoin.ticker")
  const fixedCoinPriceInBorg = watch("info.tge.fixedCoinPriceInBorg")
  const projectLinks = watch("info.projectLinks")
  const projectId = watch("info.id")
  const adminKey = watch("adminKey")
  const isUploadDisabled = !projectId || !idConfirmed || !adminKey
  const uploadPreconditionError: FieldError = {
    type: "PRECONDITION",
    message: "Please confirm admin key & ID in first two section",
  }
  const whitelistRequirements = watch("info.whitelistRequirements")

  // various functions and handlers
  const updateExternalLinks = (
    basePath: "info.curator.socials" | "info.projectLinks",
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
    const lastPickedEventDate = watch("info.timeline")[index - 1]?.date ?? null
    if (!lastPickedEventDate) return new Date()
    return lastPickedEventDate
  }

  const setRequirementLabel = (heldAmount: number, index: number) => {
    const newLabel = `Hold ${heldAmount} BORG in your wallet`
    setValue(`info.whitelistRequirements.${index}.label`, newLabel)
    return newLabel
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

  return (
    <main className="z-[10] flex w-full max-w-full flex-col items-center gap-10 overflow-y-hidden py-[100px] font-normal text-fg-primary lg:py-[100px]">
      <h1>Create New Project</h1>
      <form
        className="max-w-screen flex w-full flex-col items-start gap-8 px-4 md:max-w-[720px]"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex w-full flex-col gap-4 rounded-2xl bg-gradient-to-b from-gray-200/20 to-gray-200/10 px-6 py-8 shadow-lg shadow-black">
          <BoWrapper title="Confirm you're an Admin">
            <Controller
              name="adminKey"
              control={control}
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
                <TextField
                  label="Admin Key"
                  type="password"
                  value={value}
                  name="admin-key"
                  error={error?.message}
                  onChange={onChange}
                />
              )}
            />
          </BoWrapper>
        </div>
        <div className="flex w-full flex-col gap-4 rounded-2xl bg-gradient-to-b from-gray-200/20 to-gray-200/10 px-6 py-8 shadow-lg shadow-black">
          <Controller
            name="info.title"
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
                    `info.id`,
                    value.toLowerCase().replaceAll(" ", "-"),
                    setValueOptions,
                  )
                }}
              />
            )}
          />
          <div className="flex w-full items-start gap-2">
            <Controller
              name="info.id"
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
                  inputClassName={idConfirmed ? "ring-brand-primary" : ""}
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
          <div className="flex flex-col items-start gap-2">
            {idConfirmed ? (
              <span className="text-sm">
                ID confirmed, you can now upload images.
              </span>
            ) : (
              <ul className="list-inside list-disc text-sm">
                <li>
                  ID will be used as a path on borgpad.com and for storing
                  images.
                </li>
                <li className="font-semibold">
                  Do not use same ID from existing projects. ID should be unique
                </li>
              </ul>
            )}
            <span className="text-sm">See mockup url below:</span>
            <span className="w-fit rounded-lg bg-secondary px-2 py-1 text-sm ring-1 ring-brand-secondary/50">{`https://borgpad.com/project/${projectId}`}</span>
          </div>
          {!idConfirmed && (
            <div className="flex w-full justify-center pt-2">
              <Button
                btnText="Confirm ID"
                disabled={!projectId}
                onClick={() => setIdConfirmed(true)}
              />
            </div>
          )}
        </div>

        <div className="flex w-full flex-col gap-4 rounded-2xl bg-gray-200/10 px-6 py-8 shadow-lg shadow-black/50">
          <Controller
            name="info.subtitle"
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
            name="info.logoUrl"
            control={control}
            render={({
              field: { value, onChange, name },
              fieldState: { error },
            }) => (
              <UploadField
                imgUrl={value} // input value
                onChange={onChange}
                adminKey={adminKey}
                disabled={isUploadDisabled}
                name={name}
                label="Project Logo"
                fileName="project-logo"
                previewClass="size-20"
                projectId={projectId}
                error={isUploadDisabled ? uploadPreconditionError : error}
              />
            )}
          />
          <div className="flex w-full flex-col">
            <Controller
              name="info.thumbnailUrl"
              control={control}
              render={({
                field: { value, onChange, name },
                fieldState: { error },
              }) => (
                <UploadField
                  imgUrl={value} // input value
                  onChange={onChange}
                  adminKey={adminKey}
                  disabled={isUploadDisabled}
                  name={name}
                  label="Project Thumbnail"
                  fileName="project-thumbnail"
                  previewClass="w-[328px] h-[189px] rounded-none"
                  projectId={projectId}
                  error={isUploadDisabled ? uploadPreconditionError : error}
                />
              )}
            />
            <span className="text-xs text-fg-tertiary">
              Recommended minimum size: 512 x 296 px.
            </span>
          </div>
          <Controller
            name="info.sector"
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
            name="info.origin"
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

          <BoWrapper title="Project Links">
            <div className="flex w-full flex-col items-start gap-2">
              <div className="grid grid-cols-curator-socials gap-8 text-sm">
                <span>Type</span>
                <span>Icon</span>
                <span>URL</span>
                <span></span>
              </div>
              {projectLinks?.map((_, index) => (
                <div className="flex w-full items-center gap-8" key={index}>
                  <Controller
                    name={`info.projectLinks.${index}.iconType`}
                    control={control}
                    render={({ field: { value }, fieldState: { error } }) => (
                      <DropdownField
                        options={iconOptions}
                        value={value}
                        error={error?.message}
                        containerClassName="w-[128px] px-0"
                        onChange={(value) => {
                          updateExternalLinks(
                            "info.projectLinks",
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
                        watch(`info.projectLinks.${index}.iconType`)
                      ].icon
                    }
                    className="text-2xl"
                  />
                  <Controller
                    name={`info.projectLinks.${index}.url`}
                    control={control}
                    render={({
                      field: { value, onChange },
                      fieldState: { error },
                    }) => (
                      <TextField
                        value={value}
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
          <BoWrapper title="Chain Info">
            <Controller
              name="info.chain.name"
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
              name="info.chain.iconUrl"
              control={control}
              render={({
                field: { value, onChange, name },
                fieldState: { error },
              }) => (
                <UploadField
                  adminKey={adminKey}
                  disabled={isUploadDisabled}
                  name={name}
                  previewClass="size-4"
                  label="Chain Icon"
                  fileName="chain-icon"
                  projectId={projectId}
                  imgUrl={value} // input value
                  onChange={onChange}
                  error={isUploadDisabled ? uploadPreconditionError : error}
                />
              )}
            />
          </BoWrapper>
          <BoWrapper title="Curator">
            <Controller
              name="info.curator.avatarUrl"
              control={control}
              render={({
                field: { value, onChange, name },
                fieldState: { error },
              }) => (
                <UploadField
                  adminKey={adminKey}
                  disabled={isUploadDisabled}
                  name={name}
                  label="Avatar"
                  previewClass="size-10"
                  fileName="curator-avatar"
                  projectId={projectId}
                  imgUrl={value} // input value
                  onChange={onChange}
                  error={isUploadDisabled ? uploadPreconditionError : error}
                />
              )}
            />
            <Controller
              name="info.curator.fullName"
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
              name="info.curator.position"
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
            <div className="flex w-full flex-col items-start gap-2">
              <h2 className="text-lg font-semibold">Socials</h2>
              <div className="grid grid-cols-curator-socials gap-8 text-sm">
                <span>Type</span>
                <span>Icon</span>
                <span>URL</span>
                <span></span>
              </div>
              {watch("info.curator.socials")?.map((_, index) => (
                <div className="flex w-full items-center gap-8" key={index}>
                  <Controller
                    name={`info.curator.socials.${index}.iconType`}
                    control={control}
                    render={({ field: { value } }) => (
                      <DropdownField
                        options={iconOptions}
                        value={value}
                        containerClassName="w-[128px] px-0"
                        onChange={(value) => {
                          updateExternalLinks(
                            "info.curator.socials",
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
                        watch(`info.curator.socials.${index}.iconType`)
                      ].icon
                    }
                    className="text-2xl"
                  />
                  <Controller
                    name={`info.curator.socials.${index}.url`}
                    control={control}
                    render={({
                      field: { value, onChange },
                      fieldState: { error },
                    }) => (
                      <TextField
                        value={value}
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
              name={`info.tge.projectCoin.ticker`}
              control={control}
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
                <TextField
                  label="Ticker"
                  value={value}
                  onChange={onChange}
                  error={error?.message}
                />
              )}
            />
            <Controller
              name="info.tge.projectCoin.iconUrl"
              control={control}
              render={({
                field: { value, onChange, name },
                fieldState: { error },
              }) => (
                <UploadField
                  adminKey={adminKey}
                  disabled={isUploadDisabled}
                  name={name}
                  label="Token Icon"
                  previewClass="size-4"
                  fileName="project-coin-icon"
                  projectId={projectId}
                  imgUrl={value} // input value
                  onChange={onChange}
                  error={isUploadDisabled ? uploadPreconditionError : error}
                />
              )}
            />
          </BoWrapper>
          <BoWrapper title="Tokens Availability">
            <div className="flex items-start gap-2">
              <Controller
                name={`info.totalTokensForSale`}
                control={control}
                render={({
                  field: { value, onChange },
                  fieldState: { error },
                }) => (
                  <CurrencyInputField
                    label="total"
                    value={value}
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
              name={`info.dataRoom.url`}
              control={control}
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
                <TextField
                  label="Link"
                  value={value}
                  onChange={onChange}
                  error={error?.message}
                />
              )}
            />
            <div className="flex flex-col items-start gap-1">
              <Controller
                name="info.dataRoom.backgroundImgUrl"
                control={control}
                render={({
                  field: { value, onChange, name },
                  fieldState: { error },
                }) => (
                  <UploadField
                    adminKey={adminKey}
                    disabled={isUploadDisabled}
                    name={name}
                    label="Backdrop Image (optional)"
                    previewClass="rounded-none h-[72px] w-[100px]"
                    fileName="data-room-backdrop"
                    projectId={projectId}
                    imgUrl={value} // input value
                    onChange={onChange}
                    error={isUploadDisabled ? uploadPreconditionError : error}
                  />
                )}
              />
              <span className="text-xs">
                Image should be black & white (see existing projects) with
                transparent background. Opacity will automatically be lowered to
                10%.
              </span>
            </div>
          </BoWrapper>
          <h2 className="pt-3 text-xl font-semibold">
            Token Generation Section
          </h2>
          <BoWrapper>
            <div className="flex items-start gap-2">
              <Controller
                name={`info.tge.raiseTarget`}
                control={control}
                render={({
                  field: { value, onChange },
                  fieldState: { error },
                }) => (
                  <CurrencyInputField
                    label="Raise Target"
                    value={value}
                    onChange={onChange}
                    error={error?.message}
                  />
                )}
              />
              <span className="mt-9 opacity-30">$BORG</span>
            </div>
            <Controller
              name={`info.tge.fixedCoinPriceInBorg`}
              control={control}
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
                <CurrencyInputField
                  label="Fixed Token Price in $BORG"
                  value={value}
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
              name={`info.tge.tweetUrl`}
              control={control}
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
                <TextField
                  label="Tweet Url - shown in Reward Distribution Phase"
                  value={value}
                  onChange={onChange}
                  error={error?.message}
                />
              )}
            />
          </BoWrapper>
          <BoWrapper title="Liquidity Pool">
            <Controller
              name={`info.tge.liquidityPool.name`}
              control={control}
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
                <TextField
                  label="Name"
                  value={value}
                  onChange={onChange}
                  error={error?.message}
                />
              )}
            />
            <Controller
              name="info.tge.liquidityPool.iconUrl"
              control={control}
              render={({
                field: { value, onChange, name },
                fieldState: { error },
              }) => (
                <UploadField
                  adminKey={adminKey}
                  disabled={isUploadDisabled}
                  label="Icon"
                  previewClass="size-4"
                  fileName="liquidity-pool-icon"
                  name={name}
                  projectId={projectId}
                  imgUrl={value} // input value
                  onChange={onChange}
                  error={isUploadDisabled ? uploadPreconditionError : error}
                />
              )}
            />
            <Controller
              name={`info.tge.liquidityPool.lbpType`}
              control={control}
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
                <TextField
                  label="LBP Type"
                  value={value}
                  onChange={onChange}
                  placeholder="e.g. Full Range"
                  error={error?.message}
                />
              )}
            />
            <Controller
              name={`info.tge.liquidityPool.lockingPeriod`}
              control={control}
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
                <TextField
                  label="Locking Period (short description)"
                  value={value}
                  placeholder="12-month lockup"
                  onChange={onChange}
                  error={error?.message}
                />
              )}
            />
            <Controller
              name={`info.tge.liquidityPool.unlockDate`}
              control={control}
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
                <DateTimeField
                  label="Unlock Date"
                  value={value}
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
              {watch("info.timeline")?.map((timelineEvent, index) => {
                return (
                  <div
                    key={index}
                    className="grid w-full grid-cols-bo-timeline gap-2"
                  >
                    <span className="self-center">{timelineEvent.label}</span>
                    <Controller
                      name={`info.timeline.${index}.date`}
                      control={control}
                      render={({
                        field: { value, onChange },
                        fieldState: { error },
                      }) => (
                        <DateTimeField
                          value={value}
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
              {whitelistRequirements?.map((requirement, index) => {
                return (
                  <div
                    key={index}
                    className="relative flex min-h-[40px] w-full items-center justify-between gap-4 rounded-md py-3 pl-3 ring-1 ring-brand-primary/20"
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-semibold">
                        {watch(`info.whitelistRequirements.${index}.label`)}
                      </span>
                      <Controller
                        name={`info.whitelistRequirements.${index}.isMandatory`}
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
                          name={`info.whitelistRequirements.${index}.heldAmount`}
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
                              onChange={(event) => {
                                onChange(event)
                                setRequirementLabel(
                                  event ? Number(event) : 20000,
                                  index,
                                )
                              }}
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
              {getMissingRequirements(whitelistRequirements)?.map((item) => (
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
              ))}
            </div>
          </BoWrapper>

          <div className="flex w-full justify-center pt-6">
            <Divider icon="SvgMedal" />
          </div>
          <BoWrapper title="Rewards">
            <Controller
              name={`rewards.description`}
              control={control}
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
                <TextField
                  label="Description"
                  value={value}
                  onChange={onChange}
                  placeholder="linearly paid-out through 12 months"
                  error={error?.message}
                />
              )}
            />
            <Controller
              name={`rewards.payoutInterval`}
              control={control}
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
                <DropdownField
                  options={payoutIntervalOptions}
                  label="Payout Interval"
                  value={value}
                  error={error?.message}
                  containerClassName="w-full px-0"
                  onChange={onChange}
                />
              )}
            />
            <Controller
              name={`rewards.distributionType`}
              control={control}
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
                <DropdownField
                  label="Distribution Type"
                  options={distributionTypeOptions}
                  value={value}
                  error={error?.message}
                  containerClassName="w-full px-0"
                  onChange={onChange}
                />
              )}
            />
          </BoWrapper>
        </div>
        <div className="flex w-full justify-center pt-3">
          <Button
            btnText="Create Project"
            type="submit"
            size="md"
            className="px-10"
            isLoading={isPending}
          />
        </div>
      </form>

      {createdProjectId && (
        <ProjectCreatedModal
          onClose={() => setCreatedProjectId(null)}
          projectId={createdProjectId}
        />
      )}
      {/* @TODO - remove this component when feature is finished */}
      {/* <div className="fixed right-4 top-[75vh] flex flex-col  gap-4 rounded-3xl bg-pink-100/10 p-4 ring-brand-primary">
        <Button
          isLoading={isPending}
          onClick={() => {
            // toast.success("Project Created!")
            // eslint-disable-next-line no-console
            console.log("formValues: ", watch())
            // eslint-disable-next-line no-console
            console.log("errors: ", errors)
          }}
          btnText="LOG VALUES"
          className="bg-pink-500 text-white active:bg-pink-300"
        />
      </div> */}
    </main>
  )
}

export default BackOffice
