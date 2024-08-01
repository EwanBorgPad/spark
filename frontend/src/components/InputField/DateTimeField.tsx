import { HTMLProps } from "@/@types/general"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

import { twMerge } from "tailwind-merge"

type DateTimeFieldProps = {
  containerClassName?: HTMLProps["className"]
  inputClassName?: HTMLProps["className"]
  error?: string
  label?: string
  minDate?: Date
  value: Date | undefined
  onChange: (value: unknown) => void
}
const DateTimeField = ({
  error,
  containerClassName: _containerClassName,
  inputClassName,
  label,
  value,
  onChange,
  minDate,
}: DateTimeFieldProps) => {
  const containerClassName = twMerge(
    "text-sm w-full flex flex-col items-start px-4 cursor-text max-w-[360px]",
    _containerClassName,
  )

  const inputClasses = twMerge(
    "py-2.5 outline-1 focus:!outline-none bg-secondary flex-grow placeholder:text-gray-400 truncate ring-1 ring-bd-secondary rounded-lg px-2 border-none h-[40px] w-[360px]",
    "focus:ring-2 focus:ring-bd-disabled",
    error && "ring-1 ring-bd-danger focus:ring-bd-danger",
    inputClassName,
  )

  return (
    <div className={containerClassName}>
      {label && <label className="pb-2 font-medium">{label}</label>}
      <DatePicker
        showIcon
        selected={value}
        onChange={(date) => {
          onChange(date)
        }}
        minDate={minDate}
        showTimeSelect
        dateFormat="MMMM d, yyyy h:mm aa (z)"
        className={inputClasses}
      />
      {error && (
        <span className="-mt-1 pt-1 text-xs text-fg-error-primary">
          {error}
        </span>
      )}
    </div>
  )
}

export default DateTimeField
