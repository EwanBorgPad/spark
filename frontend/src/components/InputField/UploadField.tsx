import { HTMLProps } from "@/@types/general"
import React, { useRef, useState } from "react"
import { twMerge } from "tailwind-merge"
import { Button } from "../Button/Button"
import { backendApi } from "@/data/backendApi"

type UploadFieldProps = HTMLProps<"input"> & {
  containerClassName?: HTMLProps["className"]
  inputClassName?: HTMLProps["className"]
  error?: string
  label?: string
  imgUrl: string | undefined // image source URL
  onChange: (value: string) => void
  fileName: string
}

const UploadField = ({
  containerClassName: _containerClassName,
  inputClassName,
  error,
  label,
  imgUrl,
  onChange,
  fileName,
  ...props
}: UploadFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  // const [file, setFile] = useState<File>()
  const [preview, setPreview] = useState<string | ArrayBuffer | null>(
    imgUrl ?? null,
  )
  const [uploading, setUploading] = useState(false)

  const handleOnChange = async (e: React.FormEvent<HTMLInputElement>) => {
    setUploading(true)
    const target = e.target as HTMLInputElement & {
      files: FileList
    }
    if (!target.files[0]) return
    const selectedFile = target.files[0]

    await uploadFile(selectedFile)

    const file = new FileReader()

    file.onload = function () {
      setPreview(file.result)
    }
    file.readAsDataURL(target.files[0])
    // onChange(imgUrl)
    setUploading(false)
  }

  const uploadFile = async (file: File) => {
    // try {
    //   const presignedUrlResponse = await backendApi.getPresignedUrl({
    //     fileName,
    //   })
    //   const presignedUrl = presignedUrlResponse.signedUrl
    //   console.log("presignedUrl: ", presignedUrl)
    //   const response = await backendApi.uploadFileToBucket({
    //     presignedUrl,
    //     file,
    //   })
    //   console.log(response)
    // } catch (error) {
    //   console.log(error)
    // }
  }

  const containerClassName = twMerge(
    "text-sm w-full flex flex-col items-start gap-2 px-4 cursor-text max-w-[360px]",
    _containerClassName,
  )

  return (
    <div className={containerClassName}>
      <label htmlFor={props.name} className="font-medium">
        {label}
      </label>
      <input
        hidden
        ref={inputRef}
        type="file"
        onChange={handleOnChange}
        accept="image/png, image/jpg"
      />
      <Button
        color="secondary"
        btnText="Upload"
        isLoading={uploading}
        onClick={() => inputRef.current?.click()}
      />
      {error && (
        <span className="-mt-1 text-xs text-fg-error-primary">{error}</span>
      )}
      {preview && (
        <img
          src={preview as string}
          className="h-[120px] w-auto object-cover"
        />
      )}
    </div>
  )
}

export default UploadField
