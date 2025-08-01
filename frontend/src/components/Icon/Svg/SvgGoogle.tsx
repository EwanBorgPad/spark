import { SVGProps } from "react"

export const SvgGoogle = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={20}
      height={20}
      fill="#FFF"
      viewBox="0 0 50 50"
      {...props}
    >
      <path d="M25.996 48C13.313 48 2.992 37.684 2.992 25S13.312 2 25.996 2a22.954 22.954 0 0 1 15.492 5.996l.774.707-7.586 7.586-.703-.602a12.277 12.277 0 0 0-7.977-2.957c-6.766 0-12.273 5.504-12.273 12.27s5.507 12.27 12.273 12.27c4.879 0 8.734-2.493 10.55-6.739h-11.55V20.176l22.55.031.169.793c1.176 5.582.234 13.793-4.531 19.668C39.238 45.531 33.457 48 25.996 48Z" />
    </svg>
  )
}
