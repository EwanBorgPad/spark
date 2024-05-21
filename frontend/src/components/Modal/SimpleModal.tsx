import { ReactNode } from 'react'
import { Portal } from '@/components/Portal/Portal'
import { twMerge } from "tailwind-merge"
import { Icon } from "@/components/Icon/Icon.tsx"

type Props = {
  children: ReactNode
  onClose?: () => void
  className?: string
}
export function SimpleModal({ children, onClose, className }: Props) {
  const modalClasses = twMerge(
    'relative',
    'w-[460px]',
    'bg-secondary rounded-[10px] overflow-hidden',
    'border-solid border-1 border-bd-primary',
    className,
  )
  return <Portal id='simple-modal'>
    {/* fixed backdrop */}
    <div className='border-1 fixed z-20 inset-0 bg-overlay bg-opacity-75 transition-opacity'></div>

    {/* fixed modal container*/}
    <div className='fixed z-30 inset-0 overflow-y-auto'>
      {/*  */}
      <div className={'flex justify-center min-h-full items-center px-s md:px-[50px]'}>
        {/* modal */}
        <div className={modalClasses}>

          {onClose && <CloseButton onClose={onClose} />}

          { children }

        </div>
      </div>
    </div>
  </Portal>
}

const ICON_SIZE_PX = 12
const BTN_SIZE_PX = 20

export function CloseButton({ onClose, className = '' }: { onClose?: () => void, className?: string }) {
  const cls = twMerge(
    'absolute top-base right-base md:top-[20px] md:right-[30px]',
    'rounded-full',
    'flex items-center justify-center',
    'cursor-pointer',
    className
  )
  return <div
    style={{ width: BTN_SIZE_PX, height: BTN_SIZE_PX }}
    onClick={onClose}
    className={cls}>
    <Icon icon='SvgClose' width={ICON_SIZE_PX}
              height={ICON_SIZE_PX} />
  </div>
}
