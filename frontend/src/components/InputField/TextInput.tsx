import { twMerge as classNames } from "tailwind-merge"
import { forwardRef, PropsWithChildren } from "react"
import { HTMLProps } from "@/@types/general"

type TextInputProps = HTMLProps<"input"> & {
  containerClassName?: HTMLProps["className"]
  inputClassName?: HTMLProps["className"]
  error?: PropsWithChildren["children"]
  prefixElement?: PropsWithChildren["children"]
  suffixElement?: PropsWithChildren["children"]
  disableFocusRing?: boolean
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      error,
      prefixElement,
      suffixElement,
      containerClassName: _containerClassName,
      disableFocusRing = false,
      inputClassName,
      disabled,
      ...props
    },
    ref,
  ) => {
    const containerClassName = classNames(
      "text-sm bg-white rounded w-full mb-0 flex items-center px-4 cursor-text bg-transparent",
      error && "bg-red-100 focus-within:bg-red-100",
      !disableFocusRing && "focus-within-ring",
      _containerClassName,
    )
    const inputClasses = classNames(
      "py-2.5 w-full focus:outline-0 bg-transparent flex-grow placeholder:text-gray-400 font-medium placeholder:font-medium truncate",
      inputClassName,
    )

    return (
      <div className={containerClassName}>
        {prefixElement}
        <input
          disabled={disabled}
          ref={ref}
          {...props}
          className={inputClasses}
        />
        {suffixElement}
      </div>
    )
  },
)
TextInput.displayName = "TextInput"
