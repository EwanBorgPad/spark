import { HTMLProps } from "@/types/general"
import { forwardRef, PropsWithChildren, ReactNode, useMemo } from "react"
import { twMerge as classNames } from "tailwind-merge"
import { Icon } from "../Icon/Icon"

type ButtonColor = "primary" | "secondary" | "tertiary" | "danger" | "plain"
type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl"

type ButtonProps<T extends keyof JSX.IntrinsicElements> = {
  border?: boolean
  color?: ButtonColor
  size?: ButtonSize
  btnText?: string
  prefixElement?: PropsWithChildren["children"]
  suffixElement?: PropsWithChildren["children"]
  isLoading?: boolean
  iconWrapperClassName?: string
  textClassName?: string
  as?: string
} & Omit<HTMLProps<T>, "size" | "color">

type IconButtonWithLabelProps = {
  icon: Parameters<typeof Icon>[0]["icon"]
  iconWrapperClassName?: HTMLProps["className"]
} & ButtonProps<"button">

const BUTTON_COLOR_CLASS_NAMES: Record<ButtonColor, string> = {
  primary:
    "text-default bg-brand-primary active:bg-brand-secondary disabled:bg-opacity-50",
  secondary:
    "bg-default active:bg-secondary disabled:bg-opacity-50 text-fg-primary disabled:text-fg-primary/50 border border-bd-primary",
  tertiary:
    "text-white bg-secondary active:bg-tertiary disabled:bg-secondary disabled:bg-opacity-50 text-fg-primary",
  danger:
    "text-gray-500 bg-fg-error-primary disabled:bg-fg-error-primary text-fg-alt-default",
  plain:
    "text-white bg-transparent text-fg-primary active:bg-secondary disabled:text-fg-primary/50",
}

const BUTTON_SIZE_CLASS_NAMES: Record<ButtonSize, string> = {
  xs: "rounded-lg py-1.5 px-3 text-sm",
  sm: "rounded-lg py-2 px-2 text-sm",
  md: "rounded-xl py-2 px-3 text-base",
  lg: "rounded-xl py-3 px-4 text-base",
  xl: "rounded-xl py-4 px-4 text-[18px] leading-[24px]",
}

const ButtonRoot = forwardRef<HTMLButtonElement, ButtonProps<"button">>(
  (
    {
      color = "primary",
      size = "md",
      prefixElement,
      suffixElement,
      children,
      isLoading,
      textClassName,
      btnText,
      as,
      ...props
    },
    ref,
  ) => {
    const isDisabled = props.disabled || isLoading
    const prefixElementOrLoader = useMemo<ReactNode>(() => {
      if (isLoading)
        return (
          <Icon className={"animate-spin absolute left-4"} icon={"SvgLoader"} />
        )
      return prefixElement
    }, [isLoading, prefixElement])

    const className = classNames([
      "relative flex items-center justify-center  font-medium h-fit",
      "hover:opacity-85 active:scale-[98%]",
      "focus-visible:outline-offset-2 focus-visible:outline-2 focus-visible:outline-black",
      "disabled:cursor-not-allowed disabled:opacity-50",
      BUTTON_COLOR_CLASS_NAMES[color],
      BUTTON_SIZE_CLASS_NAMES[size],
      props.className,
    ])

    const contentClassName = classNames([
      "flex-grow min-w-0 truncate px-2",
      Boolean(prefixElementOrLoader) && "ml-2",
      Boolean(suffixElement) && "mr-2",
      textClassName,
    ])

    const Tag = (as ?? "button") as unknown as "button"

    return (
      <Tag
        type={"button"}
        {...props}
        disabled={isDisabled}
        className={className}
        ref={ref}
      >
        {prefixElementOrLoader}
        {btnText ? (
          <span className={contentClassName}>{btnText}</span>
        ) : (
          children
        )}
        {suffixElement}
      </Tag>
    )
  },
)
ButtonRoot.displayName = "ButtonRoot"

{
  /* @TODO - Finish this */
}
const IconButtonWithLabel = forwardRef<
  HTMLButtonElement,
  IconButtonWithLabelProps
>(({ icon, color, iconWrapperClassName, ...props }, ref) => {
  return (
    <Button
      className={"!p-0"}
      prefixElement={
        <div
          className={classNames(
            "flex h-9 w-9 items-center justify-center rounded-full",
            color && BUTTON_COLOR_CLASS_NAMES[color],
            iconWrapperClassName,
          )}
        >
          <Icon icon={icon} />
        </div>
      }
      {...props}
      ref={ref}
    />
  )
})
IconButtonWithLabel.displayName = "IconButtonWithLabel"

const IconButton = forwardRef<HTMLButtonElement, IconButtonWithLabelProps>(
  ({ icon, color, iconWrapperClassName, ...props }, ref) => {
    return (
      <Button
        {...props}
        className={classNames("!p-0", props.className)}
        ref={ref}
      >
        <div
          className={classNames(
            "flex h-9 w-9 items-center justify-center rounded-full",
            color && BUTTON_COLOR_CLASS_NAMES[color],
            iconWrapperClassName,
          )}
        >
          <Icon className={"h-[1em] w-[1em]"} icon={icon} />
        </div>
      </Button>
    )
  },
)

IconButton.displayName = "IconButton"

export const Button = Object.assign(ButtonRoot, {
  IconWithLabel: IconButtonWithLabel,
  Icon: IconButton,
})
