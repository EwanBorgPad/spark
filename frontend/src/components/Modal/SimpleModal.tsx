import { ReactNode, useRef } from "react"
import { Portal } from "@/components/Portal/Portal"
import { twMerge } from "tailwind-merge"
import { Icon } from "@/components/Icon/Icon.tsx"
import { useCheckOutsideClick } from "@/hooks/useCheckOutsideClick.tsx"

type Props = {
  children: ReactNode
  showCloseBtn: boolean
  onClose?: () => void
  className?: string
}
export function SimpleModal({
  children,
  showCloseBtn,
  onClose,
  className,
}: Props) {
  const modalClasses = twMerge(
    "relative h-full",
    "w-[460px]",
    "bg-secondary lg:rounded-[10px] overflow-hidden",
    "border-solid border border-bd-primary animate-fade-in",
    className,
  )

  const modalRef = useRef<HTMLDivElement | null>(null)
  const backdropRef = useRef<HTMLDivElement | null>(null)

  const closeModalCallback = () => {
    modalRef.current?.classList.add("animate-fade-out")
    backdropRef.current?.classList.add("animate-fade-out")
    setTimeout(() => {
      onClose?.()
    }, 300)
  }

  useCheckOutsideClick(modalRef, () => closeModalCallback())

  return (
    <Portal id="simple-modal">
      {/* fixed backdrop */}
      <div
        ref={backdropRef}
        className="fixed inset-0 z-20 animate-fade-in bg-overlay bg-opacity-75"
      ></div>

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
            {onClose && showCloseBtn && (
              <CloseButton onClose={closeModalCallback} />
            )}

            {children}
          </div>
        </div>
      </div>
    </Portal>
  )
}

const ICON_SIZE_PX = 12
// const BTN_SIZE_PX = 20

export function CloseButton({
  onClose,
  className = "",
}: {
  onClose?: () => void
  className?: string
}) {
  const cls = twMerge(
    "absolute top-4 left-4",
    "rounded-md",
    "flex items-center justify-center",
    "cursor-pointer",
    "hover:bg-tertiary text-2xl text-white",
    className,
  )
  return (
    <div onClick={onClose} className={cls}>
      <Icon icon="SvgClose" width={ICON_SIZE_PX} height={ICON_SIZE_PX} />
    </div>
  )
}
