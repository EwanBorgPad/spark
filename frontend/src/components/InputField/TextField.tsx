import { twMerge } from "tailwind-merge"
import { forwardRef, PropsWithChildren } from "react"
import { HTMLProps } from "@/@types/general"

type TextFieldProps = HTMLProps<"input"> & {
  containerClassName?: HTMLProps["className"]
  inputClassName?: HTMLProps["className"]
  error?: string
  prefixElement?: PropsWithChildren["children"]
  suffixElement?: PropsWithChildren["children"]
  disableFocusRing?: boolean
  label?: string
  value: string | undefined
  onChange: (value: string) => void
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      error,
      prefixElement,
      suffixElement,
      containerClassName: _containerClassName,
      disableFocusRing = false,
      inputClassName,
      disabled,
      label,
      ...props
    },
    ref,
  ) => {
    const containerClassName = twMerge(
      "text-sm w-full flex flex-col items-start gap-2 px-4 cursor-text",
      _containerClassName,
    )
    const inputClasses = twMerge(
      "py-2.5 w-full focus:outline-0 bg-secondary flex-grow placeholder:text-gray-400 truncate ring-1 ring-bd-secondary rounded-lg px-2",
      "focus:ring-2 focus:ring-bd-disabled",
      error && "ring-1 ring-bd-danger focus:ring-bd-danger",
      disableFocusRing && "focus:ring-0",
      inputClassName,
    )

    return (
      <div className={containerClassName}>
        <label htmlFor={props.name} className="font-medium">
          {label}
        </label>
        <input
          disabled={disabled}
          ref={ref}
          {...props}
          className={inputClasses}
        />
        {error && (
          <span className="-mt-1 text-xs text-fg-error-primary">{error}</span>
        )}
      </div>
    )
  },
)
TextField.displayName = "TextField"
