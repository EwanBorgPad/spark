import { format } from "date-fns/format"

export const formatDateForDisplay = (date: Date) => {
  return format(date, "do MMMM, yyyy")
}
