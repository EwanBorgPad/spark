import * as React from "react"
import { Button } from "../Button/Button"
import { twMerge } from "tailwind-merge"

type Props = {
  totalPages: number
  currentPage: number
  onPageClick: (pageNum: number) => void
}

const Pagination = ({ totalPages, currentPage, onPageClick }: Props) => {
  const pagesArray = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <div className="flex items-center gap-2 p-1 text-sm">
      <Button.Icon
        onClick={() => onPageClick(currentPage - 1)}
        icon="SvgChevronDown"
        color="plain"
        className="rotate-90 rounded-full"
        disabled={currentPage === 1}
      />
      <div className="flex items-center">
        {pagesArray.map((pageNumber) => (
          <Button
            btnText={pageNumber.toString()}
            key={pageNumber.toString()}
            color="plain"
            onClick={() => onPageClick(pageNumber)}
            className={twMerge(
              "rounded-full p-1",
              currentPage === pageNumber &&
                "bg-brand-primary text-brand-dimmed-1",
            )}
          />
        ))}
      </div>
      <Button.Icon
        onClick={() => onPageClick(currentPage + 1)}
        icon="SvgChevronDown"
        color="plain"
        className="-rotate-90 rounded-full"
        disabled={currentPage === totalPages}
      />
    </div>
  )
}

export default Pagination
