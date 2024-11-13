import { twMerge } from "tailwind-merge"
import { ReactNode, useEffect, useRef } from "react"
import { Portal } from "@/components/Portal/Portal"
import { Button } from "../Button/Button"
import { useCheckOutsideClick } from "@/hooks/useCheckOutsideClick.tsx"

type Props = {
  children: ReactNode
  showCloseBtn: boolean
  onClose?: () => void
  className?: string
  title?: string
}
export function SimpleModal({
  children,
  showCloseBtn,
  onClose,
  className,
  title,
}: Props) {
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

  useEffect(() => {
    document.body.style.overflow = "hidden" // disable document's scroll if modal is active

    return () => {
      document.body.style.overflow = ""
    }
  }, [])

  return (
    <Portal id="simple-modal">
      {/* fixed backdrop */}
      <div
        ref={backdropRef}
        className="fixed inset-0 z-20 animate-fade-in bg-overlay bg-opacity-75 px-5 backdrop-blur"
      ></div>

      {/* modal wrapper */}
      <div className="fixed inset-0 z-[30] flex h-screen w-screen items-center px-5 ">
        {/* modal */}
        <div
          ref={modalRef}
          className={twMerge(
            "mx-auto my-auto overflow-x-hidden overflow-y-scroll",
            "max-h-[95vh] w-[460px] max-w-[90vw]",
            "rounded-[10px] border border-solid border-bd-primary bg-secondary",
            "animate-fade-in",
            className,
          )}
        >
          <div className="sticky left-0 right-0 top-0 z-[31] grid w-full grid-cols-modal-header grid-rows-1 items-start bg-transparent p-4 text-center">
            {onClose && showCloseBtn && <CloseButton onClose={closeModalCallback} />}
            {title && <h1 className="flex-1 text-body-xl-semibold text-white">{title}</h1>}
          </div>

          {children}
        </div>
      </div>
    </Portal>
  )
}

export function CloseButton({
  onClose,
  className = "",
}: {
  onClose?: () => void
  className?: string
}) {
  return (
    <Button.Icon
      icon="SvgClose"
      color="plain"
      className={twMerge(
        "rounded-md px-2 py-0.5 align-top text-2xl leading-none text-white hover:bg-tertiary",
        className,
      )}
      onClick={onClose}
    />
  )
}
