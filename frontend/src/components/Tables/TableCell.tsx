import { twMerge } from "tailwind-merge"

export const TableCell = ({ 
    children, 
    className = "",
    isCategory = false
  }: { 
    children: React.ReactNode, 
    className?: string,
    isCategory?: boolean 
  }) => (
    <td className={twMerge(
      "px-2 py-6 text-sm whitespace-nowrap hidden md:table-cell lg:table-cell", 
      isCategory && "text-fg-tertiary", 
      className
    )}>
      {children}
    </td>
  )