import { format } from "date-fns/format"

export const formatDateForDisplay = (date: Date) => {
  return format(date, "do MMMM, yyyy")
}
export const formatDateForTimer = (date: Date) => {
  return format(date, "do MMMM, h a")
}
