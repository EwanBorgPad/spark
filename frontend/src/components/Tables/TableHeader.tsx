import { twMerge } from "tailwind-merge"

export const TableHeader = ({
    children,
    onClick,
    className = "",
  }: {
    children: React.ReactNode
    onClick?: () => void
    className?: string
    isCategory?: boolean
  }) => (
    <th
      className={twMerge(
        "text-left text-xs font-medium text-fg-tertiary tracking-wider px-2 py-3 w-[12%] hidden md:table-cell lg:table-cell",
        onClick && "cursor-pointer hover:bg-secondary/50 transition-colors",
        className
      )}
      onClick={onClick}
    >
      {children}
    </th>
  )