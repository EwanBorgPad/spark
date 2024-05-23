import { ReactNode, useRef } from "react"
import { Portal } from "@/components/Portal/Portal"
import { twMerge } from "tailwind-merge"
import { Icon } from "@/components/Icon/Icon.tsx"
import { useCheckOutsideClick } from "@/hooks/useCheckOutsideClick.tsx"

type Props = {
  children: ReactNode
  onClose?: () => void
  className?: string
}
export function SimpleModal({ children, onClose, className }: Props) {
  const modalClasses = twMerge(
    "relative h-full",
    "w-[460px]",
    "bg-secondary lg:rounded-[10px] overflow-hidden",
    "border-solid border border-bd-primary",
    className,
  )

  const modalRef = useRef<HTMLDivElement | null>(null)
  useCheckOutsideClick(modalRef, () => onClose?.())

  return (
    <Portal id="simple-modal">
      {/* fixed backdrop */}
      <div className="fixed inset-0 z-20 bg-overlay bg-opacity-75 transition-opacity"></div>

      {/* fixed modal container*/}
      <div className="fixed inset-0 z-30 overflow-y-auto">
        {/*  */}
        <div
          className={
            "px-s flex min-h-full items-center justify-center max-sm:h-full md:px-[50px]"
          }
        >
          {/* modal */}
          <div ref={modalRef} className={modalClasses}>
            {onClose && <CloseButton onClose={onClose} />}

            {children}
          </div>
        </div>
      </div>
    </Portal>
  )
}

const ICON_SIZE_PX = 12
const BTN_SIZE_PX = 20

export function CloseButton({
  onClose,
  className = "",
}: {
  onClose?: () => void
  className?: string
}) {
  const cls = twMerge(
    "absolute top-5 max-sm:left-4 md:right-6",
    "rounded-full",
    "flex items-center justify-center",
    "cursor-pointer",
    className,
  )
  return (
    <div
      style={{ width: BTN_SIZE_PX, height: BTN_SIZE_PX }}
      onClick={onClose}
      className={cls}
    >
      <Icon icon="SvgClose" width={ICON_SIZE_PX} height={ICON_SIZE_PX} />
    </div>
  )
}
