import { SVGProps } from "react"

export const SvgArrowLeft = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    {...props}
  >
    <g id="arrow-left">
      <path
        id="Vector"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.7071 5.29289C11.3166 4.90237 10.6834 4.90237 10.2929 5.29289L4.29289 11.2929C3.90237 11.6834 3.90237 12.3166 4.29289 12.7071L10.2929 18.7071C10.6834 19.0976 11.3166 19.0976 11.7071 18.7071C12.0976 18.3166 12.0976 17.6834 11.7071 17.2929L7.41421 13H19C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11H7.41421L11.7071 6.70711C12.0976 6.31658 12.0976 5.68342 11.7071 5.29289Z"
        fill="#F5F5F6"
      />
    </g>
  </svg>
)
