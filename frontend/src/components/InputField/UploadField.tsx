import { HTMLProps } from "@/@types/general"
import React, { useRef, useState } from "react"
import { twMerge } from "tailwind-merge"
import { Button } from "../Button/Button"

type UploadFieldProps = HTMLProps<"input"> & {
  containerClassName?: HTMLProps["className"]
  inputClassName?: HTMLProps["className"]
  error?: string
  label?: string
  imgUrl: string | undefined // image source URL
  onChange: (value: string) => void
}

const UploadField = ({
  containerClassName: _containerClassName,
  inputClassName,
  error,
  label,
  imgUrl,
  onChange,
  ...props
}: UploadFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  // const [file, setFile] = useState<File>()
  const [preview, setPreview] = useState<string | ArrayBuffer | null>(
    imgUrl ?? null,
  )
  const [uploading, setUploading] = useState(false)

  const handleOnChange = (e: React.FormEvent<HTMLInputElement>) => {
    setUploading(true)
    const target = e.target as HTMLInputElement & {
      files: FileList
    }
    if (!target.files[0]) return
    // setFile(target.files[0])

    // @TODO - upload to Cloudflare

    const file = new FileReader()

    file.onload = function () {
      setPreview(file.result)
    }
    file.readAsDataURL(target.files[0])
    // onChange(imgUrl)
    setUploading(false)
  }

  const containerClassName = twMerge(
    "text-sm w-full flex flex-col items-start gap-2 px-4 cursor-text",
    _containerClassName,
  )
  //   const inputClasses = twMerge(
  //     "py-2.5 w-full focus:outline-0 bg-secondary flex-grow placeholder:text-gray-400 truncate ring-1 ring-bd-secondary rounded-lg px-2",
  //     "focus:ring-2 focus:ring-bd-disabled",
  //     error && "ring-1 ring-bd-danger focus:ring-bd-danger",
  //     inputClassName,
  //   )

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
