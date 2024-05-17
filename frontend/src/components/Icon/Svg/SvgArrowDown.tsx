import { SVGProps } from "react"

export const SvgArrowDown = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 21' {...props}>
    <path
      fill='currentColor'
      d='M8.666 3.107c0-.335-.298-.607-.666-.607-.368 0-.667.272-.667.607v9.338l-2.64-2.64a.667.667 0 0 0-.943.942l3.778 3.778c.26.26.683.26.943 0l3.778-3.778a.667.667 0 1 0-.943-.942l-2.64 2.64V3.106Z'
    />
  </svg>
)
