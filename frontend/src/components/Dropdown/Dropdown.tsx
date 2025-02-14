import { useRef, useState } from "react"
import { Icon } from '../Icon/Icon'
import { twMerge } from 'tailwind-merge'
import { useCheckOutsideClick } from '@/hooks/useCheckOutsideClick'

type Option = {
  value: string
  label: string
}

type SelectorProps = {
  options: Option[]
  selected: string
  onChange: (value: string) => void
  placeholder?: string

  baseColor?: string
  accentColor?: string
}

export function DropdownSelector({ options, selected, onChange, placeholder, baseColor, accentColor }: SelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useCheckOutsideClick(ref, () => isOpen && setIsOpen(false), [ref])

  const selectedLabel = options.find((opt) => opt.value === selected)?.label || placeholder || "Select an option"

  baseColor ??= 'gray-200'
  accentColor ??= 'gray-600'
  baseColor = 'bg-' + baseColor
  accentColor = 'hover:bg-' + accentColor

  return (
    <div
      ref={ref}
      className="relative w-64 z-10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={twMerge(
          "w-full flex justify-between items-center", 
          "px-4 py-2 border rounded-lg shadow-md",
          baseColor, accentColor,
        )}
      >
        {selectedLabel}
        <Icon
          className={twMerge(
            "transition-transform duration-150",
            isOpen && "rotate-180 transform",
          )}
          icon={"SvgChevronDown"}
        />
      </button>
      {isOpen && (
        <ul className={twMerge(
          "absolute left-0 right-0 mt-1 border rounded-lg shadow-lg",
          baseColor,
          "transition-transform ease-out",
          isOpen && "animate-top-down",
        )}>
          {options.map((option) => (
            <li
              key={option.value}
              className={twMerge(
                "px-4 py-2 cursor-pointer first:rounded-t-lg last:rounded-b-lg",
                accentColor,
              )}
              onClick={() => {
                onChange(option.value)
                setIsOpen(false)
              }}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
