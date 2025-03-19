import { twMerge } from "tailwind-merge"

import { Icon } from "../Icon/Icon"
import { Button } from "../Button/Button"
import { useProjectDataContext } from "@/hooks/useProjectData"

type Props = {
  className?: string
}

const DataRoom = ({ className }: Props) => {
  const { projectData } = useProjectDataContext()
  const info = projectData?.info

  return (
    <a className={twMerge("group", className)} target="_blank" rel="noreferrer" href={info?.dataRoom.url}>
      <Button
        btnText="Data Room"
        color="secondary"
        className="text-sm"
        suffixElement={<Icon icon="SvgExternalLink" className="text-xl text-fg-secondary " />}
      />
    </a>
  )
}

export default DataRoom
