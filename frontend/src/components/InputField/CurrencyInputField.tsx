import { HTMLProps } from "@/@types/general"
import React, { forwardRef, PropsWithChildren } from "react"
import CurrencyInput from "react-currency-input-field"
import { twMerge } from "tailwind-merge"

type CurrencyInputFieldProps = HTMLProps<"input"> & {
  containerClassName?: HTMLProps["className"]
  inputClassName?: HTMLProps["className"]
  error?: string
  prefixElement?: PropsWithChildren["children"]
  suffixElement?: PropsWithChildren["children"]
  disableFocusRing?: boolean
  label?: string
  onChange: (value: string) => void
  value: number | undefined
}

export const CurrencyInputField = forwardRef(
  (
    {
      error,
      prefixElement,
      suffixElement,
      containerClassName: _containerClassName,
      disableFocusRing = false,
      inputClassName,
      value,
      onChange,
      disabled,
      label,
      ...props
    }: CurrencyInputFieldProps,
    ref,
  ) => {
    const containerClassName = twMerge(
      "text-sm w-full flex flex-col items-start gap-2 px-4 cursor-text",
      _containerClassName,
    )
    const inputClasses = twMerge(
      "py-2.5 w-full focus:outline-0 bg-secondary flex-grow placeholder:text-gray-400 truncate ring-1 ring-bd-secondary rounded-lg px-2",
      "focus-within:ring-2 focus-within:ring-bd-disabled",
      error && "ring-1 ring-bd-danger focus-within:ring-bd-danger",
      inputClassName,
    )

    return (
      <div className={containerClassName}>
        <label htmlFor={props.name} className="font-medium">
          {label}
        </label>
        <div className={inputClasses}>
          <CurrencyInput
            value={value}
            allowNegativeValue={false}
            placeholder="0"
            className={
              "max-w-[242px] bg-transparent font-geist-mono text-sm focus:outline-none"
            }
            decimalsLimit={6}
            onValueChange={(value) => onChange(value ?? "")}
          />
        </div>
      </div>
    )
  },
)
CurrencyInputField.displayName = "CurrencyInputField"
