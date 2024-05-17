import { twMerge } from "tailwind-merge"

type Props = {
  imgUrl: string
  size: "large" | "medium"
}

const avatarSize: Record<Props["size"], string> = {
  medium: "w-10 h-10",
  large: "w-[80px] h-[80px]",
}

const Avatar = ({ imgUrl, size = "large" }: Props) => {
  return (
    <img
      src={imgUrl}
      className={twMerge(
        "h-[80px] w-[80px] rounded-full object-cover",
        avatarSize[size],
      )}
    />
  )
}

export default Avatar
