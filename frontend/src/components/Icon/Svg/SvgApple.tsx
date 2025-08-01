import { SVGProps } from "react"

export const SvgApple = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={20}
      height={20}
      fill="#FFF"
      viewBox="0 0 50 50"
      {...props}
    >
      <path d="M44.527 34.75c-1.078 2.395-1.597 3.465-2.984 5.578-1.941 2.953-4.68 6.64-8.063 6.664-3.011.028-3.789-1.965-7.878-1.93-4.086.02-4.938 1.97-7.954 1.938-3.386-.031-5.976-3.352-7.918-6.3-5.43-8.27-6.003-17.966-2.648-23.122 2.375-3.656 6.129-5.805 9.656-5.805 3.594 0 5.852 1.973 8.82 1.973 2.883 0 4.637-1.976 8.794-1.976 3.14 0 6.46 1.71 8.836 4.664-7.766 4.257-6.504 15.347 1.34 18.316ZM31.195 8.469c1.512-1.942 2.66-4.68 2.242-7.469-2.464.168-5.347 1.742-7.03 3.781-1.528 1.86-2.794 4.617-2.302 7.285 2.692.086 5.477-1.52 7.09-3.597Z" />
    </svg>
  )
}
