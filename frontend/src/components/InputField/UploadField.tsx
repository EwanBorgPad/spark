import { HTMLProps } from "@/@types/general"
import React, { useEffect, useRef, useState } from "react"
import { twMerge } from "tailwind-merge"
import { Button } from "../Button/Button"
import { backendApi } from "@/data/backendApi"
import { MAX_IMAGE_SIZE } from "@/utils/constants"
import { FieldError } from "react-hook-form"

const maxFileSizeInMB = MAX_IMAGE_SIZE / 1024 / 1024

type UploadFieldProps = {
  containerClassName?: HTMLProps["className"]
  inputClassName?: HTMLProps["className"]
  error?: FieldError
  label?: string
  imgUrl: string | undefined // image source URL
  onChange: (value: string) => void
  fileName: string
  projectId: string
  disabled: boolean
  name: string
  previewClass?: string
  adminKey: string
}

const UploadField = ({
  containerClassName: _containerClassName,
  error,
  label,
  imgUrl,
  onChange,
  fileName,
  projectId,
  name,
  disabled,
  previewClass,
  adminKey,
}: UploadFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | ArrayBuffer | null>(
    imgUrl ?? null,
  )
  const [uploading, setUploading] = useState(false)
  const [customError, setCustomError] = useState<string>("")

  const handleOnChange = async (e: React.FormEvent<HTMLInputElement>) => {
    setUploading(true)
    const target = e.target as HTMLInputElement & {
      files: FileList
    }
    if (!target.files[0]) return
    if (preview) setPreview("")

    const selectedFile = target.files[0]

    if (selectedFile.size > MAX_IMAGE_SIZE) {
      setCustomError(
        `File size too big. Upload files smaller than ${maxFileSizeInMB}MB`,
      )
      setUploading(false)
      return
    }

    try {
      const publicUrl = await uploadFile(selectedFile)
      onChange(publicUrl)
    } catch (e) {
      console.error(e)
    }

    setUploading(false)
  }

  const uploadFile = async (file: File) => {
    const presignedUrlResponse = await backendApi.getPresignedUrl({
      fileName: fileName + "-" + Math.floor(Math.random() * 1000000000),
      projectId,
      adminKey,
    })
    if (!presignedUrlResponse) throw "pre-signing url failed"
    const { signedUrl: presignedUrl, publicUrl } = presignedUrlResponse

    await backendApi.uploadFileToBucket({
      presignedUrl,
      file,
    })

    return publicUrl
  }

  const refreshPreview = (url?: string) => {
    if (!url) return
    setPreview(url)
  }

  useEffect(() => {
    refreshPreview(imgUrl)
  }, [imgUrl])

  const containerClassName = twMerge(
    "text-sm w-full flex flex-col items-start gap-2 cursor-text max-w-[360px]",
    _containerClassName,
  )

  return (
    <div className={containerClassName}>
      <label htmlFor={name} className="font-medium">
        {label}
      </label>
      <input
        hidden
        ref={inputRef}
        type="file"
        onChange={handleOnChange}
        accept="image/png, image/jpg, image/svg+xml"
      />
      <div className="flex flex-col items-center gap-4">
        {preview && (
          <div className="flex flex-col items-center gap-4 rounded bg-white/10 px-4 py-2">
            <div className="flex flex-col items-center">
              <span className="text-sm">Preview</span>
              <span className="text-sm">(expected size)</span>
            </div>
            <div
              className={twMerge(
                "shrink-0 overflow-hidden rounded-full",
                previewClass,
              )}
            >
              <img
                src={preview as string}
                className={"h-full w-full object-cover"}
              />
            </div>
          </div>
        )}
        <div className="flex flex-col items-center">
          <Button
            color="secondary"
            btnText={"Upload"}
            disabled={disabled}
            isLoading={uploading}
            onClick={() => inputRef.current?.click()}
          />
          <span className="text-[8px] text-white/70">{`Max ${maxFileSizeInMB}MB`}</span>
        </div>
      </div>
      {(error || !!customError) && (
        <span
          className={twMerge(
            "-mt-1 text-xs text-fg-error-primary",
            error?.type === "PRECONDITION" && "text-orange-400",
          )}
        >
          {error?.message || customError}
        </span>
      )}
    </div>
  )
}

export default UploadField
