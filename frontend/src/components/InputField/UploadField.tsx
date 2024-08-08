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
  projectId: string
}

const UploadField = ({
  containerClassName: _containerClassName,
  inputClassName,
  error,
  label,
  imgUrl,
  onChange,
  fileName,
  projectId,
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

    try {
      const publicUrl = await uploadFile(selectedFile)

      onChange(publicUrl)
      setPreview(publicUrl)
      // const file = new FileReader()
      // file.onload = function () {
      //   setPreview(file.result)
      // }
      // file.readAsDataURL(target.files[0])
    } catch (e) {
      console.error(e)
    }

    setUploading(false)
  }

  const uploadFile = async (file: File) => {
    const presignedUrlResponse = await backendApi.getPresignedUrl({
      fileName,
      projectId,
    })
    console.log("presignedUrlResponse: ", presignedUrlResponse)
    const { signedUrl: presignedUrl, publicUrl } = presignedUrlResponse

    await backendApi.uploadFileToBucket({
      presignedUrl,
      file,
    })

    return publicUrl
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
