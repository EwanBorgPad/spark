import { SVGProps } from "react"

export const SvgDocument = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    viewBox="0 0 20 20"
    {...props}
  >
    <path d="M3.333 3.333A1.667 1.667 0 0 1 5 1.666h6.667c.22 0 .433.088.589.245l4.167 4.166a.833.833 0 0 1 .244.59v10A1.667 1.667 0 0 1 15 18.332H5a1.667 1.667 0 0 1-1.667-1.666V3.332Zm11.322 3.333-2.988-2.988v2.989h2.988ZM10 3.333H5v13.334h10V8.332h-4.166A.833.833 0 0 1 10 7.5V3.333Zm-3.333 7.5A.833.833 0 0 1 7.5 10h5a.833.833 0 1 1 0 1.666h-5a.833.833 0 0 1-.833-.833Zm0 3.333a.833.833 0 0 1 .833-.833h5a.834.834 0 0 1 0 1.667h-5a.834.834 0 0 1-.833-.834Z" />
  </svg>
)
