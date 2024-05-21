import { SVGProps } from "react"

export const SvgLoader = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <circle
      cx={12}
      cy={12}
      r={10}
      fill={"none"}
      stroke="#77777f"
      strokeWidth={3}
    />
    <circle
      cx={12}
      cy={12}
      r={10}
      fill={"none"}
      stroke="#ffffff"
      strokeWidth={3}
      strokeDasharray={25}
    />
  </svg>
)
