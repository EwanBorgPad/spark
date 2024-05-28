import { useState } from "react"
import { Button } from "../Button/Button"
import { twMerge } from "tailwind-merge"

const InputValues = () => {
  const [isOpened, setIsOpen] = useState(false)
  return (
    <div className="absolute right-2 top-[70vh]">
      {isOpened ? (
        <div className="w-[300px] rounded-lg border-[1px] border-brand-primary bg-default p-4">
          <Button.Icon
            size="xl"
            color="plain"
            icon="SvgX"
            className="absolute right-0 top-0 bg-transparent"
            onClick={() => setIsOpen(false)}
          />
          <span className="text-base">Input Values</span>
        </div>
      ) : (
        <Button.Icon
          icon={"SvgChevronDown"}
          size="xl"
          color="primary"
          className={twMerge(
            "rounded-full bg-brand-primary",
            !isOpened && "rotate-90",
          )}
          onClick={() => setIsOpen(true)}
        />
      )}
    </div>
  )
}

export default InputValues
